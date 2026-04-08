import type { Client } from '../client.js';

export class ReportResource {
  constructor(
    private readonly client: Client,
    private readonly teamId: string,
  ) {}

  /** Get the scan report as a parsed JSON object. */
  async json(scanId: string): Promise<Record<string, unknown>> {
    return this.client.get(`${this.teamId}/scans/${scanId}/report`, { format: 'json' });
  }

  /** Download the scan report as a PDF and return the raw response. */
  async pdf(scanId: string): Promise<Response> {
    return this.client.getRaw(`${this.teamId}/scans/${scanId}/report`);
  }
}
