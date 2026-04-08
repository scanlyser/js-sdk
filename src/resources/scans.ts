import type { Client } from '../client.js';
import type { ApiCollectionResponse, ApiResponse, PaginatedResponse, Scan, WcagLevel } from '../types/index.js';
import { ScanLyserError } from '../errors/index.js';

export class ScanResource {
  constructor(
    private readonly client: Client,
    private readonly teamId: string,
  ) {}

  /** List scans for a site. */
  async list(siteId: string, perPage = 15): Promise<PaginatedResponse<Scan>> {
    const response = await this.client.get<ApiCollectionResponse<Scan>>(
      `${this.teamId}/sites/${siteId}/scans`,
      { per_page: perPage },
    );

    return {
      data: response.data,
      current_page: response.meta.current_page ?? 1,
      per_page: response.meta.per_page ?? perPage,
      total: response.meta.total ?? 0,
      last_page: response.meta.last_page ?? 1,
    };
  }

  /** Trigger a new scan for a site. */
  async trigger(siteId: string, wcagLevel: WcagLevel = 'AA', webhookUrl?: string): Promise<Scan> {
    const data: Record<string, unknown> = { wcag_level: wcagLevel };

    if (webhookUrl) {
      data.webhook_url = webhookUrl;
    }

    const response = await this.client.post<ApiResponse<Scan>>(
      `${this.teamId}/sites/${siteId}/scans`,
      data,
    );

    return response.data;
  }

  /** Get a single scan by ID. */
  async get(scanId: string): Promise<Scan> {
    const response = await this.client.get<ApiResponse<Scan>>(`${this.teamId}/scans/${scanId}`);

    return response.data;
  }

  /** Poll a scan until it reaches a terminal state (completed or failed). */
  async awaitCompletion(
    scanId: string,
    options: { timeoutMs?: number; pollIntervalMs?: number } = {},
  ): Promise<Scan> {
    const { timeoutMs = 600_000, pollIntervalMs = 10_000 } = options;
    const start = Date.now();

    while (true) {
      const scan = await this.get(scanId);

      if (scan.status === 'completed' || scan.status === 'failed') {
        return scan;
      }

      if (Date.now() - start >= timeoutMs) {
        throw new ScanLyserError(
          `Scan ${scanId} did not complete within ${timeoutMs / 1000} seconds. Last status: ${scan.status}`,
          408,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }
  }
}
