export type ScoreBucket =
  | 'hot_lead'
  | 'warm'
  | 'cold'
  | 'follow_up'
  | 'strategic_watch'
  | 'nurture';

export type ServiceNeed = 'ma' | 'licensing' | 'partnership' | 'fundraising' | 'strategy';

export type DealReadinessSignal =
  | 'hiring_bd'
  | 'board_changes'
  | 'new_cfo'
  | 'restructuring'
  | 'pipeline_readout';

export type CompetitiveDensity = 'low' | 'medium' | 'high';

export type RecentNewsSignal = 'positive' | 'neutral' | 'negative';

export type CompanyStage =
  | 'seed'
  | 'series_a'
  | 'series_b'
  | 'series_c'
  | 'growth'
  | 'public';

export type LeadAssetPhase =
  | 'preclinical'
  | 'phase_1'
  | 'phase_1_2'
  | 'phase_2'
  | 'phase_2_3'
  | 'phase_3'
  | 'approved';

export type RelationshipLevel = 'warm_intro' | 'direct' | 'met_once' | 'cold';

export interface ScoringInput {
  // Company attributes
  companyStage: CompanyStage | string | null;
  therapyAreas: string[];
  leadAssetPhase: LeadAssetPhase | string | null;
  totalFunding: number | null;
  lastFundingDate: string | null;
  employeeCount: string | null;
  foundedYear: number | null;

  // Relationship attributes
  relationshipStrength: RelationshipLevel | string;
  hasExistingContacts: boolean;
  lastContactedDaysAgo: number | null;

  // Market attributes
  competitiveDensity: CompetitiveDensity | null;
  upcomingCatalysts: boolean;
  recentNews: RecentNewsSignal | null;

  // Advisory fit
  likelyServiceNeed: ServiceNeed[];
  dealReadinessSignals: string[];
}

export interface ScoreBreakdown {
  companyFit: number;       // 0-25
  relationshipStrength: number; // 0-25
  marketTiming: number;     // 0-25
  advisoryOpportunity: number;  // 0-25
}

export interface ScoringResult {
  score: number; // 0-100
  bucket: ScoreBucket;
  followUpDate: string | null;
  reasoning: string[];
  breakdown: ScoreBreakdown;
  suggestedAction: string;
}

export interface ScoreBadgeProps {
  score: number;
  bucket: ScoreBucket | string;
  size?: 'sm' | 'md' | 'lg';
  breakdown?: ScoreBreakdown;
}
