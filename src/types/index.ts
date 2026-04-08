export type ScanStatus = 'pending' | 'crawling' | 'analysing' | 'completed' | 'failed' | 'rescanning';
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

export interface Scan {
  id: string;
  site_id: string;
  status: ScanStatus;
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
  status: ScanStatus;
  issues_count: number;
  issues: Issue[] | null;
  completed_at: string | null;
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
