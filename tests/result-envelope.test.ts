import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parseResultEnvelopeV2 } from '../src/index.js';
import { createClient } from './helpers.js';

const fixturePath = fileURLToPath(new URL('./Fixtures/Contracts/result-envelope-v2.json', import.meta.url));
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8')) as unknown;
const diagnosticFixturePath = fileURLToPath(
  new URL('./Fixtures/Contracts/result-envelope-v2-diagnostic.json', import.meta.url),
);
const diagnosticFixture = JSON.parse(readFileSync(diagnosticFixturePath, 'utf8')) as unknown;

describe('result envelope v2', () => {
  it('parses the canonical nested result contract', () => {
    const result = parseResultEnvelopeV2(fixture);

    expect(result.schema_version).toBe(2);
    expect(result.check.id).toBe('axe_core_wcag.serious_violation');
    expect(result.evidence[0]?.observed).toBe('color-contrast');
    expect(result.remediation.parameters).toEqual({});
  });

  it('preserves explicitly declined qualification', () => {
    const result = parseResultEnvelopeV2({
      ...(fixture as Record<string, unknown>),
      confidence: null,
      evidence_quality: null,
      detection_method: null,
    });

    expect(result.confidence).toBeNull();
    expect(result.evidence_quality).toBeNull();
    expect(result.detection_method).toBeNull();
  });

  it('parses and serialises the canonical diagnostic contract without weakening the finding type', () => {
    const finding = parseResultEnvelopeV2(fixture);
    const diagnostic = parseResultEnvelopeV2(diagnosticFixture);

    expect(finding.kind).toBe('finding');
    expect(diagnostic.kind).toBe('diagnostic');
    expect(diagnostic.outcome).toBe('error');
    expect(JSON.parse(JSON.stringify(diagnostic))).toEqual(diagnosticFixture);
  });

  it('rejects malformed result envelopes', () => {
    expect(() => parseResultEnvelopeV2({
      ...(fixture as Record<string, unknown>),
      outcome: 'probably',
    })).toThrow(TypeError);
  });

  it('rejects malformed nested results returned by issue resources', async () => {
    const client = createClient({
      status: 200,
      body: {
        data: [{
          type: 'accessibility.serious_violation',
          category: 'wcag',
          severity: 'major',
          message: 'Text contrast is insufficient',
          recommendation: 'Increase the text contrast.',
          reference_url: null,
          url: 'https://example.com/checkout',
          culprits: [],
          help_url: null,
          result: { ...(fixture as Record<string, unknown>), schema_version: 1 },
        }],
        meta: { status: 200 },
      },
    });

    await expect(client.issues('team_01').list('scan_01')).rejects.toThrow(TypeError);
  });

  it('hydrates issue resources as discriminated findings', async () => {
    const client = createClient({
      status: 200,
      body: {
        data: [{
          type: 'accessibility.serious_violation',
          category: 'wcag',
          severity: 'major',
          message: 'Text contrast is insufficient',
          recommendation: 'Increase the text contrast.',
          reference_url: null,
          url: 'https://example.com/checkout',
          culprits: [],
          help_url: null,
          result: fixture,
        }],
        meta: { status: 200 },
      },
    });

    const issues = await client.issues('team_01').list('scan_01');

    expect(issues.data[0]?.kind).toBe('finding');
    expect(issues.data[0]?.result.kind).toBe('finding');
  });

  it('rejects diagnostic envelopes returned by finding resources', async () => {
    const client = createClient({
      status: 200,
      body: {
        data: [{
          type: 'accessibility.serious_violation',
          category: 'wcag',
          severity: 'major',
          message: 'Text contrast is insufficient',
          recommendation: 'Increase the text contrast.',
          reference_url: null,
          url: 'https://example.com/checkout',
          culprits: [],
          help_url: null,
          result: diagnosticFixture,
        }],
        meta: { status: 200 },
      },
    });

    await expect(client.issues('team_01').list('scan_01')).rejects.toThrow(TypeError);
  });
});
