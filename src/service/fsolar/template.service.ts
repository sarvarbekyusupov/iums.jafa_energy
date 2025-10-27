import { apiClient } from '../api-client';
import type {
  FsolarResponse,
  PaginatedResponse,
  EconomicStrategyTemplate,
  ListTemplatesRequest,
  AddTemplateRequest,
  AddTemplateResponse,
  UpdateTemplateRequest,
  UpdateTemplateResponse,
  StrategyTimeSlot,
} from '../../types/fsolar';
import { validatePagination } from './utils';

const FSOLAR_BASE_URL = '/api/api/fsolar';

/**
 * Fsolar Economic Strategy Template Service
 * Handles all economic strategy template-related API calls
 */
class FsolarTemplateService {
  /**
   * 3.1 List Strategy Templates
   * Get paginated list of economic strategy templates
   * POST /eco-strategy-templates/list
   */
  async listTemplates(
    request: ListTemplatesRequest
  ): Promise<PaginatedResponse<EconomicStrategyTemplate>> {
    validatePagination(request.pageNum, request.pageSize);

    const response = await apiClient.post<
      FsolarResponse<PaginatedResponse<EconomicStrategyTemplate>>
    >(`${FSOLAR_BASE_URL}/eco-strategy-templates/list`, request);
    return response.data.data;
  }

  /**
   * 3.2 Add Strategy Template
   * Create a new economic strategy template
   * POST /eco-strategy-template
   * Note: All 4 strategy slots (strategy1-4) must be provided. Use type: 0 for empty slots.
   */
  async addTemplate(request: AddTemplateRequest): Promise<AddTemplateResponse> {
    this.validateTemplateRequest(request);

    const response = await apiClient.post<FsolarResponse<AddTemplateResponse>>(
      `${FSOLAR_BASE_URL}/eco-strategy-template`,
      request
    );
    return response.data.data;
  }

  /**
   * 3.3 Get Template Details
   * Retrieve detailed information about a template
   * GET /eco-strategy-template/:id
   */
  async getTemplate(id: number): Promise<EconomicStrategyTemplate> {
    if (!id || id <= 0) {
      throw new Error('Invalid template ID');
    }

    const response = await apiClient.get<FsolarResponse<EconomicStrategyTemplate>>(
      `${FSOLAR_BASE_URL}/eco-strategy-template/${id}`
    );
    return response.data.data;
  }

  /**
   * 3.4 Update Strategy Template
   * Update an existing strategy template
   * PUT /eco-strategy-template/:id
   */
  async updateTemplate(
    id: number,
    request: UpdateTemplateRequest
  ): Promise<UpdateTemplateResponse> {
    if (!id || id <= 0) {
      throw new Error('Invalid template ID');
    }

    this.validateTemplateRequest(request);

    const response = await apiClient.put<FsolarResponse<UpdateTemplateResponse>>(
      `${FSOLAR_BASE_URL}/eco-strategy-template/${id}`,
      request
    );
    return response.data.data;
  }

  /**
   * 3.5 Delete Strategy Template
   * Delete a strategy template
   * DELETE /eco-strategy-template/:id
   */
  async deleteTemplate(id: number): Promise<void> {
    if (!id || id <= 0) {
      throw new Error('Invalid template ID');
    }

    await apiClient.delete<FsolarResponse<{}>>(`${FSOLAR_BASE_URL}/eco-strategy-template/${id}`);
  }

  // ============================================
  // Helper Methods
  // ============================================

  /**
   * Validate template request
   */
  private validateTemplateRequest(
    request: AddTemplateRequest | UpdateTemplateRequest
  ): void {
    if (!request.templateName || request.templateName.trim() === '') {
      throw new Error('Template name is required');
    }

    // Validate all 4 strategy slots are present
    if (!request.strategy1 || !request.strategy2 || !request.strategy3 || !request.strategy4) {
      throw new Error('All 4 strategy slots must be provided');
    }

    // Validate each active strategy
    const strategies = [
      request.strategy1,
      request.strategy2,
      request.strategy3,
      request.strategy4,
    ];

    strategies.forEach((strategy, index) => {
      if (strategy.type === 1) {
        this.validateActiveStrategy(strategy, index + 1);
      }
    });

    // Check for time overlaps
    this.checkTimeOverlaps(strategies);
  }

  /**
   * Validate active strategy slot
   */
  private validateActiveStrategy(strategy: StrategyTimeSlot, slotNumber: number): void {
    if (!strategy.startTime || !strategy.endTime) {
      throw new Error(`Strategy ${slotNumber}: Start time and end time are required`);
    }

    if (!this.isValidTimeFormat(strategy.startTime)) {
      throw new Error(`Strategy ${slotNumber}: Invalid start time format (use HH:MM)`);
    }

    if (!this.isValidTimeFormat(strategy.endTime)) {
      throw new Error(`Strategy ${slotNumber}: Invalid end time format (use HH:MM)`);
    }

    if (strategy.mode === undefined) {
      throw new Error(`Strategy ${slotNumber}: Mode is required`);
    }

    if (strategy.power === undefined || strategy.power < 0) {
      throw new Error(`Strategy ${slotNumber}: Valid power value is required`);
    }
  }

  /**
   * Validate time format (HH:MM)
   */
  private isValidTimeFormat(time: string): boolean {
    const regex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    return regex.test(time);
  }

  /**
   * Check for time overlaps between strategies
   */
  private checkTimeOverlaps(strategies: StrategyTimeSlot[]): void {
    const activeStrategies = strategies.filter(s => s.type === 1);

    for (let i = 0; i < activeStrategies.length; i++) {
      for (let j = i + 1; j < activeStrategies.length; j++) {
        const strategy1 = activeStrategies[i];
        const strategy2 = activeStrategies[j];

        if (this.timeRangesOverlap(
          strategy1.startTime!,
          strategy1.endTime!,
          strategy2.startTime!,
          strategy2.endTime!
        )) {
          throw new Error('Strategy time ranges cannot overlap');
        }
      }
    }
  }

  /**
   * Check if two time ranges overlap
   */
  private timeRangesOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    const getMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const s1 = getMinutes(start1);
    const e1 = getMinutes(end1);
    const s2 = getMinutes(start2);
    const e2 = getMinutes(end2);

    return (s1 < e2 && e1 > s2);
  }

  /**
   * Create empty strategy slot
   */
  createEmptySlot(): StrategyTimeSlot {
    return { type: 0 };
  }

  /**
   * Create active strategy slot
   */
  createActiveSlot(
    startTime: string,
    endTime: string,
    mode: number,
    power: number
  ): StrategyTimeSlot {
    return {
      type: 1,
      startTime,
      endTime,
      mode,
      power,
    };
  }

  /**
   * Get all templates (auto-pagination)
   */
  async getAllTemplates(templateName?: string): Promise<EconomicStrategyTemplate[]> {
    const allTemplates: EconomicStrategyTemplate[] = [];
    let currentPage = 1;
    const pageSize = 100;

    while (true) {
      const result = await this.listTemplates({
        pageNum: currentPage,
        pageSize,
        templateName,
      });

      allTemplates.push(...result.dataList);

      if (currentPage >= parseInt(result.totalPage)) {
        break;
      }

      currentPage++;
    }

    return allTemplates;
  }

  /**
   * Get template count
   */
  async getTemplateCount(templateName?: string): Promise<number> {
    const result = await this.listTemplates({
      pageNum: 1,
      pageSize: 1,
      templateName,
    });
    return parseInt(result.total);
  }

  /**
   * Check if template exists
   */
  async templateExists(id: number): Promise<boolean> {
    try {
      await this.getTemplate(id);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Search templates by name
   */
  async searchTemplates(
    name: string,
    pageNum: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<EconomicStrategyTemplate>> {
    return this.listTemplates({
      pageNum,
      pageSize,
      templateName: name,
    });
  }
}

export const fsolarTemplateService = new FsolarTemplateService();
