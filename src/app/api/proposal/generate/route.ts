import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 503 });

  const body = await request.json();
  const { companyName, sector, therapyArea, dealSize, notes, engagementType, documentSummaries } = body;

  const anthropic = new Anthropic({ apiKey });

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: `You are a senior M&A advisory proposal specialist at Ambrosia Ventures, a life sciences strategy and M&A advisory firm. Generate institutional-quality engagement proposals with specific commercial terms, timelines, and deliverables. Use concrete dollar amounts for fees based on the Lehman formula and industry benchmarks. Be specific, not generic.`,
    messages: [{
      role: 'user',
      content: `Generate a preliminary engagement proposal for the following opportunity:

Company: ${companyName}
Sector: ${sector}
Therapy Area: ${therapyArea || 'Not specified'}
Estimated Deal Size: $${dealSize}M
Engagement Type: ${engagementType}

Context/Notes:
${notes || 'No additional context provided'}

${documentSummaries ? `Document Summaries:\n${documentSummaries}` : ''}

Generate a complete proposal with these sections (use ---SECTION--- as delimiter between sections):

1. EXECUTIVE SUMMARY — 2-3 paragraphs summarizing the opportunity, why Ambrosia is positioned to advise, and the recommended approach.

2. SCOPE OF WORK — Specific deliverables as a bulleted list. Include 8-12 concrete deliverables.

3. TIMELINE — Phase-based timeline with specific week ranges. Include 4-5 phases.

4. COMMERCIAL TERMS — Fee structure including:
   - Monthly retainer amount
   - Success fee (as % of transaction value, using modified Lehman formula)
   - Expense cap
   - Payment terms
   - Exclusivity period
   Base fees on the deal size and engagement type. Be specific with dollar amounts.

5. KEY ASSUMPTIONS AND RISKS — 5-7 bullet points of assumptions and risks.

6. NEXT STEPS — 4-5 specific action items with owners and deadlines.`
    }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  const sections = text.split('---SECTION---').map(s => s.trim()).filter(Boolean);

  // Parse into structured sections
  const sectionNames = ['Executive Summary', 'Scope of Work', 'Timeline', 'Commercial Terms', 'Key Assumptions & Risks', 'Next Steps'];
  const proposal = sectionNames.map((name, i) => ({
    title: name,
    content: sections[i] || text, // fallback to full text if parsing fails
  }));

  return NextResponse.json({ proposal, generatedAt: new Date().toISOString() });
}
