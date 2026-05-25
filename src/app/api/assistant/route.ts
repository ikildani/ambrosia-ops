import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are Ambrosia AI, the internal advisory intelligence assistant for Ambrosia Ventures — a life sciences strategy and M&A advisory firm.

You have access to the team's CRM data including companies, contacts, deals, and activities. Use this context to give specific, data-driven answers.

Guidelines:
- Be concise and institutional in tone. No emojis. No filler.
- Use markdown formatting: **bold** for emphasis, bullet lists for structure.
- When referencing deals, include stage, estimated value, and deal type.
- When referencing contacts, include their title and relationship strength.
- When referencing companies, include their type and therapy areas.
- If asked to draft something (email, memo, analysis), produce a complete draft.
- If the data doesn't support a confident answer, say so rather than guessing.
- Format financial figures with $ and M/B suffixes.

You are speaking to an Ambrosia Ventures team member (Partner, VP, or Analyst).`;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI assistant not configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { messages: chatMessages } = body;

    if (!chatMessages || !Array.isArray(chatMessages)) {
      return new Response(JSON.stringify({ error: 'Messages array required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const [dealsResult, orgsResult, contactsResult, activitiesResult] = await Promise.all([
      supabase.from('deals').select('title, stage, deal_type, estimated_value, therapy_area, priority, company_id, organizations(name)').order('created_at', { ascending: false }).limit(15),
      supabase.from('organizations').select('name, type, therapy_areas, stage, targeting_score').order('created_at', { ascending: false }).limit(20),
      supabase.from('contacts').select('first_name, last_name, title, contact_type, relationship_strength, last_contacted_at, organizations(name)').order('created_at', { ascending: false }).limit(20),
      supabase.from('activities').select('subject, activity_type, occurred_at').order('occurred_at', { ascending: false }).limit(10),
    ]);

    const crmContext = `
## Current CRM Data

### Active Deals (${dealsResult.data?.length ?? 0})
${dealsResult.data?.map(d => `- **${d.title}** — ${(d as any).organizations?.name ?? 'Unknown'} | ${d.deal_type} | Stage: ${d.stage} | Value: ${d.estimated_value ? `$${(d.estimated_value / 1_000_000).toFixed(0)}M` : 'TBD'} | Priority: ${d.priority} | TA: ${d.therapy_area ?? 'N/A'}`).join('\n') ?? 'No deals found.'}

### Companies (${orgsResult.data?.length ?? 0})
${orgsResult.data?.map(o => `- **${o.name}** — ${o.type} | TAs: ${o.therapy_areas?.join(', ') ?? 'N/A'} | Stage: ${o.stage ?? 'N/A'} | Score: ${o.targeting_score ?? 'N/A'}`).join('\n') ?? 'No companies found.'}

### Contacts (${contactsResult.data?.length ?? 0})
${contactsResult.data?.map(c => `- **${c.first_name} ${c.last_name}** — ${c.title ?? ''} at ${(c as any).organizations?.name ?? 'Unknown'} | ${c.contact_type} | Relationship: ${c.relationship_strength} | Last contacted: ${c.last_contacted_at ?? 'Never'}`).join('\n') ?? 'No contacts found.'}

### Recent Activity
${activitiesResult.data?.map(a => `- ${a.subject} (${a.activity_type}) — ${new Date(a.occurred_at).toLocaleDateString()}`).join('\n') ?? 'No recent activity.'}
`;

    const anthropic = new Anthropic({ apiKey });

    const formattedMessages = chatMessages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    if (formattedMessages.length > 0 && formattedMessages[0].role === 'user') {
      formattedMessages[0].content = `${crmContext}\n\n---\n\nUser question: ${formattedMessages[0].content}`;
    }

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: formattedMessages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('POST /api/assistant error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
