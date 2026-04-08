import type { Client } from '../client.js';
import type { ApiCollectionResponse, ApiResponse, PaginatedResponse, ScanPage } from '../types/index.js';

export class PageResource {
  constructor(
    private readonly client: Client,
    private readonly teamId: string,
  ) {}

  /** List pages for a scan. */
  async list(scanId: string, perPage = 15): Promise<PaginatedResponse<ScanPage>> {
    const response = await this.client.get<ApiCollectionResponse<ScanPage>>(
      `${this.teamId}/scans/${scanId}/pages`,
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

  /** Get a single page with its issues. */
  async get(scanId: string, pageId: string): Promise<ScanPage> {
    const response = await this.client.get<ApiResponse<ScanPage>>(
      `${this.teamId}/scans/${scanId}/pages/${pageId}`,
    );

    return response.data;
  }
}
