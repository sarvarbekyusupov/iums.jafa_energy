import { apiClient } from './api-client';

/** Stored device alarms (the /api/device-alarms routes); every call resolves to the response body. */
export const deviceAlarmsService = {
  createDeviceAlarm: (data: any): Promise<any> =>
    apiClient.post('/api/device-alarms', data).then((r) => r.data),

  getAllDeviceAlarms: (): Promise<any[]> =>
    apiClient.get('/api/device-alarms').then((r) => r.data),

  getDeviceAlarmById: (id: number): Promise<any> =>
    apiClient.get(`/api/device-alarms/${id}`).then((r) => r.data),

  updateDeviceAlarm: (id: number, data: any): Promise<any> =>
    apiClient.put(`/api/device-alarms/${id}`, data).then((r) => r.data),

  deleteDeviceAlarm: (id: number): Promise<void> =>
    apiClient.delete(`/api/device-alarms/${id}`).then((r) => r.data),

  acknowledgeAlarm: (id: number): Promise<void> =>
    apiClient.post(`/api/device-alarms/${id}/acknowledge`).then((r) => r.data),

  resolveAlarm: (id: number): Promise<void> =>
    apiClient.post(`/api/device-alarms/${id}/resolve`).then((r) => r.data),

  getAlarmsByDevice: (deviceId: number): Promise<any[]> =>
    apiClient.get(`/api/device-alarms/device/${deviceId}`).then((r) => r.data),

  getActiveAlarms: (): Promise<any[]> =>
    apiClient.get('/api/device-alarms/active').then((r) => r.data),
};