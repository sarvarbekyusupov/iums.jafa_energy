import { apiClient } from './api-client';
import { ApiUrls } from '../api/api-urls';

export type SyncProvider = 'hopecloud' | 'soliscloud' | 'fsolar';
export type SyncStatus = 'fresh' | 'stale' | 'dead' | 'unknown';

export interface ProviderSyncHealth {
  provider: SyncProvider;
  /** Last time a sync run finished without a hard failure (ISO) */
  lastSuccessAt: string | null;
  /** Newest data point we actually hold for this provider (ISO) */
  lastRowAt: string | null;
  /** Minutes since lastRowAt (null when we hold no data at all) */
  ageMinutes: number | null;
  status: SyncStatus;
  lastError: string | null;
}

export interface SyncHealthReport {
  checkedAt: string;
  thresholds: { staleMinutes: number; deadMinutes: number };
  providers: ProviderSyncHealth[];
}

/**
 * Freshness of the data stored in our own database, per vendor.
 * Backed by GET /api/sync/health (JWT). Used for "Data as of" badges and
 * "sync is behind" warnings on dashboards.
 */
class SyncHealthService {
  async getHealth(): Promise<SyncHealthReport> {
    const response = await apiClient.get<SyncHealthReport>(ApiUrls.SYNC_HEALTH.HEALTH);
    return response.data;
  }

  async getProvider(provider: SyncProvider): Promise<ProviderSyncHealth> {
    const response = await apiClient.get<ProviderSyncHealth>(ApiUrls.SYNC_HEALTH.PROVIDER(provider));
    return response.data;
  }
}

export const syncHealthService = new SyncHealthService();
export default syncHealthService;
