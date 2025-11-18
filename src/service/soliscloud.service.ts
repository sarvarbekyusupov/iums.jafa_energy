import { apiClient } from './api-client';
import type {
  SolisCloudResponse,
  PageResponse,
  // Inverter types
  InverterListResponse,
  InverterDetail,
  InverterDayData,
  InverterMonthData,
  InverterYearData,
  DeviceAlarm,
  // Collector types
  Collector,
  CollectorDetail,
  CollectorSignalData,
  // EPM types
  EPM,
  EPMDayData,
  EPMMonthData,
  // Weather types
  WeatherStation,
  WeatherStationDetail,
  // Station types
  Station,
  StationDetail,
  StationDayEnergy,
  StationDayData,
  StationMonthData,
  StationYearData,
  // Parameter types
  InverterListParams,
  InverterDetailParams,
  InverterDayParams,
  InverterMonthParams,
  InverterYearParams,
  AlarmListParams,
  CollectorListParams,
  CollectorDayParams,
  EPMListParams,
  WeatherListParams,
  StationDayListParams,
  StationMonthListParams,
  StationYearListParams,
  StationDayParams,
  StationMonthParams,
  StationYearParams,
  StationAllYearsParams,
  PaginationParams,
} from '../types/soliscloud';

const BASE_URL = '/api/soliscloud';
const DB_BASE_URL = '/api/soliscloud/db';

class SolisCloudService {
  // ===== Section 1: Inverter APIs =====

  /**
   * Get paginated list of all inverters
   */
  async getInverterList(params: InverterListParams): Promise<InverterListResponse> {
    const response = await apiClient.post<SolisCloudResponse<InverterListResponse>>(
      `${BASE_URL}/inverters/list`,
      params
    );
    return response.data.data;
  }

  /**
   * Get comprehensive details for one specific inverter
   */
  async getInverterDetail(params: InverterDetailParams): Promise<InverterDetail> {
    const response = await apiClient.post<SolisCloudResponse<InverterDetail>>(
      `${BASE_URL}/inverter/detail`,
      params
    );
    return response.data.data;
  }

  /**
   * Get detailed information for multiple inverters at once
   */
  async getInvertersDetailList(params: PaginationParams & { stationId?: string }): Promise<PageResponse<InverterDetail>> {
    const response = await apiClient.post<SolisCloudResponse<{ records: InverterDetail[] }>>(
      `${BASE_URL}/inverters/detail-list`,
      params
    );
    return response.data.data as PageResponse<InverterDetail>;
  }

  /**
   * Get real-time data for a specific day (5-minute intervals)
   */
  async getInverterDayData(params: InverterDayParams): Promise<InverterDayData[]> {
    const response = await apiClient.post<SolisCloudResponse<InverterDayData[]>>(
      `${BASE_URL}/inverter/day`,
      params
    );
    return response.data.data;
  }

  /**
   * Get daily data for a specific month
   */
  async getInverterMonthData(params: InverterMonthParams): Promise<InverterMonthData[]> {
    const response = await apiClient.post<SolisCloudResponse<InverterMonthData[]>>(
      `${BASE_URL}/inverter/month`,
      params
    );
    return response.data.data;
  }

  /**
   * Get monthly data for a specific year
   */
  async getInverterYearData(params: InverterYearParams): Promise<InverterYearData[]> {
    const response = await apiClient.post<SolisCloudResponse<InverterYearData[]>>(
      `${BASE_URL}/inverter/year`,
      params
    );
    return response.data.data;
  }

  /**
   * Get all alarms/warnings from devices
   */
  async getAlarmList(params: AlarmListParams): Promise<PageResponse<DeviceAlarm>> {
    const response = await apiClient.post<SolisCloudResponse<PageResponse<DeviceAlarm>>>(
      `${BASE_URL}/alarms/list`,
      params
    );
    return response.data.data;
  }

  // ===== Section 2: Collector APIs =====

  /**
   * Get list of all data collectors
   */
  async getCollectorList(params: CollectorListParams): Promise<PageResponse<Collector>> {
    const response = await apiClient.post<SolisCloudResponse<{ page: PageResponse<Collector> }>>(
      `${BASE_URL}/collectors/list`,
      params
    );
    return response.data.data.page;
  }

  /**
   * Get detailed information for a specific collector
   */
  async getCollectorDetail(params: InverterDetailParams): Promise<CollectorDetail> {
    const response = await apiClient.post<SolisCloudResponse<CollectorDetail>>(
      `${BASE_URL}/collector/detail`,
      params
    );
    return response.data.data;
  }

  /**
   * Get detailed information for multiple collectors at once
   */
  async getCollectorsDetailList(params: PaginationParams & { stationId?: string }): Promise<PageResponse<CollectorDetail>> {
    const response = await apiClient.post<SolisCloudResponse<{ records: CollectorDetail[] }>>(
      `${BASE_URL}/collectors/detail-list`,
      params
    );
    return response.data.data as PageResponse<CollectorDetail>;
  }

  /**
   * Get signal strength data for a specific day
   */
  async getCollectorDayData(params: CollectorDayParams): Promise<CollectorSignalData[]> {
    const response = await apiClient.post<SolisCloudResponse<CollectorSignalData[]>>(
      `${BASE_URL}/collector/day`,
      params
    );
    return response.data.data;
  }

  // ===== Section 3: EPM (Energy Power Meter) APIs =====

  /**
   * Get list of all EPM devices
   */
  async getEPMList(params: EPMListParams): Promise<PageResponse<EPM>> {
    const response = await apiClient.post<SolisCloudResponse<{ page: PageResponse<EPM> }>>(
      `${BASE_URL}/epm/list`,
      params
    );
    return response.data.data.page;
  }

  /**
   * Get EPM device details
   */
  async getEPMDetail(params: InverterDetailParams): Promise<EPM> {
    const response = await apiClient.post<SolisCloudResponse<EPM>>(
      `${BASE_URL}/epm/detail`,
      params
    );
    return response.data.data;
  }

  /**
   * Get EPM day data
   */
  async getEPMDayData(params: InverterDayParams): Promise<EPMDayData[]> {
    const response = await apiClient.post<SolisCloudResponse<EPMDayData[]>>(
      `${BASE_URL}/epm/day`,
      params
    );
    return response.data.data;
  }

  /**
   * Get EPM month data
   */
  async getEPMMonthData(params: InverterMonthParams): Promise<EPMMonthData[]> {
    const response = await apiClient.post<SolisCloudResponse<EPMMonthData[]>>(
      `${BASE_URL}/epm/month`,
      params
    );
    return response.data.data;
  }

  // ===== Section 4: Weather Station APIs =====

  /**
   * Get list of all weather stations
   */
  async getWeatherStationList(params: WeatherListParams): Promise<PageResponse<WeatherStation>> {
    const response = await apiClient.post<SolisCloudResponse<{ page: PageResponse<WeatherStation> }>>(
      `${BASE_URL}/weather/list`,
      params
    );
    return response.data.data.page;
  }

  /**
   * Get weather data from a specific station
   */
  async getWeatherStationDetail(params: { sn: string }): Promise<WeatherStationDetail> {
    const response = await apiClient.post<SolisCloudResponse<WeatherStationDetail>>(
      `${BASE_URL}/weather/detail`,
      params
    );
    return response.data.data;
  }

  // ===== Section 5: Station/Plant APIs =====

  /**
   * Get all power stations under account
   */
  async getStationList(params: PaginationParams): Promise<PageResponse<Station>> {
    const response = await apiClient.post<SolisCloudResponse<{ page: PageResponse<Station> }>>(
      `${BASE_URL}/stations/list`,
      params
    );
    return response.data.data.page;
  }

  /**
   * Get comprehensive details for one station
   */
  async getStationDetail(params: { id: string }): Promise<StationDetail> {
    const response = await apiClient.post<SolisCloudResponse<StationDetail>>(
      `${BASE_URL}/station/detail`,
      params
    );
    return response.data.data;
  }

  /**
   * Get detailed list of multiple stations
   */
  async getStationDetailList(params: PaginationParams): Promise<PageResponse<StationDetail>> {
    const response = await apiClient.post<SolisCloudResponse<PageResponse<StationDetail>>>(
      `${BASE_URL}/stations/detail-list`,
      params
    );
    return response.data.data;
  }

  /**
   * Get daily energy data for multiple stations
   */
  async getStationDayList(params: StationDayListParams): Promise<StationDayEnergy[]> {
    const response = await apiClient.post<SolisCloudResponse<{ records: StationDayEnergy[] }>>(
      `${BASE_URL}/stations/day-list`,
      params
    );
    return response.data.data.records;
  }

  /**
   * Get monthly energy data for multiple stations
   */
  async getStationMonthList(params: StationMonthListParams): Promise<StationDayEnergy[]> {
    const response = await apiClient.post<SolisCloudResponse<{ records: StationDayEnergy[] }>>(
      `${BASE_URL}/stations/month-list`,
      params
    );
    return response.data.data.records;
  }

  /**
   * Get yearly energy data for multiple stations
   */
  async getStationYearList(params: StationYearListParams): Promise<StationDayEnergy[]> {
    const response = await apiClient.post<SolisCloudResponse<{ records: StationDayEnergy[] }>>(
      `${BASE_URL}/stations/year-list`,
      params
    );
    return response.data.data.records;
  }

  /**
   * Get real-time data for single station on specific day
   */
  async getStationDayData(params: StationDayParams): Promise<StationDayData[]> {
    const response = await apiClient.post<SolisCloudResponse<StationDayData[]>>(
      `${BASE_URL}/station/day`,
      params
    );
    return response.data.data;
  }

  /**
   * Get station month data
   */
  async getStationMonthData(params: StationMonthParams): Promise<StationMonthData[]> {
    const response = await apiClient.post<SolisCloudResponse<StationMonthData[]>>(
      `${BASE_URL}/station/month`,
      params
    );
    return response.data.data;
  }

  /**
   * Get station year data
   */
  async getStationYearData(params: StationYearParams): Promise<StationYearData[]> {
    const response = await apiClient.post<SolisCloudResponse<StationYearData[]>>(
      `${BASE_URL}/station/year`,
      params
    );
    return response.data.data;
  }

  /**
   * Get station all years data
   */
  async getStationAllYearsData(params: StationAllYearsParams): Promise<StationYearData[]> {
    const response = await apiClient.post<SolisCloudResponse<StationYearData[]>>(
      `${BASE_URL}/station/all-years`,
      params
    );
    return response.data.data;
  }

  // ===== Management APIs (POST/Modify Methods) - USE WITH CAUTION =====

  /**
   * ⚠️ Add a new station (creates real data)
   */
  async addStation(params: {
    stationName: string;
    type: number;
    capacity: number;
    address?: string;
  }): Promise<{ id: string }> {
    const response = await apiClient.post<SolisCloudResponse<{ id: string }>>(
      `${BASE_URL}/station/add`,
      params
    );
    return response.data.data;
  }

  /**
   * ⚠️ Update station information (modifies existing data)
   */
  async updateStation(params: {
    id: string;
    stationName?: string;
    capacity?: number;
    address?: string;
  }): Promise<any> {
    const response = await apiClient.post<SolisCloudResponse<any>>(
      `${BASE_URL}/station/update`,
      params
    );
    return response.data.data;
  }

  /**
   * ⚠️ Bind collector to station
   */
  async bindCollector(params: { stationId: string; collectorSn: string }): Promise<any> {
    const response = await apiClient.post<SolisCloudResponse<any>>(
      `${BASE_URL}/station/bind-collector`,
      params
    );
    return response.data.data;
  }

  /**
   * ⚠️ Unbind collector from station
   */
  async unbindCollector(params: { stationId: string; collectorSn: string }): Promise<any> {
    const response = await apiClient.post<SolisCloudResponse<any>>(
      `${BASE_URL}/station/unbind-collector`,
      params
    );
    return response.data.data;
  }

  /**
   * ⚠️ Bind inverter to station
   */
  async bindInverter(params: { stationId: string; inverterSn: string }): Promise<any> {
    const response = await apiClient.post<SolisCloudResponse<any>>(
      `${BASE_URL}/station/bind-inverter`,
      params
    );
    return response.data.data;
  }

  // ===== New APIs =====

  /**
   * Get collector signal strength data for a specific day
   */
  async getCollectorSignal(params: { sn: string; time: string; timeZone: number }): Promise<any[]> {
    const response = await apiClient.post<SolisCloudResponse<any[]>>(
      `${BASE_URL}/collector/signal`,
      params
    );
    return response.data.data;
  }

  /**
   * Get inverter warranty/quality assurance data
   */
  async getInverterWarranty(params: PaginationParams & { sn?: string }): Promise<PageResponse<any>> {
    const response = await apiClient.post<SolisCloudResponse<PageResponse<any>>>(
      `${BASE_URL}/inverters/quality-assurance`,
      params
    );
    return response.data.data;
  }

  /**
   * Get EPM monthly data for a specific year
   */
  async getEpmYearData(params: { sn: string; year: string }): Promise<any[]> {
    const response = await apiClient.post<SolisCloudResponse<any[]>>(
      `${BASE_URL}/epm/year`,
      params
    );
    return response.data.data;
  }

  /**
   * Get EPM annual data for all years
   */
  async getEpmAllYears(params: { sn: string }): Promise<any[]> {
    const response = await apiClient.post<SolisCloudResponse<any[]>>(
      `${BASE_URL}/epm/all-years`,
      params
    );
    return response.data.data;
  }

  // ===== Section 6: Database Sync APIs (from synced DB) =====

  /**
   * Get all inverters from database
   */
  async getDbInverters(params?: { page?: number; limit?: number; stationId?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.stationId) queryParams.append('stationId', params.stationId);

    const response = await apiClient.get<any>(
      `${DB_BASE_URL}/inverters${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    );
    return response.data;
  }

  /**
   * Get single inverter from database
   */
  async getDbInverter(id: string): Promise<any> {
    const response = await apiClient.get<any>(`${DB_BASE_URL}/inverters/${id}`);
    return response.data;
  }

  /**
   * Get inverter daily readings from database
   */
  async getDbInverterReadings(id: string, params?: { startDate?: string; endDate?: string; limit?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<any>(
      `${DB_BASE_URL}/inverters/${id}/readings${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    );
    return response.data;
  }

  /**
   * Get latest inverter reading from database
   */
  async getDbInverterLatestReading(id: string): Promise<any> {
    const response = await apiClient.get<any>(`${DB_BASE_URL}/inverters/${id}/latest-reading`);
    return response.data;
  }

  /**
   * Get inverter monthly data from database
   */
  async getDbInverterMonths(id: string, params?: { limit?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<any>(
      `${DB_BASE_URL}/inverters/${id}/months${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    );
    return response.data;
  }

  /**
   * Get inverter yearly data from database
   */
  async getDbInverterYears(id: string, params?: { limit?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<any>(
      `${DB_BASE_URL}/inverters/${id}/years${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    );
    return response.data;
  }

  /**
   * Get all inverter monthly data from database
   */
  async getDbInverterMonthsAll(params?: { page?: number; limit?: number; inverterId?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.inverterId) queryParams.append('inverterId', params.inverterId);

    const response = await apiClient.get<any>(
      `${DB_BASE_URL}/inverter-months${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    );
    return response.data;
  }

  /**
   * Get all inverter yearly data from database
   */
  async getDbInverterYearsAll(params?: { page?: number; limit?: number; inverterId?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.inverterId) queryParams.append('inverterId', params.inverterId);

    const response = await apiClient.get<any>(
      `${DB_BASE_URL}/inverter-years${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    );
    return response.data;
  }

  /**
   * Get all stations from database
   */
  async getDbStations(params?: { page?: number; limit?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<any>(
      `${DB_BASE_URL}/stations${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    );
    return response.data;
  }

  /**
   * Get single station from database
   */
  async getDbStation(id: string): Promise<any> {
    const response = await apiClient.get<any>(`${DB_BASE_URL}/stations/${id}`);
    return response.data;
  }

  /**
   * Get station daily readings from database
   */
  async getDbStationReadings(id: string, params?: { startDate?: string; endDate?: string; limit?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<any>(
      `${DB_BASE_URL}/stations/${id}/readings${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    );
    return response.data;
  }

  /**
   * Get latest station reading from database
   */
  async getDbStationLatestReading(id: string): Promise<any> {
    const response = await apiClient.get<any>(`${DB_BASE_URL}/stations/${id}/latest-reading`);
    return response.data;
  }

  /**
   * Get station monthly data from database
   */
  async getDbStationMonths(id: string, params?: { limit?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<any>(
      `${DB_BASE_URL}/stations/${id}/months${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    );
    return response.data;
  }

  /**
   * Get station yearly data from database
   */
  async getDbStationYears(id: string, params?: { limit?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<any>(
      `${DB_BASE_URL}/stations/${id}/years${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    );
    return response.data;
  }

  /**
   * Get all station monthly data from database
   */
  async getDbStationMonthsAll(params?: { page?: number; limit?: number; stationId?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.stationId) queryParams.append('stationId', params.stationId);

    const response = await apiClient.get<any>(
      `${DB_BASE_URL}/station-months${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    );
    return response.data;
  }

  /**
   * Get all station yearly data from database
   */
  async getDbStationYearsAll(params?: { page?: number; limit?: number; stationId?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.stationId) queryParams.append('stationId', params.stationId);

    const response = await apiClient.get<any>(
      `${DB_BASE_URL}/station-years${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    );
    return response.data;
  }

  /**
   * Get all collectors from database
   */
  async getDbCollectors(params?: { page?: number; limit?: number; stationId?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.stationId) queryParams.append('stationId', params.stationId);

    const response = await apiClient.get<any>(
      `${DB_BASE_URL}/collectors${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    );
    return response.data;
  }

  /**
   * Get single collector from database
   */
  async getDbCollector(id: string): Promise<any> {
    const response = await apiClient.get<any>(`${DB_BASE_URL}/collectors/${id}`);
    return response.data;
  }

  /**
   * Get all alarms from database
   */
  async getDbAlarms(params?: { page?: number; limit?: number; status?: string; deviceId?: string; stationId?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.deviceId) queryParams.append('deviceId', params.deviceId);
    if (params?.stationId) queryParams.append('stationId', params.stationId);

    const response = await apiClient.get<any>(
      `${DB_BASE_URL}/alarms${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    );
    return response.data;
  }

  /**
   * Get active alarms only from database
   */
  async getDbActiveAlarms(): Promise<any> {
    const response = await apiClient.get<any>(`${DB_BASE_URL}/alarms/active`);
    return response.data;
  }

  /**
   * Get sync status from database
   */
  async getDbSyncStatus(): Promise<any> {
    const response = await apiClient.get<any>(`${DB_BASE_URL}/sync/status`);
    return response.data;
  }

  /**
   * Get sync history from database
   */
  async getDbSyncHistory(params?: { page?: number; limit?: number; syncType?: string; status?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.syncType) queryParams.append('syncType', params.syncType);
    if (params?.status) queryParams.append('status', params.status);

    const response = await apiClient.get<any>(
      `${DB_BASE_URL}/sync/history${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    );
    return response.data;
  }

  /**
   * Trigger manual sync
   */
  async triggerDbSync(params: { types: string[]; date?: string; month?: string; year?: string }): Promise<any> {
    const response = await apiClient.post<any>(`${DB_BASE_URL}/sync/trigger`, params);
    return response.data;
  }

  /**
   * Validate inverter data
   */
  async validateDbInverter(id: string): Promise<any> {
    const response = await apiClient.get<any>(`${DB_BASE_URL}/validate/inverter/${id}`);
    return response.data;
  }

  /**
   * Validate all data
   */
  async validateDbAll(): Promise<any> {
    const response = await apiClient.get<any>(`${DB_BASE_URL}/validate/all`);
    return response.data;
  }
}

export const solisCloudService = new SolisCloudService();
export default solisCloudService;
