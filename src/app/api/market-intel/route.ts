import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 503 });

  const { companyName, therapyAreas, indications, leadAsset, leadAssetPhase } = await request.json();

  const anthropic = new Anthropic({ apiKey });
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: 'You are a life sciences market intelligence analyst specializing in biopharma M&A advisory. Return ONLY valid JSON with no markdown formatting, no code fences, no explanation.',
    messages: [{
      role: 'user',
      content: `Generate market intelligence estimates for this biopharma company. Use your knowledge of real market data and clinical landscapes to produce credible estimates.

Company: ${companyName}
Therapy Areas: ${therapyAreas?.join(', ') || 'Not specified'}
Indications: ${indications?.join(', ') || 'Not specified'}
Lead Asset: ${leadAsset || 'Not specified'}
Phase: ${leadAssetPhase || 'Not specified'}

Return a JSON object with exactly these fields:
{
  "tam": "$X.XB" (total addressable market for their primary indication),
  "competitors": "N active programs" (number of competing clinical programs in same indication),
  "loa": "XX%" (likelihood of approval from current phase to market, based on historical rates),
  "peakRevenue": "$X.XB" (estimated peak annual revenue if approved),
  "summary": "2-3 sentence market overview covering competitive positioning, key risks, and strategic rationale"
}`
    }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  try {
    const match = text.match(/\{[\s\S]*\}/);
    const data = match ? JSON.parse(match[0]) : null;
    if (!data) {
      return NextResponse.json({ error: 'No valid JSON in response' }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
  }
}
