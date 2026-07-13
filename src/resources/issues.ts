import type { Client } from '../client.js';
import type { ApiCollectionResponse, Issue, IssueCategory, IssueSeverity, PaginatedResponse } from '../types/index.js';
import { parseResultEnvelopeV2 } from '../types/result-envelope.js';

export class IssueResource {
  constructor(
    private readonly client: Client,
    private readonly teamId: string,
  ) {}

  /** List issues for a scan, optionally filtered by category and severity. */
  async list(
    scanId: string,
    options: { category?: IssueCategory; severity?: IssueSeverity; perPage?: number } = {},
  ): Promise<PaginatedResponse<Issue>> {
    const query: Record<string, string | number> = { per_page: options.perPage ?? 50 };

    if (options.category) {
      query.category = options.category;
    }

    if (options.severity) {
      query.severity = options.severity;
    }

    const response = await this.client.get<ApiCollectionResponse<Issue>>(
      `${this.teamId}/scans/${scanId}/issues`,
      query,
    );

    return {
      data: response.data.map((issue) => ({
        ...issue,
        result: parseResultEnvelopeV2(issue.result),
      })),
      current_page: response.meta.current_page ?? 1,
      per_page: response.meta.per_page ?? (options.perPage ?? 50),
      total: response.meta.total ?? 0,
      last_page: response.meta.last_page ?? 1,
    };
  }
}
