import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';
import { checkRateLimit } from '@/lib/rate-limit';
import Anthropic from '@anthropic-ai/sdk';

interface GenerateRequest {
  companyName: string;
  therapyArea: string;
  indication: string;
  analyses: string[];
  outputFormat: 'pdf' | 'pptx' | 'in_app';
  confidentiality: 'confidential' | 'highly_confidential';
}

const ANALYSIS_META: Record<string, { title: string; prompt: string }> = {
  market_sizing: {
    title: 'Market Sizing',
    prompt: 'Provide a detailed market sizing analysis including TAM, SAM, SOM projections, patient population estimates, geographic breakdown, and CAGR. Include specific dollar figures and growth drivers.',
  },
  competitive_landscape: {
    title: 'Competitive Landscape',
    prompt: 'Analyze the competitive landscape including number of competitors by clinical stage, mechanism differentiation, white space opportunities, and competitive positioning assessment.',
  },
  regulatory_pathway: {
    title: 'Regulatory Pathway',
    prompt: 'Recommend the optimal regulatory pathway (505(b)(1), 505(b)(2), BLA, etc.), potential designations (Fast Track, Breakthrough, Orphan), timeline estimates, and key risk factors.',
  },
  deal_valuation: {
    title: 'Deal Valuation',
    prompt: 'Provide deal valuation based on comparable transactions, including expected upfront payment, milestone structure, royalty ranges, and total deal value. Reference specific comparable deals where possible.',
  },
  sensitivity_analysis: {
    title: 'Sensitivity Analysis',
    prompt: 'Run sensitivity analysis across key variables (pricing, market share, launch timing, success probability). Provide base, bull, and bear case NPVs with probability-adjusted values.',
  },
  clinical_pipeline: {
    title: 'Clinical Pipeline',
    prompt: 'Analyze the clinical pipeline including active trials, enrollment status, expected readout dates, and success probability estimates. Include competitive trial landscape.',
  },
  partner_discovery: {
    title: 'Partner Discovery',
    prompt: 'Identify potential strategic partners based on therapeutic area overlap, pipeline gaps, geographic presence, and recent M&A activity. Rank by strategic fit score.',
  },
  pricing_intelligence: {
    title: 'Pricing Intelligence',
    prompt: 'Analyze comparable drug pricing including WAC ranges, net pricing after rebates, gross-to-net discounts, payer mix breakdown, and value-based contracting opportunities.',
  },
  patent_ip_landscape: {
    title: 'Patent & IP Landscape',
    prompt: 'Analyze the patent landscape including key patents (composition, method, formulation), expiration dates, freedom-to-operate assessment, and regulatory exclusivity timeline.',
  },
  company_deep_dive: {
    title: 'Company Deep Dive',
    prompt: 'Provide comprehensive company analysis including team background, cash position, runway, capitalization, institutional investors, recent hires, and strategic direction signals.',
  },
};

async function generateSection(
  anthropic: Anthropic,
  analysisType: string,
  companyName: string,
  therapyArea: string,
  indication: string,
): Promise<{ type: string; title: string; content: string; metrics: Record<string, string | number> } | null> {
  const meta = ANALYSIS_META[analysisType];
  if (!meta) return null;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: `You are a life sciences M&A advisory analyst at Ambrosia Ventures. Generate institutional-quality intelligence reports with specific data points, dollar figures, and actionable insights. Be concise but comprehensive. Use specific numbers, not ranges where possible. Do not use hedging language. Write as if presenting to a Partner at an advisory firm.

Format your response as two sections separated by "---METRICS---":
1. First section: A 3-5 sentence analytical paragraph with specific data points.
2. Second section: Key metrics as key: value pairs, one per line. Use 3-6 metrics. Values should be concise (e.g., "$14.2B", "12", "High", "Q3 2026").`,
    messages: [{
      role: 'user',
      content: `Company: ${companyName}\nTherapy Area: ${therapyArea || 'Not specified'}\nIndication: ${indication || 'Not specified'}\n\n${meta.prompt}`,
    }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  const parts = text.split('---METRICS---');
  const content = parts[0].trim();
  const metricsText = parts[1]?.trim() ?? '';

  const metrics: Record<string, string | number> = {};
  for (const line of metricsText.split('\n')) {
    const [key, ...valParts] = line.split(':');
    if (key && valParts.length > 0) {
      const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
      metrics[cleanKey] = valParts.join(':').trim();
    }
  }

  return { type: analysisType, title: meta.title, content, metrics };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimit = checkRateLimit(user.id, 'intelligence');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before generating another report.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)) } }
      );
    }

    const body: GenerateRequest = await request.json();

    if (!body.companyName || !body.analyses || body.analyses.length === 0) {
      return NextResponse.json(
        { error: 'companyName and at least one analysis type are required.' },
        { status: 400 },
      );
    }

    const validTypes = Object.keys(ANALYSIS_META);
    const invalidTypes = body.analyses.filter(a => !validTypes.includes(a));
    if (invalidTypes.length > 0) {
      return NextResponse.json(
        { error: `Invalid analysis types: ${invalidTypes.join(', ')}` },
        { status: 400 },
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Intelligence engine not configured. Set ANTHROPIC_API_KEY.' },
        { status: 503 },
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const sections = await Promise.all(
      body.analyses.map(type =>
        generateSection(anthropic, type, body.companyName, body.therapyArea, body.indication)
      )
    );

    const reportId = randomUUID();

    await supabase.from('research_notes').insert({
      title: `${body.companyName} — Advisory Intelligence Report`,
      content: sections.filter(Boolean).map(s => `## ${s!.title}\n\n${s!.content}`).join('\n\n---\n\n'),
      note_type: 'company_deep_dive',
      ai_generated: true,
      ai_sources: { analyses: body.analyses, model: 'claude-sonnet-4-20250514' },
      therapy_area: body.therapyArea || null,
      tags: [body.companyName.toLowerCase(), body.therapyArea].filter(Boolean),
      author_id: user.id,
    }).select().single();

    const report = {
      reportId,
      title: `${body.companyName} — Advisory Intelligence Report`,
      sections: sections.filter(Boolean),
      generatedAt: new Date().toISOString(),
      estimatedConfidence: body.analyses.length >= 5 ? 'high' : 'medium',
    };

    return NextResponse.json(report);
  } catch (err) {
    console.error('POST /api/intelligence/generate error:', err);
    return NextResponse.json(
      { error: 'Failed to generate report. Please try again.' },
      { status: 500 },
    );
  }
}
