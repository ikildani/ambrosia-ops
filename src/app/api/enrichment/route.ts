import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyName, companyType } = await request.json();

    if (!companyName) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const perplexityKey = process.env.PERPLEXITY_API_KEY;

    if (!anthropicKey) {
      return NextResponse.json({ error: 'Enrichment service not configured' }, { status: 503 });
    }

    let rawResearch = '';
    let citations: string[] = [];

    if (perplexityKey) {
      try {
        const perplexityRes = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'sonar',
            messages: [{
              role: 'user',
              content: `Research this company for M&A advisory: ${companyName}${companyType ? ` (${companyType})` : ''}. Include: overview, founding year, HQ, employees, funding, lead asset, therapy areas, recent news, competitors, upcoming catalysts, market sentiment. Be specific with numbers and dates.`,
            }],
            max_tokens: 2000,
            temperature: 0.1,
          }),
        });
        if (perplexityRes.ok) {
          const data = await perplexityRes.json();
          rawResearch = data.choices?.[0]?.message?.content || '';
          citations = data.citations || [];
        }
      } catch {
        // fall through to Claude-only
      }
    }

    const anthropic = new Anthropic({ apiKey: anthropicKey });

    const parseResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: 'You are a life sciences company research assistant. Return ONLY valid JSON with no explanation, markdown, or code fences.',
      messages: [{
        role: 'user',
        content: rawResearch
          ? `Parse this company research into structured fields. Return a JSON object. Use null for unknown fields.\n\nResearch:\n${rawResearch}`
          : `Research the company "${companyName}"${companyType ? ` (sector: ${companyType})` : ''} using your training data. Return a structured JSON object with everything you know. Use null for fields you're uncertain about.`,
      }, {
        role: 'user',
        content: `Return this exact JSON structure:
{
  "website": "string or null",
  "hq_city": "string or null",
  "hq_country": "string or null",
  "founded_year": "number or null",
  "employee_range": "string or null — e.g. '51-200', '201-500'",
  "stage": "string or null — one of: seed, series_a, series_b, series_c, growth, public",
  "total_funding": "number or null — USD amount as number",
  "last_funding_date": "string or null — YYYY-MM-DD",
  "lead_asset": "string or null",
  "lead_asset_phase": "string or null — e.g. 'Phase 2', 'Approved'",
  "therapy_areas": ["lowercase strings — oncology, neurology, etc"],
  "indications": ["specific disease names"],
  "description": "2-3 sentence description",
  "has_catalysts": true/false,
  "catalyst_description": "string or null",
  "market_position": "low, moderate, or high",
  "news_sentiment": "positive, neutral, or negative",
  "recent_news": ["recent headlines"],
  "competitors": ["competitor names"],
  "key_people": ["Name — Title"]
}`,
      }],
    });

    const parseText = parseResponse.content[0].type === 'text' ? parseResponse.content[0].text : '';

    let enrichedData;
    try {
      const jsonMatch = parseText.match(/\{[\s\S]*\}/);
      enrichedData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      enrichedData = null;
    }

    if (!enrichedData) {
      return NextResponse.json({ error: 'Failed to parse research data' }, { status: 500 });
    }

    await supabase.from('enrichment_cache').upsert({
      entity_type: 'organization',
      entity_name: companyName.toLowerCase(),
      data: { ...enrichedData, raw_research: rawResearch, citations },
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: 'entity_type,entity_name' }).select();

    return NextResponse.json({
      data: enrichedData,
      sources: citations,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Enrichment] Error:', err);
    return NextResponse.json({ error: 'Enrichment failed' }, { status: 500 });
  }
}
