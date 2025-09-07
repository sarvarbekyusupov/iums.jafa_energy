import { apiClient } from './api-client';

export const deviceAlarmsService = {
  createDeviceAlarm: (data: any): Promise<any> =>
    apiClient.post('/device-alarms', data),

  getAllDeviceAlarms: (): Promise<any[]> =>
    apiClient.get('/device-alarms'),

  getDeviceAlarmById: (id: number): Promise<any> =>
    apiClient.get(`/device-alarms/${id}`),

  updateDeviceAlarm: (id: number, data: any): Promise<any> =>
    apiClient.put(`/device-alarms/${id}`, data),

  deleteDeviceAlarm: (id: number): Promise<void> =>
    apiClient.delete(`/device-alarms/${id}`),

  acknowledgeAlarm: (id: number): Promise<void> =>
    apiClient.post(`/device-alarms/${id}/acknowledge`),

  resolveAlarm: (id: number): Promise<void> =>
    apiClient.post(`/device-alarms/${id}/resolve`),

  getAlarmsByDevice: (deviceId: number): Promise<any[]> =>
    apiClient.get(`/device-alarms/device/${deviceId}`),

  getActiveAlarms: (): Promise<any[]> =>
    apiClient.get('/device-alarms/active'),
};