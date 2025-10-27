import { apiClient } from '../api-client';
import type {
  FsolarResponse,
  PaginatedResponse,
  ListRunRecordsRequest,
  TaskRunRecord,
  RunRecordDetailRequest,
  RunRecordDetail,
} from '../../types/fsolar';
import { validatePagination, RUN_TYPE, TASK_STATUS, fromFsolarTimestamp } from './utils';

const FSOLAR_BASE_URL = '/api/api/fsolar';

/**
 * Fsolar Task Run Records Service
 * Handles task execution history and records
 */
class FsolarRecordService {
  /**
   * 6.1 List Task Run Records
   * Get paginated list of task execution history
   * POST /eco-task/run-record/list
   */
  async listRunRecords(
    request: ListRunRecordsRequest
  ): Promise<PaginatedResponse<TaskRunRecord>> {
    validatePagination(request.pageNum, request.pageSize);

    const response = await apiClient.post<FsolarResponse<PaginatedResponse<TaskRunRecord>>>(
      `${FSOLAR_BASE_URL}/eco-task/run-record/list`,
      request
    );
    return response.data.data;
  }

  /**
   * 6.2 Get Run Record Details
   * Get detailed information about a specific task execution
   * POST /eco-task/run-record/detail
   */
  async getRunRecordDetail(id: number): Promise<RunRecordDetail> {
    if (!id || id <= 0) {
      throw new Error('Invalid run record ID');
    }

    const response = await apiClient.post<FsolarResponse<RunRecordDetail>>(
      `${FSOLAR_BASE_URL}/eco-task/run-record/detail`,
      { id } as RunRecordDetailRequest
    );
    return response.data.data;
  }

  // ============================================
  // Helper Methods
  // ============================================

  /**
   * Get all run records (auto-pagination)
   */
  async getAllRunRecords(
    filters?: Omit<ListRunRecordsRequest, 'pageNum' | 'pageSize'>
  ): Promise<TaskRunRecord[]> {
    const allRecords: TaskRunRecord[] = [];
    let currentPage = 1;
    const pageSize = 100;

    while (true) {
      const result = await this.listRunRecords({
        pageNum: currentPage,
        pageSize,
        ...filters,
      });

      allRecords.push(...result.dataList);

      if (currentPage >= parseInt(result.totalPage)) {
        break;
      }

      currentPage++;
    }

    return allRecords;
  }

  /**
   * Get run records for specific task
   */
  async getTaskRunRecords(
    taskId: number,
    pageNum: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<TaskRunRecord>> {
    return this.listRunRecords({
      pageNum,
      pageSize,
      taskId,
    });
  }

  /**
   * Get run records by status
   */
  async getRunRecordsByStatus(
    status: 0 | 1,
    pageNum: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<TaskRunRecord>> {
    return this.listRunRecords({
      pageNum,
      pageSize,
      taskStatus: status,
    });
  }

  /**
   * Get completed run records
   */
  async getCompletedRunRecords(
    pageNum: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<TaskRunRecord>> {
    return this.getRunRecordsByStatus(TASK_STATUS.DONE, pageNum, pageSize);
  }

  /**
   * Get running task records
   */
  async getRunningTaskRecords(
    pageNum: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<TaskRunRecord>> {
    return this.getRunRecordsByStatus(TASK_STATUS.RUNNING, pageNum, pageSize);
  }

  /**
   * Get normal run records (not resends)
   */
  async getNormalRunRecords(
    pageNum: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<TaskRunRecord>> {
    return this.listRunRecords({
      pageNum,
      pageSize,
      runType: RUN_TYPE.NORMAL,
    });
  }

  /**
   * Get resend run records
   */
  async getResendRunRecords(
    pageNum: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<TaskRunRecord>> {
    return this.listRunRecords({
      pageNum,
      pageSize,
      runType: RUN_TYPE.RESEND,
    });
  }

  /**
   * Get latest run record for a task
   */
  async getLatestRunRecord(taskId: number): Promise<TaskRunRecord | null> {
    const result = await this.getTaskRunRecords(taskId, 1, 1);
    return result.dataList.length > 0 ? result.dataList[0] : null;
  }

  /**
   * Get run record count
   */
  async getRunRecordCount(
    filters?: Omit<ListRunRecordsRequest, 'pageNum' | 'pageSize'>
  ): Promise<number> {
    const result = await this.listRunRecords({
      pageNum: 1,
      pageSize: 1,
      ...filters,
    });
    return parseInt(result.total);
  }

  /**
   * Search run records by task name
   */
  async searchRunRecords(
    taskName: string,
    pageNum: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<TaskRunRecord>> {
    return this.listRunRecords({
      pageNum,
      pageSize,
      taskName,
    });
  }

  /**
   * Get failed run records (records with failures)
   */
  async getFailedRunRecords(
    pageNum: number = 1,
    pageSize: number = 20
  ): Promise<TaskRunRecord[]> {
    const result = await this.getCompletedRunRecords(pageNum, pageSize);
    return result.dataList.filter(record => record.failCount > 0);
  }

  /**
   * Get success rate for a run record
   */
  getSuccessRate(record: TaskRunRecord): number {
    const total = record.successCount + record.failCount;
    if (total === 0) return 0;
    return (record.successCount / total) * 100;
  }

  /**
   * Check if run record is successful (no failures)
   */
  isSuccessful(record: TaskRunRecord): boolean {
    return record.taskStatus === TASK_STATUS.DONE && record.failCount === 0;
  }

  /**
   * Check if run record has failures
   */
  hasFailures(record: TaskRunRecord): boolean {
    return record.failCount > 0;
  }

  /**
   * Format run record create time
   */
  formatCreateTime(record: TaskRunRecord): string {
    return fromFsolarTimestamp(record.createTime).toLocaleString();
  }

  /**
   * Get run record summary
   */
  getRecordSummary(record: TaskRunRecord): {
    total: number;
    success: number;
    failed: number;
    successRate: number;
    status: 'running' | 'completed';
    runType: 'normal' | 'resend';
  } {
    const total = record.successCount + record.failCount;
    const successRate = total > 0 ? (record.successCount / total) * 100 : 0;

    return {
      total,
      success: record.successCount,
      failed: record.failCount,
      successRate: Math.round(successRate * 100) / 100,
      status: record.taskStatus === TASK_STATUS.DONE ? 'completed' : 'running',
      runType: record.runType === RUN_TYPE.NORMAL ? 'normal' : 'resend',
    };
  }

  /**
   * Get detailed summary from run record detail
   */
  getDetailedSummary(detail: RunRecordDetail): {
    total: number;
    success: number;
    failed: number;
    successRate: number;
    devices: {
      successful: string[];
      failed: string[];
    };
  } {
    const total = parseInt(detail.successCount) + parseInt(detail.failCount);
    const successRate = total > 0 ? (parseInt(detail.successCount) / total) * 100 : 0;

    const successful = detail.detailListVOList
      .filter(d => d.commandStatus === 1)
      .map(d => d.deviceSn);

    const failed = detail.detailListVOList
      .filter(d => d.commandStatus === 0)
      .map(d => d.deviceSn);

    return {
      total,
      success: parseInt(detail.successCount),
      failed: parseInt(detail.failCount),
      successRate: Math.round(successRate * 100) / 100,
      devices: {
        successful,
        failed,
      },
    };
  }

  /**
   * Export run records to CSV format
   */
  exportToCSV(records: TaskRunRecord[]): string {
    const headers = [
      'ID',
      'Task Name',
      'Task Type',
      'Run Type',
      'Status',
      'Success Count',
      'Fail Count',
      'Success Rate',
      'Create Time',
    ];

    const rows = records.map(record => {
      const summary = this.getRecordSummary(record);
      return [
        record.id,
        record.taskName,
        record.taskType,
        summary.runType,
        summary.status,
        record.successCount,
        record.failCount,
        `${summary.successRate}%`,
        this.formatCreateTime(record),
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return csvContent;
  }
}

export const fsolarRecordService = new FsolarRecordService();
