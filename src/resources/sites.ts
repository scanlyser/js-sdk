import type { Client } from '../client.js';
import type { ApiCollectionResponse, ApiResponse, PaginatedResponse, Site } from '../types/index.js';

export class SiteResource {
  constructor(
    private readonly client: Client,
    private readonly teamId: string,
  ) {}

  /** List all sites for the team. */
  async list(perPage = 15): Promise<PaginatedResponse<Site>> {
    const response = await this.client.get<ApiCollectionResponse<Site>>(
      `${this.teamId}/sites`,
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

  /** Create a new site. */
  async create(name: string, url: string): Promise<Site> {
    const response = await this.client.post<ApiResponse<Site>>(`${this.teamId}/sites`, { name, url });

    return response.data;
  }

  /** Get a single site by ID. */
  async get(siteId: string): Promise<Site> {
    const response = await this.client.get<ApiResponse<Site>>(`${this.teamId}/sites/${siteId}`);

    return response.data;
  }

  /** Delete a site. */
  async delete(siteId: string): Promise<void> {
    await this.client.delete(`${this.teamId}/sites/${siteId}`);
  }
}
