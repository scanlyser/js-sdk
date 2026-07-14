import { mapError } from './errors/index.js';
import { TeamResource } from './resources/teams.js';
import { SiteResource } from './resources/sites.js';
import { ScanResource } from './resources/scans.js';
import { PageResource } from './resources/pages.js';
import { IssueResource } from './resources/issues.js';
import { DiagnosticResource } from './resources/diagnostics.js';
import { ReportResource } from './resources/reports.js';

export interface ClientOptions {
  apiKey: string;
  maxRetries?: number;
  fetchFn?: typeof fetch;
}

export class Client {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly maxRetries: number;
  private readonly fetchFn: typeof fetch;

  constructor(options: ClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = 'https://scanlyser.app/api/v1';
    this.maxRetries = options.maxRetries ?? 3;
    this.fetchFn = options.fetchFn ?? fetch;
  }

  /** Access team resources. */
  teams(): TeamResource {
    return new TeamResource(this);
  }

  /** Access site resources scoped to a team. */
  sites(teamId: string): SiteResource {
    return new SiteResource(this, teamId);
  }

  /** Access scan resources scoped to a team. */
  scans(teamId: string): ScanResource {
    return new ScanResource(this, teamId);
  }

  /** Access page resources scoped to a team. */
  pages(teamId: string): PageResource {
    return new PageResource(this, teamId);
  }

  /** Access issue resources scoped to a team. */
  issues(teamId: string): IssueResource {
    return new IssueResource(this, teamId);
  }

  /** Access diagnostic resources scoped to a team. */
  diagnostics(teamId: string): DiagnosticResource {
    return new DiagnosticResource(this, teamId);
  }

  /** Access report resources scoped to a team. */
  reports(teamId: string): ReportResource {
    return new ReportResource(this, teamId);
  }

  /** Send a GET request. */
  async get<T>(path: string, query: Record<string, string | number> = {}): Promise<T> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      params.set(key, String(value));
    }
    const qs = params.toString();
    const url = `${this.baseUrl}/${path}${qs ? `?${qs}` : ''}`;

    return this.request<T>('GET', url);
  }

  /** Send a POST request. */
  async post<T>(path: string, data: Record<string, unknown> = {}): Promise<T> {
    return this.request<T>('POST', `${this.baseUrl}/${path}`, data);
  }

  /** Send a DELETE request. */
  async delete(path: string): Promise<void> {
    await this.request('DELETE', `${this.baseUrl}/${path}`);
  }

  /** Send a GET request and return the raw response. */
  async getRaw(path: string, query: Record<string, string | number> = {}): Promise<Response> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      params.set(key, String(value));
    }
    const qs = params.toString();
    const url = `${this.baseUrl}/${path}${qs ? `?${qs}` : ''}`;

    return this.requestRaw('GET', url);
  }

  private async request<T>(method: string, url: string, body?: Record<string, unknown>): Promise<T> {
    const response = await this.requestRaw(method, url, body);
    const text = await response.text();

    if (!text) {
      return {} as T;
    }

    return JSON.parse(text) as T;
  }

  private async requestRaw(method: string, url: string, body?: Record<string, unknown>): Promise<Response> {
    let attempts = 0;

    while (true) {
      const response = await this.fetchFn(url, {
        method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (response.ok) {
        return response;
      }

      const responseBody = await response.json().catch(() => ({}));

      if (response.status === 429 && attempts < this.maxRetries) {
        const retryAfter = parseInt(response.headers.get('Retry-After') ?? '1', 10);
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        attempts++;
        continue;
      }

      throw mapError(response.status, responseBody as Record<string, unknown>);
    }
  }
}
