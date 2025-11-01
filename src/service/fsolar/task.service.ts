import { apiClient } from '../api-client';
import type {
  FsolarResponse,
  PaginatedResponse,
  EconomicTask,
  ListEconomicTasksRequest,
  AddEconomicTaskRequest,
  AddEconomicTaskResponse,
  UpdateEconomicTaskRequest,
  UpdateEconomicTaskResponse,
  RunTaskRequest,
  RunTaskResponse,
  TaskDetailRequest,
  TaskDeviceDetail,
} from '../../types/fsolar';
import { validatePagination } from './utils';

const FSOLAR_BASE_URL = '/api/api/fsolar';

/**
 * Fsolar Economic Mode Task Service
 * Handles all economic task-related API calls
 */
class FsolarTaskService {
  /**
   * 4.1 List Economic Tasks
   * Get paginated list of economic mode tasks
   * POST /eco-tasks/list
   */
  async listTasks(
    request: ListEconomicTasksRequest
  ): Promise<PaginatedResponse<EconomicTask>> {
    validatePagination(request.pageNum, request.pageSize);

    const response = await apiClient.post<FsolarResponse<PaginatedResponse<EconomicTask>>>(
      `${FSOLAR_BASE_URL}/eco-tasks/list`,
      request
    );
    return response.data.data;
  }

  /**
   * 4.2 Add Economic Task
   * Create a new economic mode task
   * POST /eco-task
   */
  async addTask(request: AddEconomicTaskRequest): Promise<AddEconomicTaskResponse> {
    this.validateTaskRequest(request);

    const response = await apiClient.post<FsolarResponse<AddEconomicTaskResponse>>(
      `${FSOLAR_BASE_URL}/eco-task`,
      request
    );
    return response.data.data;
  }

  /**
   * 4.3 Update Economic Task
   * Update an existing economic task
   * POST /eco-task/update
   */
  async updateTask(
    id: number,
    request: UpdateEconomicTaskRequest
  ): Promise<UpdateEconomicTaskResponse> {
    if (!id || id <= 0) {
      throw new Error('Invalid task ID');
    }

    this.validateTaskRequest(request);

    const requestBody = {
      id: id.toString(),
      ...request,
    };

    const response = await apiClient.post<FsolarResponse<UpdateEconomicTaskResponse>>(
      `${FSOLAR_BASE_URL}/eco-task/update`,
      requestBody
    );
    return response.data.data;
  }

  /**
   * 4.4 Delete Economic Task
   * Delete an economic mode task
   * GET /eco-task/delete/:id
   */
  async deleteTask(id: number): Promise<void> {
    if (!id || id <= 0) {
      throw new Error('Invalid task ID');
    }

    await apiClient.get<FsolarResponse<{}>>(`${FSOLAR_BASE_URL}/eco-task/delete/${id}`);
  }

  /**
   * 4.5 Run Economic Task
   * Execute an economic mode task to apply settings to devices
   * POST /eco-task/run
   * Note: Task execution completes within 2 minutes
   */
  async runTask(request: RunTaskRequest): Promise<RunTaskResponse> {
    if (!request.taskId || request.taskId <= 0) {
      throw new Error('Invalid task ID');
    }

    if (request.runType === 1 && !request.runTaskRecordId) {
      throw new Error('runTaskRecordId is required when runType is 1 (failed resend)');
    }

    const response = await apiClient.post<FsolarResponse<RunTaskResponse>>(
      `${FSOLAR_BASE_URL}/eco-task/run`,
      request
    );
    return response.data.data;
  }

  /**
   * 4.6 Query Task Details
   * Get device details associated with a task
   * POST /eco-task/detail
   */
  async getTaskDetail(taskId: number): Promise<TaskDeviceDetail[]> {
    if (!taskId || taskId <= 0) {
      throw new Error('Invalid task ID');
    }

    const response = await apiClient.post<FsolarResponse<TaskDeviceDetail[]>>(
      `${FSOLAR_BASE_URL}/eco-task/detail`,
      { taskId } as TaskDetailRequest
    );
    return response.data.data;
  }

  // ============================================
  // Helper Methods
  // ============================================

  /**
   * Validate task request
   */
  private validateTaskRequest(
    request: AddEconomicTaskRequest | UpdateEconomicTaskRequest
  ): void {
    if (!request.taskName || request.taskName.trim() === '') {
      throw new Error('Task name is required');
    }

    if (!request.templateId || request.templateId <= 0) {
      throw new Error('Valid template ID is required');
    }

    if (!request.taskType || request.taskType.trim() === '') {
      throw new Error('Task type is required');
    }

    if (!request.targetList || request.targetList.length === 0) {
      throw new Error('At least one device must be assigned to the task');
    }
  }

  /**
   * Run task normally (not a resend)
   */
  async runTaskNormal(taskId: number): Promise<RunTaskResponse> {
    return this.runTask({
      taskId,
      runType: 0,
    });
  }

  /**
   * Resend failed task
   */
  async resendFailedTask(taskId: number, runTaskRecordId: number): Promise<RunTaskResponse> {
    return this.runTask({
      taskId,
      runType: 1,
      runTaskRecordId,
    });
  }

  /**
   * Get all tasks (auto-pagination)
   */
  async getAllTasks(filters?: Omit<ListEconomicTasksRequest, 'pageNum' | 'pageSize'>): Promise<EconomicTask[]> {
    const allTasks: EconomicTask[] = [];
    let currentPage = 1;
    const pageSize = 100;

    while (true) {
      const result = await this.listTasks({
        pageNum: currentPage,
        pageSize,
        ...filters,
      });

      allTasks.push(...result.dataList);

      if (currentPage >= parseInt(result.totalPage)) {
        break;
      }

      currentPage++;
    }

    return allTasks;
  }

  /**
   * Get task count
   */
  async getTaskCount(filters?: Omit<ListEconomicTasksRequest, 'pageNum' | 'pageSize'>): Promise<number> {
    const result = await this.listTasks({
      pageNum: 1,
      pageSize: 1,
      ...filters,
    });
    return parseInt(result.total);
  }

  /**
   * Search tasks by name
   */
  async searchTasks(
    name: string,
    pageNum: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<EconomicTask>> {
    return this.listTasks({
      pageNum,
      pageSize,
      taskName: name,
    });
  }

  /**
   * Get tasks by status
   */
  async getTasksByStatus(
    status: number,
    pageNum: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<EconomicTask>> {
    return this.listTasks({
      pageNum,
      pageSize,
      taskStatus: status,
    });
  }

  /**
   * Get device count for task
   */
  async getTaskDeviceCount(taskId: number): Promise<number> {
    const devices = await this.getTaskDetail(taskId);
    return devices.length;
  }

  /**
   * Get device SNs for task
   */
  async getTaskDeviceSns(taskId: number): Promise<string[]> {
    const devices = await this.getTaskDetail(taskId);
    return devices.map(d => d.deviceSn);
  }
}

export const fsolarTaskService = new FsolarTaskService();
