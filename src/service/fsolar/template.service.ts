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

    // At least one strategy must be provided
    const hasStrategy = Object.keys(request).some(key =>
      key.startsWith('strategy') && request[key as keyof typeof request]
    );

    if (!hasStrategy) {
      throw new Error('At least one strategy must be provided');
    }
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
