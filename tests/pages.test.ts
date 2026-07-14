import { describe, expect, it } from 'vitest';
import type { ScanPage } from '../src/index.js';
import { createClient } from './helpers.js';

describe('PageResource', () => {
  it('keeps page lifecycle and assessment fields independently typed', async () => {
    const client = createClient({
      status: 200,
      body: {
        data: {
          id: 'page_01',
          url: 'https://example.com',
          status: 'evaluating',
          assessment_outcome: null,
          assessment_cause: null,
          issues_count: 0,
          issues: null,
          diagnostics_count: 0,
          diagnostics: null,
          failure: null,
          completed_at: null,
        } satisfies ScanPage,
        meta: { status: 200 },
      },
    });

    const page = await client.pages('team_01').get('scan_01', 'page_01');

    expect(page.status).toBe('evaluating');
    expect(page.assessment_outcome).toBeNull();
  });

  it('keeps diagnostics separate from findings and exposes only safe lifecycle failures', async () => {
    const client = createClient({
      status: 200,
      body: {
        data: {
          id: 'page_01',
          url: 'https://example.com/checkout?token=secret',
          status: 'failed',
          assessment_outcome: 'failed',
          assessment_cause: 'renderer',
          issues_count: 0,
          issues: [],
          diagnostics_count: 1,
          diagnostics: [{
            id: 'diagnostic_01',
            index: 'action.execution_failed',
            title: 'A check failed to complete during analysis',
            outcome: 'error',
            code: 'action_execution_failed',
            correlation_id: '01JZ0000000000000000000000',
            check: 'axe_core_wcag.serious_violation',
            scope: { type: 'page', label: 'Checkout', href: 'https://example.com/checkout' },
            detail: {
              message: 'The scanner could not make a defensible finding decision for this check.',
              phase: 'page',
              state: 'could_not_complete',
              recovery: null,
            },
          }],
          failure: {
            code: 'renderer',
            message: 'The page could not be rendered.',
            correlation_id: '01JZ0000000000000000000001',
            raw_exception: 'Navigation failed for https://example.com/checkout?token=secret',
          },
          completed_at: '2026-07-14T10:00:00Z',
        },
        meta: { status: 200 },
      },
    });

    const page = await client.pages('team_01').get('scan_01', 'page_01');

    expect(page.issues).toEqual([]);
    expect(page.diagnostics).toHaveLength(1);
    expect(page.diagnostics?.[0]?.kind).toBe('diagnostic');
    expect(page.failure).toEqual({
      code: 'renderer',
      message: 'The page could not be rendered.',
      correlation_id: '01JZ0000000000000000000001',
    });
  });
});
