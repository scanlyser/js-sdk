export type ScanStatus =
  | 'pending'
  | 'crawling'
  | 'analysing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'rescanning';
export type ScanPageStatus = 'pending' | 'evaluating' | 'analysing' | 'completed' | 'failed' | 'rescanning';
export type ScanAssessmentOutcome = 'complete' | 'partial' | 'inconclusive' | 'failed';
export type ScanPageAssessmentOutcome = 'analysed' | 'inconclusive' | 'failed' | 'aborted';
export type ScanPageAssessmentCause =
  | 'dns'
  | 'tls'
  | 'connection'
  | 'http'
  | 'bot_protection'
  | 'redirect_off_site'
  | 'egress_blocked'
  | 'renderer'
  | 'action_exhausted'
  | 'page_watchdog_timeout'
  | 'parent_scan_failed'
  | 'parent_scan_cancelled'
  | 'parent_scan_completed'
  | 'scan_watchdog_timeout';
export type ScanScoreIneligibilityReason = 'no_analysed_pages' | 'seed_page_unanalysed';
export type WcagLevel = 'A' | 'AA' | 'AAA';
export type IssueCategory = 'wcag' | 'seo' | 'performance' | 'ux' | 'sitewide' | 'other';
export type IssueSeverity = 'critical' | 'major' | 'minor' | 'info';

export interface Team {
  id: string;
  name: string;
  personal_team: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScanScores {
  overall: number;
  wcag: number;
  seo: number;
  performance: number;
  ux: number;
  sitewide: number;
  other: number;
}

export interface ScanCoverage {
  pages: {
    discovered: number;
    analysed: number;
    inconclusive: number;
    failed: number;
    aborted: number;
    coverage_percent: number | null;
    seed_analysed: boolean;
  };
  score_eligible: boolean;
  score_ineligibility_reason: ScanScoreIneligibilityReason | null;
  causes: Partial<Record<ScanPageAssessmentCause, number>>;
}

export interface Scan {
  id: string;
  site_id: string;
  status: ScanStatus;
  assessment_outcome: ScanAssessmentOutcome | null;
  coverage: ScanCoverage | null;
  wcag_level: WcagLevel;
  pages_crawled: number;
  pages_total: number;
  issues_count: number;
  scores: ScanScores | null;
  created_at: string;
  completed_at: string | null;
  failed_at: string | null;
  failure_reason: string | null;
}

export type ScanWithUsableScore = Scan & {
  assessment_outcome: 'complete' | 'partial';
  coverage: ScanCoverage & { score_eligible: true };
  scores: ScanScores;
};

export interface Site {
  id: string;
  name: string;
  url: string;
  latest_scan: Scan | null;
  scans_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface ScanPage {
  id: string;
  url: string;
  status: ScanPageStatus;
  assessment_outcome: ScanPageAssessmentOutcome | null;
  assessment_cause: ScanPageAssessmentCause | null;
  issues_count: number;
  issues: Issue[] | null;
  completed_at: string | null;
}

export function hasUsableScore(scan: Scan): scan is ScanWithUsableScore {
  return (scan.assessment_outcome === 'complete' || scan.assessment_outcome === 'partial')
    && scan.coverage?.score_eligible === true
    && scan.scores !== null;
}

export interface Issue {
  type: string;
  category: IssueCategory;
  severity: IssueSeverity;
  message: string;
  url: string;
  culprits: string[];
  help_url: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ApiResponse<T> {
  data: T;
  meta: { status: number };
}

export interface ApiCollectionResponse<T> {
  data: T[];
  meta: {
    status: number;
    current_page?: number;
    per_page?: number;
    total?: number;
    last_page?: number;
    [key: string]: unknown;
  };
}
