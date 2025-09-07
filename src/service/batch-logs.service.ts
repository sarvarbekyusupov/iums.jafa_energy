import { apiClient } from './api-client';

interface CreateFusionSolarBatchLogDto {
  batchType: string;
  status: 'started' | 'completed' | 'failed';
  recordsProcessed: number;
  recordsFailed: number;
  errorMessage?: string;
  batchData: any;
  startedAt: string;
  completedAt?: string;
}

interface UpdateFusionSolarBatchLogDto {
  batchType?: string;
  status?: 'started' | 'completed' | 'failed';
  recordsProcessed?: number;
  recordsFailed?: number;
  errorMessage?: string;
  batchData?: any;
  startedAt?: string;
  completedAt?: string;
}

interface FusionSolarBatchLogResponseDto {
  id: number;
  batchType: string;
  status: 'started' | 'completed' | 'failed';
  recordsProcessed: number;
  recordsFailed: number;
  errorMessage?: string;
  batchData: any;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
}

interface BatchStats {
  totalBatches: number;
  completedBatches: number;
  failedBatches: number;
  runningBatches: number;
  totalRecordsProcessed: number;
  totalRecordsFailed: number;
  successRate: number;
}

interface BatchFilters {
  batchType?: string;
  status?: 'started' | 'completed' | 'failed';
}

class BatchLogsService {
  private readonly baseUrl = '/api/fusion-solar-batch-logs';

  // Batch Log Management
  async createBatchLog(data: CreateFusionSolarBatchLogDto): Promise<FusionSolarBatchLogResponseDto> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  async getAllBatchLogs(filters?: BatchFilters): Promise<FusionSolarBatchLogResponseDto[]> {
    const params = new URLSearchParams();
    if (filters?.batchType) params.append('batchType', filters.batchType);
    if (filters?.status) params.append('status', filters.status);

    const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  async getBatchLogById(id: number): Promise<FusionSolarBatchLogResponseDto> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async updateBatchLog(id: number, data: UpdateFusionSolarBatchLogDto): Promise<FusionSolarBatchLogResponseDto> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteBatchLog(id: number) {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Statistics
  async getStats(): Promise<BatchStats> {
    const response = await apiClient.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  // Cleanup
  async cleanupOldLogs(olderThanDays?: number): Promise<{ message: string; cleanedCount: number }> {
    const params = new URLSearchParams();
    if (olderThanDays) params.append('olderThanDays', olderThanDays.toString());

    const response = await apiClient.delete(`${this.baseUrl}/cleanup/completed?${params.toString()}`);
    return response.data;
  }
}

export const batchLogsService = new BatchLogsService();