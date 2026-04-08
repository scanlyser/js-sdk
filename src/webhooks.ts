/** Verify a webhook signature against the request payload. */
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const hex = Array.from(new Uint8Array(signed))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  const expected = `sha256=${hex}`;

  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;

  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}
