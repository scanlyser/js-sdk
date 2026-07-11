# ScanLyser JS SDK

Official TypeScript/JavaScript SDK for the [ScanLyser](https://scanlyser.app) API. Run accessibility, SEO, performance, UX, and security scans programmatically.

## Requirements

- Node.js 18+ (uses native `fetch` and `crypto.subtle`)
- Works with Node.js, Deno, and Bun

## Installation

```bash
npm install @scanlyser/js-sdk
```

## Quick Start

```typescript
import { Client, hasUsableCategoryScore, hasUsableScore } from '@scanlyser/js-sdk';

const client = new Client({ apiKey: 'your-api-token' });

// List your sites
const sites = await client.sites(teamId).list();

for (const site of sites.data) {
  console.log(`${site.name}: ${site.url}`);
}

// Trigger a scan
const scan = await client.scans(teamId).trigger(siteId, 'AA');

// Wait for completion
const completed = await client.scans(teamId).awaitCompletion(scan.id);

// Get issues
const issues = await client.issues(teamId).list(completed.id, { severity: 'critical' });
```

## API Reference

### Client

```typescript
const client = new Client({
  apiKey: 'your-api-token',
  maxRetries: 3, // optional, retries on 429
});
```

### Teams

```typescript
const teams = await client.teams().list();
const team = await client.teams().get(teamId);
```

### Sites

```typescript
const sites = await client.sites(teamId).list(15);
const site = await client.sites(teamId).create('My Site', 'https://example.com');
const site = await client.sites(teamId).get(siteId);
await client.sites(teamId).delete(siteId);
```

### Scans

```typescript
const scans = await client.scans(teamId).list(siteId);
const triggeredScan = await client.scans(teamId).trigger(siteId, 'AA');
const scopedScan = await client.scans(teamId).trigger(
  siteId,
  'AA',
  'https://example.com/webhooks/scanlyser',
  ['seo', 'performance'],
);
const fetchedScan = await client.scans(teamId).get(scanId);

// Poll until complete (default: 600s timeout, 10s interval)
const completed = await client.scans(teamId).awaitCompletion(scanId, {
  timeoutMs: 600_000,
  pollIntervalMs: 10_000,
});

if (hasUsableScore(completed)) {
  console.log(`Score: ${completed.scores.overall}`);
} else {
  console.log(`Outcome: ${completed.assessment_outcome}`);
}

if (hasUsableCategoryScore(completed, 'seo')) {
  console.log(`SEO score: ${completed.scores.seo}`);
} else {
  console.log(`SEO evidence: ${completed.category_coverage?.seo.outcome ?? 'not available'}`);
}
```

Polling stops for completed, failed, and cancelled scans. A completed lifecycle does not by itself guarantee a score:
inspect `assessment_outcome`, `coverage`, or use `hasUsableScore()` before presenting score data.

The fourth `trigger()` argument optionally selects one or more public scan categories: `accessibility`, `seo`,
`performance`, `ux`, and `security`. Omitting it scans all categories. The existing third positional argument remains
the webhook URL; pass `undefined` when selecting categories without a webhook. An explicitly empty category array is
invalid.

Category scores are nullable. Use `requested_categories` for the requested scope, `category_coverage` for each
category's `not_scanned`, `assessed`, `partial`, or `inconclusive` evidence outcome, and `scored_category_scope` for the
categories included in the overall score. `hasUsableCategoryScore()` checks both that evidence contract and the
category's governed numeric score bucket(s). In particular, the public `security` category is usable only when both
internal `sitewide` and `other` score members are numeric.

### Pages

```typescript
const pages = await client.pages(teamId).list(scanId);
const page = await client.pages(teamId).get(scanId, pageId);
```

### Issues

```typescript
const issues = await client.issues(teamId).list(scanId);
const critical = await client.issues(teamId).list(scanId, {
  category: 'wcag',
  severity: 'critical',
});
```

### Reports

```typescript
const report = await client.reports(teamId).json(scanId);
const response = await client.reports(teamId).pdf(scanId);
```

## Webhook Verification

Verify webhook signatures from scan completion callbacks:

```typescript
import { verifyWebhookSignature } from '@scanlyser/js-sdk';

const isValid = await verifyWebhookSignature(
  requestBody,
  request.headers.get('X-Signature')!,
  tokenHash,
);
```

## Error Handling

The SDK throws typed errors for API failures:

```typescript
import { NotFoundError, ValidationError, RateLimitError } from '@scanlyser/js-sdk';

try {
  await client.sites(teamId).get('nonexistent');
} catch (error) {
  if (error instanceof NotFoundError) {
    // 404
  } else if (error instanceof ValidationError) {
    // 422 — error.errors contains field-level errors
  } else if (error instanceof RateLimitError) {
    // 429 — automatic retries exhausted
  }
}
```

Rate-limited requests (429) are automatically retried up to 3 times with the `Retry-After` delay.

## License

MIT
