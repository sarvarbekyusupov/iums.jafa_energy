import { apiClient } from './api-client';

interface RealtimeDataWebhook {
  plantId: string;
  eventType: 'realtime_data';
  timestamp: string;
  data: {
    activePower: number;
    dayYield: number;
    totalYield: number;
  };
}

interface AlarmWebhook {
  plantId: string;
  deviceId: string;
  alarmId: string;
  eventType: 'alarm';
  timestamp: string;
  data: {
    alarmType: string;
    severity: string;
    message: string;
  };
}

interface DeviceStatusWebhook {
  plantId: string;
  deviceId: string;
  eventType: 'device_status';
  timestamp: string;
  data: {
    status: string;
    lastSeen: string;
  };
}

interface NewDeviceWebhook {
  plantId: string;
  deviceId: string;
  eventType: 'device_added';
  timestamp: string;
  data: {
    deviceName: string;
    deviceType: string;
    capacity: number;
    stationId: string;
  };
}

interface WebhookResponse {
  status: string;
  message: string;
  processed?: number;
  alarmId?: string;
  action?: string;
  deviceId?: string;
  deviceStatus?: string;
}

// Note: Webhook services are typically server-to-server
// These would be used for testing or manual webhook processing
class WebhooksService {
  private readonly baseUrl = '/api/hopecloud/webhooks';

  // Webhook Endpoints (typically called by external systems)
  // These are here for testing/manual processing purposes only
  
  async handleRealtimeData(signature: string, data: RealtimeDataWebhook): Promise<WebhookResponse> {
    const response = await apiClient.post(`${this.baseUrl}/realtime`, data, {
      headers: {
        'x-hopecloud-signature': signature
      }
    });
    return response.data;
  }

  async handleAlarms(signature: string, data: AlarmWebhook): Promise<WebhookResponse> {
    const response = await apiClient.post(`${this.baseUrl}/alarms`, data, {
      headers: {
        'x-hopecloud-signature': signature
      }
    });
    return response.data;
  }

  async handleDeviceStatus(signature: string, data: DeviceStatusWebhook): Promise<WebhookResponse> {
    const response = await apiClient.post(`${this.baseUrl}/device-status`, data, {
      headers: {
        'x-hopecloud-signature': signature
      }
    });
    return response.data;
  }

  async handleNewDevice(signature: string, data: NewDeviceWebhook): Promise<WebhookResponse> {
    const response = await apiClient.post(`${this.baseUrl}/device-discovery`, data, {
      headers: {
        'x-hopecloud-signature': signature
      }
    });
    return response.data;
  }
}

export const webhooksService = new WebhooksService();