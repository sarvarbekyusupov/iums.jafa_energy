// SolisCloud API Types
// Based on: /docs/soliscloud/SOLISCLOUD_FRONTEND_API_GUIDE.md

export interface SolisCloudResponse<T> {
  success: boolean;
  code: string;
  msg: string;
  data: T;
}

export interface PaginationParams {
  pageNo: number;
  pageSize: number;
}

export interface PageResponse<T> {
  total: number;
  size: number;
  current: number;
  pages: number;
  records: T[];
}

// ===== Section 1: Inverter Types =====

export interface InverterStatusVo {
  all: number;
  normal: number;
  offline: number;
  fault: number;
}

export interface Inverter {
  id: string;
  sn: string;
  stationName: string;
  state: number; // 1=online, 2=offline, 3=alarm
  pac: number;
  etoday: number;
  etotal: number;
  batteryCapacitySoc: number;
}

export interface InverterListResponse {
  inverterStatusVo: InverterStatusVo;
  page: PageResponse<Inverter>;
}

export interface InverterDetail {
  id: string;
  sn: string;
  stationName: string;
  state: number;
  pac: number;
  eToday: number;
  eTotal: number;
  inverterTemperature: number;
  inverterTemperatureUnit: string;
  batteryCapacitySoc: number;
  batteryPower: number;
  gridPurchasedTodayEnergy: number;
  gridSellTodayEnergy: number;
  [key: string]: any; // 100+ additional fields
}

export interface InverterDayData {
  dataTimestamp: string;
  timeStr: string;
  pac: number;
  eToday: number;
}

export interface InverterMonthData {
  date: string;
  energy: number;
  income: number;
}

export interface InverterYearData {
  dateStr: string;
  energy: number;
  energyStr: string;
  batteryChargeEnergy: number;
  batteryDischargeEnergy: number;
  gridPurchasedEnergy: number;
}

export interface DeviceAlarm {
  id: string;
  stationName: string;
  alarmDeviceSn: string;
  alarmType: number;
  alarmLevel: string; // 1=warning, 2=fault, 3=critical
  alarmCode: string;
  alarmMsg: string;
  alarmBeginTime: number;
  alarmEndTime: number;
  state: string; // 0=ongoing, 1=resolved
  advice: string;
}

// ===== Section 2: Collector Types =====

export interface Collector {
  id: string;
  sn: string;
  stationName: string;
  state: number; // 1=online, 2=offline
  model: string;
}

export interface CollectorDetail extends Collector {
  [key: string]: any;
}

export interface CollectorSignalData {
  timeStr: string;
  rssi: number;
  rssiLevel: number;
  pec: number;
}

// ===== Section 3: EPM Types =====

export interface EPM {
  id: string;
  sn: string;
  stationName: string;
  [key: string]: any;
}

export interface EPMDayData {
  timeStr: string;
  [key: string]: any;
}

export interface EPMMonthData {
  date: string;
  [key: string]: any;
}

// ===== Section 4: Weather Station Types =====

export interface WeatherStation {
  id: string;
  sn: string;
  stationName: string;
  [key: string]: any;
}

export interface WeatherStationDetail {
  sn: string;
  temperature?: number;
  humidity?: number;
  radiation?: number;
  windSpeed?: number;
  [key: string]: any;
}

// ===== Section 5: Station/Plant Types =====

export interface Station {
  id: string;
  stationName: string;
  stationCode: string;
  type: number;
  state: number; // 1=normal, 2=alarm
  capacity: number;
  eToday: number;
  eTotal: number;
  pac: number;
}

export interface StationDetail extends Station {
  [key: string]: any;
}

export interface StationDayEnergy {
  id: string;
  energy: number;
  energyStr: string;
  money: number;
  batteryChargeEnergy: number;
  batteryDischargeEnergy: number;
  gridPurchasedEnergy: number;
  gridSellEnergy: number;
}

export interface StationDayData {
  dataTimestamp: string;
  timeStr: string;
  pac: number;
  eToday: number;
  [key: string]: any;
}

export interface StationMonthData {
  date: string;
  energy: number;
  energyStr: string;
  [key: string]: any;
}

export interface StationYearData {
  dateStr: string;
  energy: number;
  energyStr: string;
  [key: string]: any;
}

// ===== Request Parameter Types =====

export interface InverterListParams extends PaginationParams {
  stationId?: string;
  nmiCode?: string;
}

export interface InverterDetailParams {
  id?: string;
  sn?: string;
}

export interface InverterDayParams {
  id?: string;
  sn?: string;
  time: string; // yyyy-MM-dd
}

export interface InverterMonthParams {
  id?: string;
  sn?: string;
  month: string; // yyyy-MM
}

export interface InverterYearParams {
  id?: string;
  sn?: string;
  year: string; // yyyy
}

export interface AlarmListParams extends PaginationParams {
  stationId?: string;
  inverterId?: string;
}

export interface CollectorListParams extends PaginationParams {
  stationId?: string;
}

export interface CollectorDayParams {
  sn: string;
  time: string;
  timeZone: number;
}

export interface EPMListParams extends PaginationParams {
  stationId?: string;
}

export interface WeatherListParams extends PaginationParams {
  stationId?: string;
}

export interface StationDayListParams extends PaginationParams {
  time: string;
  stationIds?: string;
}

export interface StationMonthListParams extends PaginationParams {
  month: string;
  stationIds?: string;
}

export interface StationYearListParams extends PaginationParams {
  stationIds?: string;
}

export interface StationDayParams {
  id: string;
  time: string;
  timeZone: number;
}

export interface StationMonthParams {
  id: string;
  month: string;
}

export interface StationYearParams {
  id: string;
  year: string;
}

export interface StationAllYearsParams {
  id: string;
}
