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
          completed_at: null,
        } satisfies ScanPage,
        meta: { status: 200 },
      },
    });

    const page = await client.pages('team_01').get('scan_01', 'page_01');

    expect(page.status).toBe('evaluating');
    expect(page.assessment_outcome).toBeNull();
  });
});
