import { NextRequest, NextResponse } from 'next/server';
import { screenOpportunity, type ScreeningInput } from '@/lib/scoring/opportunity-screening';

interface ScreeningRequestBody {
  // Context (not scored)
  opportunityName?: string;
  companyName?: string;
  therapyArea?: string;
  dealType?: string;
  estimatedDealSize?: number;

  // Screening inputs
  screening: ScreeningInput;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ScreeningRequestBody;

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a valid object' },
        { status: 400 }
      );
    }

    if (!body.screening || typeof body.screening !== 'object') {
      return NextResponse.json(
        { error: 'screening object is required' },
        { status: 400 }
      );
    }

    const { screening } = body;

    // Validate required fields
    const requiredFields: (keyof ScreeningInput)[] = [
      'therapyAreaAlignment',
      'dealTypeExperience',
      'clientProfile',
      'estimatedDealSize',
      'retainerLikelihood',
      'successFeeProbability',
      'relationshipWithDecisionMaker',
      'competitiveSituation',
      'referralQuality',
      'teamCapacity',
      'complexity',
      'timeline',
    ];

    for (const field of requiredFields) {
      if (screening[field] === undefined || screening[field] === null) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    if (typeof screening.estimatedDealSize !== 'number' || screening.estimatedDealSize < 0) {
      return NextResponse.json(
        { error: 'estimatedDealSize must be a non-negative number (in millions USD)' },
        { status: 400 }
      );
    }

    const result = screenOpportunity(screening);

    return NextResponse.json({
      context: {
        opportunityName: body.opportunityName || null,
        companyName: body.companyName || null,
        therapyArea: body.therapyArea || null,
        dealType: body.dealType || null,
        estimatedDealSize: body.estimatedDealSize || screening.estimatedDealSize,
      },
      result,
      screenedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Screening API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to screen opportunity' },
      { status: 500 }
    );
  }
}
