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
export type ScanCategory = 'accessibility' | 'seo' | 'performance' | 'ux' | 'security';
export type IssueCategory = 'wcag' | 'seo' | 'performance' | 'ux' | 'sitewide' | 'other';
export type IssueSeverity = 'critical' | 'major' | 'minor' | 'info';
export type CategoryCoverageOutcome = 'not_scanned' | 'assessed' | 'partial' | 'inconclusive';
export type ActionGapReason =
  | 'execution_failed'
  | 'dispatch_failed'
  | 'probe_failed'
  | 'homepage_unavailable'
  | 'tool_unavailable'
  | 'configured_skip'
  | 'quota_exceeded'
  | 'rate_limited'
  | 'provider_unavailable'
  | 'invalid_response'
  | 'truncated_response'
  | 'terminal_invariant';

import type { ResultEnvelopeV2 } from './result-envelope.js';

export interface Team {
  id: string;
  name: string;
  personal_team: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScanScores {
  overall: number;
  wcag: number | null;
  seo: number | null;
  performance: number | null;
  ux: number | null;
  sitewide: number | null;
  other: number | null;
}

export interface CategoryCoverageEntry {
  requested: boolean;
  outcome: CategoryCoverageOutcome;
  score_eligible: boolean;
  planned_baseline: number;
  planned_supplemental: number;
  gap_baseline: number;
  gap_supplemental: number;
  gap_reasons: Partial<Record<ActionGapReason, number>>;
}

export type ScanCategoryCoverage = Record<ScanCategory, CategoryCoverageEntry>;

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
  requested_categories: ScanCategory[];
  category_coverage: ScanCategoryCoverage | null;
  scored_category_scope: ScanCategory[] | null;
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

type CategoryScoreMembers = {
  accessibility: { wcag: number };
  seo: { seo: number };
  performance: { performance: number };
  ux: { ux: number };
  security: { sitewide: number; other: number };
};

export type ScanWithUsableCategoryScore<Category extends ScanCategory> = Scan & {
  category_coverage: ScanCategoryCoverage & Record<
    Category,
    CategoryCoverageEntry & { score_eligible: true }
  >;
  scored_category_scope: ScanCategory[];
  scores: ScanScores & CategoryScoreMembers[Category];
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

/** Determine whether a public category has eligible evidence and all of its governed score buckets. */
export function hasUsableCategoryScore<Category extends ScanCategory>(
  scan: Scan,
  category: Category,
): scan is ScanWithUsableCategoryScore<Category> {
  const coverage = scan.category_coverage?.[category];

  if (
    scan.scores === null
    || coverage?.score_eligible !== true
    || !scan.scored_category_scope?.includes(category)
  ) {
    return false;
  }

  return categoryScoreValues(scan.scores, category).every((score) => score !== null);
}

function categoryScoreValues(scores: ScanScores, category: ScanCategory): (number | null)[] {
  switch (category) {
    case 'accessibility':
      return [scores.wcag];
    case 'seo':
      return [scores.seo];
    case 'performance':
      return [scores.performance];
    case 'ux':
      return [scores.ux];
    case 'security':
      return [scores.sitewide, scores.other];
  }
}

export interface Issue {
  type: string;
  category: IssueCategory;
  severity: IssueSeverity;
  message: string;
  recommendation: string | null;
  reference_url: string | null;
  url: string;
  culprits: string[];
  help_url: string | null;
  result: ResultEnvelopeV2;
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
