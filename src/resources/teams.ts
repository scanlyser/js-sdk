import type { Client } from '../client.js';
import type { ApiCollectionResponse, ApiResponse, PaginatedResponse, Team } from '../types/index.js';

export class TeamResource {
  constructor(private readonly client: Client) {}

  /** List all teams accessible to the authenticated token. */
  async list(perPage = 15): Promise<PaginatedResponse<Team>> {
    const response = await this.client.get<ApiCollectionResponse<Team>>('teams', { per_page: perPage });

    return {
      data: response.data,
      current_page: response.meta.current_page ?? 1,
      per_page: response.meta.per_page ?? perPage,
      total: response.meta.total ?? 0,
      last_page: response.meta.last_page ?? 1,
    };
  }

  /** Get a single team by ID. */
  async get(teamId: string): Promise<Team> {
    const response = await this.client.get<ApiResponse<Team>>(`teams/${teamId}`);

    return response.data;
  }
}
