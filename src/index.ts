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
export { hasUsableCategoryScore, hasUsableScore } from './types/index.js';
export { parseResultEnvelopeV2 } from './types/result-envelope.js';

export type {
  Team,
  Site,
  Scan,
  ScanScores,
  ScanWithUsableScore,
  ScanWithUsableCategoryScore,
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
  ScanCategory,
  ScanCategoryCoverage,
  CategoryCoverageEntry,
  CategoryCoverageOutcome,
  ActionGapReason,
  WcagLevel,
  IssueCategory,
  IssueSeverity,
} from './types/index.js';

export type {
  DetectionMethod,
  DiagnosticOutcome,
  EvidenceQuality,
  FindingOutcome,
  ResultBasis,
  ResultCheck,
  ResultConfidence,
  ResultEnvelopeV2,
  ResultEvidence,
  ResultExplanation,
  ResultKind,
  ResultOutcome,
  ResultRemediation,
  ResultReproduction,
  ResultScalar,
} from './types/result-envelope.js';
