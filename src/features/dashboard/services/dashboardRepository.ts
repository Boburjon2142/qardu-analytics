import { DashboardDataset, ReportingPeriod } from "../types";
import { getDatasetByPeriod } from "@/data/mocks/dashboard.mock";
import { DashboardAdapter, IDashboardAdapter } from "../adapters/dashboardAdapter";

export interface IDashboardRepository {
  getDashboardData(period: ReportingPeriod): Promise<DashboardDataset>;
}

export class MockDashboardRepository implements IDashboardRepository {
  private adapter: IDashboardAdapter;

  constructor(adapter: IDashboardAdapter = new DashboardAdapter()) {
    this.adapter = adapter;
  }

  async getDashboardData(period: ReportingPeriod): Promise<DashboardDataset> {
    // Simulate slight async network delay for TanStack Query and loading states
    await new Promise((resolve) => setTimeout(resolve, 80));
    const rawData = getDatasetByPeriod(period);
    return this.adapter.transformDashboardResponse(rawData, period);
  }
}

/**
 * Singleton repository instance.
 * When Django backend is ready, replace MockDashboardRepository with DjangoDashboardRepository
 * without touching any UI component!
 */
export const dashboardRepository: IDashboardRepository = new MockDashboardRepository();
