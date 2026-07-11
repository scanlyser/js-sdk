export { Client } from './client.js';
export type { ClientOptions } from './client.js';

export { TeamResource } from './resources/teams.js';
export { SiteResource } from './resources/sites.js';
export { ScanResource } from './resources/scans.js';
export { PageResource } from './resources/pages.js';
export { IssueResource } from './resources/issues.js';
export { ReportResource } from './resources/reports.js';

export {
  ScanLyserError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  RateLimitError,
} from './errors/index.js';

export { verifyWebhookSignature } from './webhooks.js';
export { hasUsableScore } from './types/index.js';

export type {
  Team,
  Site,
  Scan,
  ScanScores,
  ScanWithUsableScore,
  ScanCoverage,
  ScanPage,
  Issue,
  PaginatedResponse,
  ScanStatus,
  ScanPageStatus,
  ScanAssessmentOutcome,
  ScanPageAssessmentOutcome,
  ScanPageAssessmentCause,
  ScanScoreIneligibilityReason,
  WcagLevel,
  IssueCategory,
  IssueSeverity,
} from './types/index.js';
