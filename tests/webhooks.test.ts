import { describe, it, expect } from 'vitest';
import { verifyWebhookSignature } from '../src/webhooks.js';
import { createHmac } from 'node:crypto';

function sign(payload: string, secret: string): string {
  return 'sha256=' + createHmac('sha256', secret).update(payload).digest('hex');
}

describe('Webhook signature verification', () => {
  it('verifies a valid signature', async () => {
    const payload = '{"event":"scan.completed","scan":{"id":"scan_01"}}';
    const secret = 'my-secret-key';
    const signature = sign(payload, secret);

    expect(await verifyWebhookSignature(payload, signature, secret)).toBe(true);
  });

  it('rejects an invalid signature', async () => {
    const payload = '{"event":"scan.completed"}';

    expect(await verifyWebhookSignature(payload, 'sha256=invalid', 'my-secret-key')).toBe(false);
  });

  it('rejects a tampered payload', async () => {
    const secret = 'my-secret-key';
    const signature = sign('{"event":"scan.completed"}', secret);

    expect(await verifyWebhookSignature('{"event":"scan.failed"}', signature, secret)).toBe(false);
  });
});
