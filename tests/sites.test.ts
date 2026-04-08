import { describe, it, expect } from 'vitest';
import { createClient } from './helpers.js';

describe('SiteResource', () => {
  it('lists sites', async () => {
    const client = createClient({
      status: 200,
      body: {
        data: [
          { id: 'site_01', name: 'Example', url: 'https://example.com', scans_count: 3, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-02T00:00:00Z' },
        ],
        meta: { status: 200, current_page: 1, per_page: 15, total: 1, last_page: 1 },
      },
    });

    const result = await client.sites('team_01').list();

    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('Example');
    expect(result.data[0].url).toBe('https://example.com');
    expect(result.total).toBe(1);
  });

  it('creates a site', async () => {
    const client = createClient({
      status: 201,
      body: {
        data: { id: 'site_new', name: 'New Site', url: 'https://new.com', created_at: '2026-04-08T00:00:00Z', updated_at: '2026-04-08T00:00:00Z' },
        meta: { status: 201 },
      },
    });

    const site = await client.sites('team_01').create('New Site', 'https://new.com');

    expect(site.id).toBe('site_new');
    expect(site.name).toBe('New Site');
  });

  it('gets a site with latest scan', async () => {
    const client = createClient({
      status: 200,
      body: {
        data: {
          id: 'site_01', name: 'Example', url: 'https://example.com',
          latest_scan: { id: 'scan_01', site_id: 'site_01', status: 'completed', wcag_level: 'AA', pages_crawled: 10, pages_total: 10, issues_count: 5, scores: { overall: 85, wcag: 80, seo: 90, performance: 85, ux: 88, sitewide: 75, other: 80 }, created_at: '2026-01-01T00:00:00Z', completed_at: '2026-01-01T01:00:00Z' },
          scans_count: 5, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-02T00:00:00Z',
        },
        meta: { status: 200 },
      },
    });

    const site = await client.sites('team_01').get('site_01');

    expect(site.latest_scan).not.toBeNull();
    expect(site.latest_scan!.scores!.overall).toBe(85);
  });
});
