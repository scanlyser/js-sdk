import { describe, it, expect } from 'vitest';
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
        data: { id: 'scan_01', site_id: 'site_01', status: 'completed', wcag_level: 'AAA', pages_crawled: 50, pages_total: 50, issues_count: 120, scores: { overall: 72, wcag: 65, seo: 80, performance: 85, ux: 70, sitewide: 60, other: 75 }, created_at: '2026-01-01T00:00:00Z', completed_at: '2026-01-01T02:00:00Z' },
        meta: { status: 200 },
      },
    });

    const scan = await client.scans('team_01').get('scan_01');

    expect(scan.status).toBe('completed');
    expect(scan.scores).not.toBeNull();
    expect(scan.scores!.overall).toBe(72);
  });
});
