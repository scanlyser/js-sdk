export type ResultKind = 'finding' | 'diagnostic';
export type FindingOutcome = 'confirmed' | 'manual_review';
export type DiagnosticOutcome = 'inconclusive' | 'error';
export type ResultOutcome = FindingOutcome | DiagnosticOutcome;
export type ResultConfidence = 'high' | 'medium' | 'low';
export type EvidenceQuality = 'direct' | 'derived' | 'heuristic' | 'model_generated' | 'insufficient';
export type DetectionMethod = 'static' | 'rendered' | 'axe' | 'network' | 'ai' | 'heuristic';
export type ResultScalar = string | number | boolean | null;

export interface ResultCheck {
  id: string;
  version: number;
}

export interface ResultExplanation {
  title: string;
  impact: string;
  reasoning: string | null;
  limitations: string[];
}

export interface ResultBasis {
  criterion: string;
}

export interface ResultEvidence {
  code: string;
  label: string;
  observed?: ResultScalar;
  expected?: ResultScalar;
  unit?: string;
}

export interface ResultReproduction {
  url: string;
  viewport_width?: number;
  viewport_height?: number;
  capture_fingerprint?: string;
  culprits: string[];
}

export interface ResultRemediation {
  recommendation: string | null;
  parameters: Record<string, ResultScalar>;
}

export interface ResultEnvelopeV2 {
  schema_version: 2;
  check: ResultCheck;
  kind: ResultKind;
  outcome: ResultOutcome;
  confidence: ResultConfidence | null;
  evidence_quality: EvidenceQuality | null;
  detection_method: DetectionMethod | null;
  explanation: ResultExplanation;
  basis: ResultBasis[];
  evidence: ResultEvidence[];
  reproduction: ResultReproduction;
  remediation: ResultRemediation;
  references: string[];
}

const findingOutcomes = ['confirmed', 'manual_review'] as const;
const diagnosticOutcomes = ['inconclusive', 'error'] as const;
const confidenceValues = ['high', 'medium', 'low'] as const;
const evidenceQualityValues = ['direct', 'derived', 'heuristic', 'model_generated', 'insufficient'] as const;
const detectionMethodValues = ['static', 'rendered', 'axe', 'network', 'ai', 'heuristic'] as const;

export function parseResultEnvelopeV2(value: unknown): ResultEnvelopeV2 {
  assertRecord(value);
  assert(value.schema_version === 2);

  assertRecord(value.check);
  assertString(value.check.id);
  assertPositiveInteger(value.check.version);

  const kind = value.kind;
  const outcome = value.outcome;
  assert(kind === 'finding' || kind === 'diagnostic');
  assertString(outcome);
  assert(kind === 'finding'
    ? findingOutcomes.includes(outcome as FindingOutcome)
    : diagnosticOutcomes.includes(outcome as DiagnosticOutcome));

  assertNullableMember(value.confidence, confidenceValues);
  assertNullableMember(value.evidence_quality, evidenceQualityValues);
  assertNullableMember(value.detection_method, detectionMethodValues);

  assertRecord(value.explanation);
  assertString(value.explanation.title);
  assertString(value.explanation.impact);
  assertNullableString(value.explanation.reasoning);
  assertStringArray(value.explanation.limitations);

  assertArray(value.basis);
  value.basis.forEach((basis) => {
    assertRecord(basis);
    assertString(basis.criterion);
  });

  assertArray(value.evidence);
  value.evidence.forEach(assertEvidence);

  assertRecord(value.reproduction);
  assertString(value.reproduction.url);
  assertOptionalNumber(value.reproduction.viewport_width);
  assertOptionalNumber(value.reproduction.viewport_height);
  assertOptionalString(value.reproduction.capture_fingerprint);
  assertStringArray(value.reproduction.culprits);

  assertRecord(value.remediation);
  assertNullableString(value.remediation.recommendation);
  assertScalarRecord(value.remediation.parameters);
  assertStringArray(value.references);

  return value as unknown as ResultEnvelopeV2;
}

function assertEvidence(value: unknown): void {
  assertRecord(value);
  assertString(value.code);
  assertString(value.label);
  assertOptionalScalar(value.observed);
  assertOptionalScalar(value.expected);
  assertOptionalString(value.unit);
}

function assertRecord(value: unknown): asserts value is Record<string, unknown> {
  assert(typeof value === 'object' && value !== null && !Array.isArray(value));
}

function assertArray(value: unknown): asserts value is unknown[] {
  assert(Array.isArray(value));
}

function assertString(value: unknown): asserts value is string {
  assert(typeof value === 'string');
}

function assertNullableString(value: unknown): asserts value is string | null {
  assert(value === null || typeof value === 'string');
}

function assertOptionalString(value: unknown): asserts value is string | undefined {
  assert(value === undefined || typeof value === 'string');
}

function assertOptionalNumber(value: unknown): asserts value is number | undefined {
  assert(value === undefined || (typeof value === 'number' && Number.isFinite(value)));
}

function assertPositiveInteger(value: unknown): asserts value is number {
  assert(typeof value === 'number' && Number.isInteger(value) && value > 0);
}

function assertStringArray(value: unknown): asserts value is string[] {
  assert(Array.isArray(value) && value.every((entry) => typeof entry === 'string'));
}

function assertOptionalScalar(value: unknown): asserts value is ResultScalar | undefined {
  assert(value === undefined || value === null || ['string', 'number', 'boolean'].includes(typeof value));
}

function assertScalarRecord(value: unknown): asserts value is Record<string, ResultScalar> {
  assertRecord(value);
  Object.values(value).forEach((entry) => assertOptionalScalar(entry));
}

function assertNullableMember<const Values extends readonly string[]>(
  value: unknown,
  allowed: Values,
): asserts value is Values[number] | null {
  assert(value === null || (typeof value === 'string' && allowed.includes(value)));
}

function assert(condition: boolean): asserts condition {
  if (!condition) {
    throw new TypeError('Invalid ScanLyser result envelope v2.');
  }
}
