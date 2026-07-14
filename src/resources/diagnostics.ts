import type { Client } from '../client.js';
import type { ApiCollectionResponse, Diagnostic, PaginatedResponse } from '../types/index.js';

export class DiagnosticResource {
  constructor(
    private readonly client: Client,
    private readonly teamId: string,
  ) {}

  /** List scanner diagnostics for a scan independently from findings. */
  async list(scanId: string, perPage = 50, page = 1): Promise<PaginatedResponse<Diagnostic>> {
    const response = await this.client.get<ApiCollectionResponse<Diagnostic>>(
      `${this.teamId}/scans/${scanId}/diagnostics`,
      { per_page: perPage, page },
    );

    return {
      data: response.data.map((diagnostic) => ({
        ...diagnostic,
        kind: 'diagnostic',
      })),
      current_page: response.meta.current_page ?? 1,
      per_page: response.meta.per_page ?? perPage,
      total: response.meta.total ?? 0,
      last_page: response.meta.last_page ?? 1,
    };
  }
}
