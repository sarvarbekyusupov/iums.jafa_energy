import { apiClient } from '../api-client';
import type {
  FsolarResponse,
  TaskRuntimeDetailRequest,
  TaskRuntimeDetail,
} from '../../types/fsolar';
import { TASK_STATUS, COMMAND_STATUS } from './utils';

const FSOLAR_BASE_URL = '/api/fsolar';

/**
 * Task monitoring callback types
 */
export type TaskUpdateCallback = (status: TaskRuntimeDetail) => void;
export type TaskCompleteCallback = (status: TaskRuntimeDetail) => void;
export type TaskErrorCallback = (error: any) => void;

/**
 * Task Monitor Class
 * Handles real-time monitoring of task execution with polling
 */
export class TaskMonitor {
  private taskId?: number;
  private runTaskRecordId: number;
  private interval: NodeJS.Timeout | null = null;
  private pollCount: number = 0;
  private maxPolls: number;
  private pollIntervalMs: number;

  constructor(
    runTaskRecordId: number,
    taskId?: number,
    options: { maxPolls?: number; pollIntervalMs?: number } = {}
  ) {
    this.taskId = taskId;
    this.runTaskRecordId = runTaskRecordId;
    this.maxPolls = options.maxPolls || 30; // Default: 2.5 minutes with 5-second intervals
    this.pollIntervalMs = options.pollIntervalMs || 5000; // Default: 5 seconds
  }

  /**
   * Start monitoring task execution
   */
  start(
    onUpdate: TaskUpdateCallback,
    onComplete: TaskCompleteCallback,
    onError: TaskErrorCallback
  ): void {
    if (this.interval) {
      throw new Error('Monitor already started');
    }

    this.interval = setInterval(async () => {
      try {
        const status = await this.checkStatus();

        if (status.taskStatus === TASK_STATUS.DONE) {
          // Task completed
          this.stop();
          onComplete(status);
        } else {
          // Task still running
          onUpdate(status);
          this.pollCount++;

          if (this.pollCount >= this.maxPolls) {
            // Timeout - task taking too long
            this.stop();
            onError(new Error('Task monitoring timeout'));
          }
        }
      } catch (error) {
        this.stop();
        onError(error);
      }
    }, this.pollIntervalMs);
  }

  /**
   * Check current task status
   */
  async checkStatus(): Promise<TaskRuntimeDetail> {
    return fsolarMonitorService.getTaskRuntimeDetail({
      taskId: this.taskId,
      runTaskRecordId: this.runTaskRecordId,
    });
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /**
   * Check if monitor is running
   */
  isRunning(): boolean {
    return this.interval !== null;
  }

  /**
   * Get current poll count
   */
  getPollCount(): number {
    return this.pollCount;
  }
}

/**
 * Fsolar Task Runtime Monitoring Service
 * Handles real-time task execution monitoring
 */
class FsolarMonitorService {
  /**
   * 5.1 Query Task Runtime Details
   * Monitor real-time execution status of a running task
   * POST /eco-task/running-detail
   */
  async getTaskRuntimeDetail(request: TaskRuntimeDetailRequest): Promise<TaskRuntimeDetail> {
    if (!request.runTaskRecordId) {
      throw new Error('Invalid run task record ID');
    }

    // Convert IDs to strings for API
    const requestBody = {
      taskId: request.taskId ? String(request.taskId) : undefined,
      runTaskRecordId: String(request.runTaskRecordId),
    };

    const response = await apiClient.post<FsolarResponse<TaskRuntimeDetail>>(
      `${FSOLAR_BASE_URL}/eco-task/running-detail`,
      requestBody
    );
    return response.data.data;
  }

  // ============================================
  // Helper Methods
  // ============================================

  /**
   * Create a new task monitor
   */
  createMonitor(
    runTaskRecordId: number,
    taskId?: number,
    options?: { maxPolls?: number; pollIntervalMs?: number }
  ): TaskMonitor {
    return new TaskMonitor(runTaskRecordId, taskId, options);
  }

  /**
   * Monitor task with promise-based API
   */
  async monitorTaskUntilComplete(
    runTaskRecordId: number,
    taskId?: number,
    options?: { maxPolls?: number; pollIntervalMs?: number; onUpdate?: TaskUpdateCallback }
  ): Promise<TaskRuntimeDetail> {
    return new Promise((resolve, reject) => {
      const monitor = this.createMonitor(runTaskRecordId, taskId, options);

      monitor.start(
        (status) => {
          if (options?.onUpdate) {
            options.onUpdate(status);
          }
        },
        (status) => resolve(status),
        (error) => reject(error)
      );
    });
  }

  /**
   * Get task progress percentage (0-100)
   */
  getProgressPercentage(status: TaskRuntimeDetail): number {
    const total = status.successCount + status.failCount;
    if (total === 0) return 0;

    // If task is done, return 100%
    if (status.taskStatus === TASK_STATUS.DONE) {
      return 100;
    }

    // Otherwise calculate based on completed vs total
    const totalDevices = status.detailListVOList.length;
    if (totalDevices === 0) return 0;

    return Math.round((total / totalDevices) * 100);
  }

  /**
   * Get successful devices
   */
  getSuccessfulDevices(status: TaskRuntimeDetail): string[] {
    return status.detailListVOList
      .filter(device => device.commandStatus === COMMAND_STATUS.SUCCESS)
      .map(device => device.deviceSn);
  }

  /**
   * Get failed devices
   */
  getFailedDevices(status: TaskRuntimeDetail): string[] {
    return status.detailListVOList
      .filter(device => device.commandStatus === COMMAND_STATUS.FAILED)
      .map(device => device.deviceSn);
  }

  /**
   * Get waiting devices
   */
  getWaitingDevices(status: TaskRuntimeDetail): string[] {
    return status.detailListVOList
      .filter(device => device.commandStatus === COMMAND_STATUS.WAITING)
      .map(device => device.deviceSn);
  }

  /**
   * Check if task is complete
   */
  isTaskComplete(status: TaskRuntimeDetail): boolean {
    return status.taskStatus === TASK_STATUS.DONE;
  }

  /**
   * Check if task is running
   */
  isTaskRunning(status: TaskRuntimeDetail): boolean {
    return status.taskStatus === TASK_STATUS.RUNNING;
  }

  /**
   * Get remaining time in seconds
   */
  getRemainingTimeSeconds(status: TaskRuntimeDetail): number {
    return status.remainTime;
  }

  /**
   * Format remaining time as string (e.g., "1m 30s")
   */
  formatRemainingTime(status: TaskRuntimeDetail): string {
    const seconds = status.remainTime;
    if (seconds <= 0) return '0s';

    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  }

  /**
   * Get task summary
   */
  getTaskSummary(status: TaskRuntimeDetail): {
    total: number;
    success: number;
    failed: number;
    waiting: number;
    successRate: number;
  } {
    const total = status.detailListVOList.length;
    const success = status.successCount;
    const failed = status.failCount;
    const waiting = total - success - failed;
    const successRate = total > 0 ? (success / total) * 100 : 0;

    return {
      total,
      success,
      failed,
      waiting,
      successRate: Math.round(successRate * 100) / 100, // Round to 2 decimal places
    };
  }
}

export const fsolarMonitorService = new FsolarMonitorService();
