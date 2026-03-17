import OpenAI from 'openai';

// ---------------------------------------------------------------------------
// Perplexity Web Research Layer
// Real-time web intelligence on companies and markets
// ---------------------------------------------------------------------------

export interface WebResearchResult {
  companyIntel: string;
  recentNews: string[];
  fundingHistory: string;
  competitiveLandscape: string;
  keyPeople: string;
  clinicalPipeline: string;
  sources: string[];
  searchTimestamp: string;
}

export async function researchCompany(
  companyName: string,
  sector: string,
  description: string
): Promise<WebResearchResult | null> {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    return null;
  }

  const perplexity = new OpenAI({
    apiKey,
    baseURL: 'https://api.perplexity.ai',
  });

  try {
    const response = await perplexity.chat.completions.create({
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: `You are a life sciences M&A research analyst. Provide concise, factual intelligence on companies for deal evaluation. Focus on: recent news, funding history, clinical pipeline, key executives, competitive positioning, and any M&A/partnership activity. Be specific with numbers, dates, and names. If information is unavailable, say so clearly.

Respond ONLY with valid JSON matching this schema:
{
  "companyIntel": "<1 paragraph overview of the company, what they do, their position>",
  "recentNews": ["<recent news item 1 with date>", "<recent news item 2>"],
  "fundingHistory": "<funding rounds, amounts, key investors>",
  "competitiveLandscape": "<key competitors, market position, differentiation>",
  "keyPeople": "<CEO, CSO, VP BD and their backgrounds>",
  "clinicalPipeline": "<active programs, phases, key readouts>",
  "sources": ["<source URL 1>", "<source URL 2>"]
}`
        },
        {
          role: 'user',
          content: `Research this company for M&A advisory evaluation:

Company: ${companyName}
Sector: ${sector}
Context: ${description}

Provide comprehensive intelligence including recent news, funding, pipeline, key people, and competitive landscape.`
        },
      ],
      max_tokens: 1500,
    });

    const text = response.choices[0]?.message?.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      companyIntel: parsed.companyIntel || '',
      recentNews: parsed.recentNews || [],
      fundingHistory: parsed.fundingHistory || '',
      competitiveLandscape: parsed.competitiveLandscape || '',
      keyPeople: parsed.keyPeople || '',
      clinicalPipeline: parsed.clinicalPipeline || '',
      sources: parsed.sources || [],
      searchTimestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Web Research] Perplexity error:', error);
    return null;
  }
}
