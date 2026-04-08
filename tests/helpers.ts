import { Client } from '../src/client.js';

export function mockFetch(...responses: { status: number; body?: unknown; headers?: Record<string, string> }[]) {
  let callIndex = 0;

  const fn = async (_url: string | URL | Request, _init?: RequestInit): Promise<Response> => {
    const response = responses[callIndex++];

    return new Response(
      response.body !== undefined ? JSON.stringify(response.body) : null,
      {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          ...response.headers,
        },
      },
    );
  };

  return fn as typeof fetch;
}

export function createClient(
  ...responses: { status: number; body?: unknown; headers?: Record<string, string> }[]
): Client {
  return new Client({
    apiKey: 'test-token',
    fetchFn: mockFetch(...responses),
  });
}
