import { describe, it, expect, vi } from 'vitest';
import {
  Client,
  hasUsableCategoryScore,
  hasUsableScore,
  type Scan,
  type ScanCategory,
} from '../src/index.js';
import { createClient } from './helpers.js';

describe('ScanResource', () => {
  it('triggers a scan', async () => {
    const client = createClient({
      status: 202,
      body: {
        data: { id: 'scan_new', site_id: 'site_01', status: 'pending', wcag_level: 'AA', pages_crawled: 0, pages_total: 0, issues_count: 0, created_at: '2026-04-08T00:00:00Z' },
        meta: { status: 202 },
      },
    });

    const scan = await client.scans('team_01').trigger('site_01', 'AA');

    expect(scan.id).toBe('scan_new');
    expect(scan.status).toBe('pending');
    expect(scan.wcag_level).toBe('AA');
  });

  it('gets a completed scan with scores', async () => {
    const client = createClient({
      status: 200,
      body: {
        data: { id: 'scan_01', site_id: 'site_01', status: 'completed', assessment_outcome: 'complete', coverage: { pages: { discovered: 50, analysed: 50, inconclusive: 0, failed: 0, aborted: 0, coverage_percent: 100, seed_analysed: true }, score_eligible: true, score_ineligibility_reason: null, causes: {} }, wcag_level: 'AAA', pages_crawled: 50, pages_total: 50, issues_count: 120, scores: { overall: 72, wcag: 65, seo: 80, performance: 85, ux: 70, sitewide: 60, other: 75 }, created_at: '2026-01-01T00:00:00Z', completed_at: '2026-01-01T02:00:00Z' },
        meta: { status: 200 },
      },
    });

    const scan = await client.scans('team_01').get('scan_01');

    expect(scan.status).toBe('completed');
    expect(scan.scores).not.toBeNull();
    expect(scan.scores!.overall).toBe(72);
    expect(hasUsableScore(scan)).toBe(true);
  });

  it('preserves category coverage, scored scope, and null category scores', async () => {
    const client = createClient({
      status: 200,
      body: {
        data: {
          id: 'scan_01',
          site_id: 'site_01',
          status: 'completed',
          assessment_outcome: 'complete',
          coverage: {
            pages: {
              discovered: 1,
              analysed: 1,
              inconclusive: 0,
              failed: 0,
              aborted: 0,
              coverage_percent: 100,
              seed_analysed: true,
            },
            score_eligible: true,
            score_ineligibility_reason: null,
            causes: {},
          },
          requested_categories: ['seo'],
          category_coverage: {
            accessibility: notScannedCategoryCoverage(),
            seo: assessedCategoryCoverage(),
            performance: notScannedCategoryCoverage(),
            ux: notScannedCategoryCoverage(),
            security: notScannedCategoryCoverage(),
          },
          scored_category_scope: ['seo'],
          wcag_level: 'AA',
          pages_crawled: 1,
          pages_total: 1,
          issues_count: 2,
          scores: {
            overall: 80,
            wcag: null,
            seo: 80,
            performance: null,
            ux: null,
            sitewide: null,
            other: null,
          },
          created_at: '2026-01-01T00:00:00Z',
          completed_at: '2026-01-01T00:01:00Z',
          failed_at: null,
          failure_reason: null,
        },
        meta: { status: 200 },
      },
    });

    const scan = await client.scans('team_01').get('scan_01');

    expect(scan.requested_categories).toEqual(['seo']);
    expect(scan.category_coverage?.seo.outcome).toBe('assessed');
    expect(scan.category_coverage?.accessibility.outcome).toBe('not_scanned');
    expect(scan.scored_category_scope).toEqual(['seo']);
    expect(scan.scores?.wcag).toBeNull();
    expect(scan.scores?.seo).toBe(80);
    expect(hasUsableScore(scan)).toBe(true);
    expect(hasUsableCategoryScore(scan, 'seo')).toBe(true);
    expect(hasUsableCategoryScore(scan, 'accessibility')).toBe(false);
  });

  it('sends selected categories after the existing webhook argument', async () => {
    const fetchMock = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) => new Response(
      JSON.stringify({
        data: {
          id: 'scan_new',
          site_id: 'site_01',
          status: 'pending',
          requested_categories: ['seo', 'security'],
          wcag_level: 'AA',
          pages_crawled: 0,
          pages_total: 0,
          issues_count: 0,
          created_at: '2026-04-08T00:00:00Z',
        },
        meta: { status: 202 },
      }),
      { status: 202, headers: { 'Content-Type': 'application/json' } },
    ));
    const client = new Client({ apiKey: 'test-token', fetchFn: fetchMock as typeof fetch });
    const categories: ScanCategory[] = ['security', 'seo'];

    await client.scans('team_01').trigger(
      'site_01',
      'AA',
      'https://example.com/webhooks/scanlyser',
      categories,
    );

    expect(JSON.parse(fetchMock.mock.calls[0]![1]!.body as string)).toEqual({
      wcag_level: 'AA',
      webhook_url: 'https://example.com/webhooks/scanlyser',
      categories: ['security', 'seo'],
    });
  });

  it('represents an inconclusive assessment without a usable score', () => {
    const scan: Scan = {
      id: 'scan_01',
      site_id: 'site_01',
      status: 'completed',
      assessment_outcome: 'inconclusive',
      coverage: {
        pages: {
          discovered: 1,
          analysed: 0,
          inconclusive: 1,
          failed: 0,
          aborted: 0,
          coverage_percent: 0,
          seed_analysed: false,
        },
        score_eligible: false,
        score_ineligibility_reason: 'no_analysed_pages',
        causes: { dns: 1 },
      },
      requested_categories: ['accessibility', 'seo', 'performance', 'ux', 'security'],
      category_coverage: null,
      scored_category_scope: null,
      wcag_level: 'AA',
      pages_crawled: 1,
      pages_total: 1,
      issues_count: 0,
      scores: null,
      created_at: '2026-01-01T00:00:00Z',
      completed_at: '2026-01-01T00:00:00Z',
      failed_at: null,
      failure_reason: null,
      failure: null,
    };

    expect(hasUsableScore(scan)).toBe(false);
  });

  it('exposes a stable lifecycle failure without raw exception detail', async () => {
    const client = createClient({
      status: 200,
      body: {
        data: {
          id: 'scan_failed',
          site_id: 'site_01',
          status: 'failed',
          assessment_outcome: 'failed',
          coverage: null,
          requested_categories: ['accessibility'],
          category_coverage: null,
          scored_category_scope: null,
          wcag_level: 'AA',
          pages_crawled: 0,
          pages_total: 1,
          issues_count: 0,
          scores: null,
          created_at: '2026-07-14T10:00:00Z',
          completed_at: null,
          failed_at: '2026-07-14T10:01:00Z',
          failure_reason: 'The scan could not be completed.',
          failure: {
            code: 'scan_execution_failed',
            message: 'The scan could not be completed.',
            correlation_id: '01JZ0000000000000000000002',
            raw_exception: 'SQLSTATE credentials and internal stack trace',
          },
        },
        meta: { status: 200 },
      },
    });

    const scan = await client.scans('team_01').get('scan_failed');

    expect(scan.failure).toEqual({
      code: 'scan_execution_failed',
      message: 'The scan could not be completed.',
      correlation_id: '01JZ0000000000000000000002',
    });
  });

  it('returns cancelled scans from awaitCompletion without polling again', async () => {
    const client = createClient({
      status: 200,
      body: {
        data: {
          id: 'scan_cancelled',
          site_id: 'site_01',
          status: 'cancelled',
          assessment_outcome: null,
          coverage: null,
          wcag_level: 'AA',
          pages_crawled: 0,
          pages_total: 0,
          issues_count: 0,
          scores: null,
          created_at: '2026-01-01T00:00:00Z',
          completed_at: null,
          failed_at: null,
          failure_reason: null,
        },
        meta: { status: 200 },
      },
    });

    const scan = await client.scans('team_01').awaitCompletion('scan_cancelled', { pollIntervalMs: 0 });

    expect(scan.status).toBe('cancelled');
  });
});

function notScannedCategoryCoverage() {
  return {
    requested: false,
    outcome: 'not_scanned',
    score_eligible: false,
    planned_baseline: 0,
    planned_supplemental: 0,
    gap_baseline: 0,
    gap_supplemental: 0,
    gap_reasons: {},
  } as const;
}

function assessedCategoryCoverage() {
  return {
    requested: true,
    outcome: 'assessed',
    score_eligible: true,
    planned_baseline: 4,
    planned_supplemental: 1,
    gap_baseline: 0,
    gap_supplemental: 0,
    gap_reasons: {},
  } as const;
}
