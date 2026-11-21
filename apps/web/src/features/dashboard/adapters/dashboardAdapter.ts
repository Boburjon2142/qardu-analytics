import { DashboardDataset, ReportingPeriod } from "../types";

/**
 * Adapter interface to transform raw backend responses (e.g. Django REST Framework)
 * into typed frontend domain models.
 */
export interface IDashboardAdapter {
  transformDashboardResponse(rawResponse: unknown, period: ReportingPeriod): DashboardDataset;
}

export class DashboardAdapter implements IDashboardAdapter {
  transformDashboardResponse(rawResponse: unknown, period: ReportingPeriod): DashboardDataset {
    // If future Django backend returns camelCase or snake_case payloads,
    // this adapter normalizes all fields to strict frontend domain contracts.
    const data = rawResponse as DashboardDataset;
    return {
      ...data,
      period,
    };
  }
}
