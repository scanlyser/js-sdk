import { describe, expect, it, vi } from 'vitest';
import { Client, type Diagnostic } from '../src/index.js';

describe('DiagnosticResource', () => {
  it('returns diagnostics through a separate paginated collection', async () => {
    const diagnostic = {
      id: 'diagnostic_01',
      index: 'action.execution_failed',
      title: 'A check failed to complete during analysis',
      outcome: 'error',
      code: 'action_execution_failed',
      correlation_id: '01JZ0000000000000000000000',
      check: 'axe_core_wcag.serious_violation',
      scope: {
        type: 'page',
        label: 'Checkout',
        href: 'https://example.com/checkout',
      },
      detail: {
        message: 'The scanner could not make a defensible finding decision for this check.',
        phase: 'page',
        state: 'could_not_complete',
        recovery: {
          label: 'Re-scan page',
          href: 'https://example.com/checkout/rescan',
        },
      },
    } satisfies Omit<Diagnostic, 'kind'>;
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      data: [diagnostic],
      meta: {
        status: 200,
        current_page: 2,
        per_page: 10,
        total: 11,
        last_page: 2,
      },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    const client = new Client({ apiKey: 'test-token', fetchFn: fetchMock as typeof fetch });

    const diagnostics = await client.diagnostics('team_01').list('scan_01', 10, 2);

    expect(diagnostics.data[0]).toEqual({ kind: 'diagnostic', ...diagnostic });
    expect(diagnostics.current_page).toBe(2);
    expect(diagnostics.total).toBe(11);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      'https://scanlyser.app/api/v1/team_01/scans/scan_01/diagnostics?per_page=10&page=2',
    );
  });
});
