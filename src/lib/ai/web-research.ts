// ---------------------------------------------------------------------------
// Perplexity Web Research Layer
// Uses Perplexity's Responses API (agent) for deep web research
// and Search API for targeted company lookups
// ---------------------------------------------------------------------------

export interface WebResearchResult {
  companyIntel: string;
  recentNews: string[];
  fundingHistory: string;
  competitiveLandscape: string;
  keyPeople: string;
  clinicalPipeline: string;
  rawResponse: string;
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

  try {
    // Use Perplexity Responses API (agent mode) for comprehensive research
    const agentResponse = await fetch('https://api.perplexity.ai/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preset: 'fast-search',
        input: `Research this life sciences company for M&A advisory evaluation. Provide factual, specific information with dates and numbers:

Company: ${companyName}
Sector: ${sector}
Context: ${description}

I need:
1. Company overview — what they do, founding date, headquarters
2. Recent news (last 6 months) — press releases, announcements
3. Funding history — rounds, amounts, key investors, dates
4. Clinical/product pipeline — active programs, regulatory status, key milestones
5. Key executives — CEO, CSO, VP BD, board members and their backgrounds
6. Competitive landscape — main competitors, market positioning
7. Any M&A, licensing, or partnership activity`,
      }),
    });

    if (!agentResponse.ok) {
      console.error('[Web Research] Perplexity agent API error:', agentResponse.status);
      // Fall back to search API
      return await searchFallback(apiKey, companyName, sector);
    }

    const agentData = await agentResponse.json();
    const rawText = agentData.output || agentData.text || agentData.content || '';

    // Also run a targeted search for recent news
    const searchResponse = await fetch('https://api.perplexity.ai/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `${companyName} ${sector} latest news funding deals partnerships 2025 2026`,
        max_results: 5,
        max_tokens_per_page: 512,
      }),
    });

    let newsItems: string[] = [];
    let sources: string[] = [];

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.results) {
        newsItems = searchData.results.map((r: { title?: string; snippet?: string }) =>
          r.title || r.snippet || ''
        ).filter(Boolean).slice(0, 5);
        sources = searchData.results.map((r: { url?: string }) => r.url || '').filter(Boolean);
      }
    }

    // Parse the agent response into structured fields
    return parseResearchResponse(rawText, newsItems, sources);
  } catch (error) {
    console.error('[Web Research] Error:', error);
    return null;
  }
}

async function searchFallback(
  apiKey: string,
  companyName: string,
  sector: string
): Promise<WebResearchResult | null> {
  try {
    const response = await fetch('https://api.perplexity.ai/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `${companyName} ${sector} company overview funding pipeline executives news`,
        max_results: 5,
        max_tokens_per_page: 512,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const results = data.results || [];
    const combined = results.map((r: { snippet?: string }) => r.snippet || '').join('\n');
    const sources = results.map((r: { url?: string }) => r.url || '').filter(Boolean);

    return {
      companyIntel: combined.slice(0, 500),
      recentNews: results.map((r: { title?: string }) => r.title || '').filter(Boolean),
      fundingHistory: '',
      competitiveLandscape: '',
      keyPeople: '',
      clinicalPipeline: '',
      rawResponse: combined,
      sources,
      searchTimestamp: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function parseResearchResponse(
  rawText: string,
  newsItems: string[],
  sources: string[]
): WebResearchResult {
  // Extract sections from the response using simple heuristics
  const sections = {
    companyIntel: '',
    fundingHistory: '',
    competitiveLandscape: '',
    keyPeople: '',
    clinicalPipeline: '',
  };

  const lower = rawText.toLowerCase();

  // Try to extract sections based on keywords
  const fundingIdx = lower.indexOf('funding');
  const pipelineIdx = lower.indexOf('pipeline') !== -1 ? lower.indexOf('pipeline') : lower.indexOf('clinical');
  const executiveIdx = lower.indexOf('executive') !== -1 ? lower.indexOf('executive') : lower.indexOf('ceo');
  const competitiveIdx = lower.indexOf('competitive') !== -1 ? lower.indexOf('competitive') : lower.indexOf('competitor');

  // Simple extraction — take the paragraph around each keyword
  if (fundingIdx > -1) {
    const start = Math.max(0, rawText.lastIndexOf('\n', fundingIdx));
    const end = rawText.indexOf('\n\n', fundingIdx + 10) || rawText.length;
    sections.fundingHistory = rawText.slice(start, Math.min(end, start + 500)).trim();
  }

  if (pipelineIdx > -1) {
    const start = Math.max(0, rawText.lastIndexOf('\n', pipelineIdx));
    const end = rawText.indexOf('\n\n', pipelineIdx + 10) || rawText.length;
    sections.clinicalPipeline = rawText.slice(start, Math.min(end, start + 500)).trim();
  }

  if (executiveIdx > -1) {
    const start = Math.max(0, rawText.lastIndexOf('\n', executiveIdx));
    const end = rawText.indexOf('\n\n', executiveIdx + 10) || rawText.length;
    sections.keyPeople = rawText.slice(start, Math.min(end, start + 500)).trim();
  }

  if (competitiveIdx > -1) {
    const start = Math.max(0, rawText.lastIndexOf('\n', competitiveIdx));
    const end = rawText.indexOf('\n\n', competitiveIdx + 10) || rawText.length;
    sections.competitiveLandscape = rawText.slice(start, Math.min(end, start + 500)).trim();
  }

  // Company intel = first paragraph or first 500 chars
  sections.companyIntel = rawText.slice(0, rawText.indexOf('\n\n') > 0 ? rawText.indexOf('\n\n') : 500).trim();

  return {
    ...sections,
    recentNews: newsItems.length > 0 ? newsItems : [],
    rawResponse: rawText,
    sources,
    searchTimestamp: new Date().toISOString(),
  };
}
