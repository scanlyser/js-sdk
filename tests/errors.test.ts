import { describe, it, expect } from 'vitest';
import { createClient } from './helpers.js';
import { AuthenticationError, ForbiddenError, NotFoundError, RateLimitError, ValidationError } from '../src/errors/index.js';

describe('Error handling', () => {
  it('throws AuthenticationError on 401', async () => {
    const client = createClient({ status: 401, body: { error: { status: 401, message: 'Unauthenticated.' } } });

    await expect(client.sites('t').list()).rejects.toThrow(AuthenticationError);
  });

  it('throws ForbiddenError on 403', async () => {
    const client = createClient({ status: 403, body: { error: { status: 403, message: 'API access requires Agency plan.' } } });

    await expect(client.sites('t').list()).rejects.toThrow(ForbiddenError);
  });

  it('throws NotFoundError on 404', async () => {
    const client = createClient({ status: 404, body: { error: { status: 404, message: 'Site not found.' } } });

    await expect(client.sites('t').get('x')).rejects.toThrow(NotFoundError);
  });

  it('throws ValidationError on 422 with errors', async () => {
    const client = createClient({
      status: 422,
      body: { error: { status: 422, message: 'The given data was invalid.', errors: { url: ['The url field is required.'] } } },
    });

    try {
      await client.sites('t').create('Test', '');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).errors.url[0]).toBe('The url field is required.');
      return;
    }

    expect.unreachable('Expected ValidationError');
  });

  it('retries on 429 then succeeds', async () => {
    const client = createClient(
      { status: 429, body: { error: { message: 'Too many requests.' } }, headers: { 'Retry-After': '0' } },
      { status: 200, body: { data: [], meta: { status: 200, current_page: 1, per_page: 15, total: 0, last_page: 1 } } },
    );

    const result = await client.sites('t').list();

    expect(result.data).toEqual([]);
  });

  it('throws RateLimitError after max retries', async () => {
    const responses = Array.from({ length: 4 }, () => ({
      status: 429,
      body: { error: { message: 'Too many requests.' } },
      headers: { 'Retry-After': '0' },
    }));

    const client = createClient(...responses);

    await expect(client.sites('t').list()).rejects.toThrow(RateLimitError);
  });
});
