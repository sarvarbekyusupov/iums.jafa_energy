import { apiClient } from './api-client';
import { ApiUrls } from '../api/api-urls';
import type {
  CommunicationModule,
  CreateCommunicationModuleDto,
  UpdateCommunicationModuleDto,
  CommunicationModuleFilters
} from '../types/api';

class CommunicationModulesService {
  /**
   * Get all communication modules
   * @param filters Optional filters (siteId, status)
   * @returns Array of communication modules
   */
  async getAllModules(filters?: CommunicationModuleFilters): Promise<CommunicationModule[]> {
    const params = new URLSearchParams();
    if (filters?.siteId) params.append('siteId', filters.siteId.toString());
    if (filters?.status) params.append('status', filters.status);

    const url = params.toString()
      ? `${ApiUrls.HOPECLOUD.COMMUNICATION_MODULES}?${params.toString()}`
      : ApiUrls.HOPECLOUD.COMMUNICATION_MODULES;

    const response = await apiClient.get<CommunicationModule[]>(url);
    return response.data;
  }

  /**
   * Get a single communication module by ID
   * @param id Module ID
   * @returns Communication module
   */
  async getModuleById(id: number): Promise<CommunicationModule> {
    const response = await apiClient.get<CommunicationModule>(
      ApiUrls.HOPECLOUD.COMMUNICATION_MODULE_BY_ID(id)
    );
    return response.data;
  }

  /**
   * Create a new communication module
   * @param dto Create communication module DTO
   * @returns Created communication module
   */
  async createModule(dto: CreateCommunicationModuleDto): Promise<CommunicationModule> {
    const response = await apiClient.post<CommunicationModule>(
      ApiUrls.HOPECLOUD.COMMUNICATION_MODULES,
      dto
    );
    return response.data;
  }

  /**
   * Update an existing communication module
   * @param id Module ID
   * @param dto Update communication module DTO
   * @returns Updated communication module
   */
  async updateModule(id: number, dto: UpdateCommunicationModuleDto): Promise<CommunicationModule> {
    const response = await apiClient.put<CommunicationModule>(
      ApiUrls.HOPECLOUD.COMMUNICATION_MODULE_BY_ID(id),
      dto
    );
    return response.data;
  }

  /**
   * Delete a communication module
   * @param id Module ID
   */
  async deleteModule(id: number): Promise<void> {
    await apiClient.delete(ApiUrls.HOPECLOUD.COMMUNICATION_MODULE_BY_ID(id));
  }
}

export const communicationModulesService = new CommunicationModulesService();
