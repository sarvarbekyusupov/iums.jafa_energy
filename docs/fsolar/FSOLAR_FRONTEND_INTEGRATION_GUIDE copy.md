# Fsolar API Frontend Integration Guide

**Version:** 1.0
**Last Updated:** November 13, 2025
**API Base URL:** `http://localhost:3000/api`

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [API Endpoints Overview](#api-endpoints-overview)
3. [Authentication](#authentication)
4. [Device Management](#device-management)
5. [Energy Monitoring](#energy-monitoring)
6. [Historical Data](#historical-data)
7. [Events & Alarms](#events--alarms)
8. [Sync Operations](#sync-operations)
9. [React Examples](#react-examples)
10. [Vue.js Examples](#vuejs-examples)
11. [Angular Examples](#angular-examples)
12. [Error Handling](#error-handling)
13. [Best Practices](#best-practices)

---

## 🚀 Quick Start

### Installation

```bash
# Using axios (recommended)
npm install axios

# Or using fetch (built-in)
# No installation needed
```

### Basic Setup

```javascript
// api/fsolar.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const fsolarAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/fsolar/db`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth (if needed)
fsolarAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

---

## 📡 API Endpoints Overview

### Base URL Structure

```
DB Access APIs: /api/api/fsolar/db/*
Direct APIs: /api/api/fsolar/*
```

### Complete Endpoint List (14 DB APIs)

| Category | Endpoint | Method | Purpose |
|----------|----------|--------|---------|
| **Sync** | `/sync/trigger` | POST | Trigger manual sync |
| **Devices** | `/devices` | GET | List all devices |
| **Devices** | `/devices/:deviceSn` | GET | Get device details |
| **Energy** | `/devices/:deviceSn/energy` | GET | Get device energy history |
| **Energy** | `/devices/:deviceSn/energy/latest` | GET | Get latest energy reading |
| **Energy** | `/energy` | GET | Get all energy data |
| **History** | `/devices/:deviceSn/history` | GET | Get device history |
| **History** | `/history` | GET | Get all historical data |
| **Events** | `/devices/:deviceSn/events` | GET | Get device events |
| **Events** | `/events` | GET | Get all events |
| **Events** | `/events/active` | GET | Get active events |
| **Monitor** | `/sync/status` | GET | Get sync status |
| **Monitor** | `/sync/history` | GET | Get sync logs |
| **Stats** | `/stats` | GET | Get database stats |

---

## 🔐 Authentication

### Setting Up Auth Token

```javascript
// After user login, store token
localStorage.setItem('authToken', token);

// Use in API calls
const response = await fsolarAPI.get('/devices', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

---

## 🔧 Device Management

### 1. Get All Devices

**Endpoint:** `GET /api/api/fsolar/db/devices`

**Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Example:**

```javascript
// Function
async function fetchDevices(page = 1, limit = 20) {
  try {
    const response = await fsolarAPI.get('/devices', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching devices:', error);
    throw error;
  }
}

// Usage
const devicesData = await fetchDevices(1, 10);
console.log(`Total devices: ${devicesData.pagination.total}`);
console.log('Devices:', devicesData.data);
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "deviceSn": "100202000124410097",
      "stationCode": "",
      "name": null,
      "deviceType": "inverter",
      "status": "online",
      "ratedPower": 10.0,
      "metadata": { ... },
      "lastSyncedAt": "2025-11-13T05:04:44.697Z",
      "createdAt": "2025-11-13T05:04:44.698Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

### 2. Get Single Device

**Endpoint:** `GET /api/api/fsolar/db/devices/:deviceSn`

**Example:**

```javascript
async function fetchDeviceDetails(deviceSn) {
  try {
    const response = await fsolarAPI.get(`/devices/${deviceSn}`);
    return response.data.data;
  } catch (error) {
    console.error('Device not found:', error);
    throw error;
  }
}

// Usage
const device = await fetchDeviceDetails('100202000124410097');
console.log(`Device: ${device.deviceSn} - Status: ${device.status}`);
```

---

## ⚡ Energy Monitoring

### 1. Get Latest Energy Reading

**Endpoint:** `GET /api/api/fsolar/db/devices/:deviceSn/energy/latest`

**Example:**

```javascript
async function fetchLatestEnergy(deviceSn) {
  try {
    const response = await fsolarAPI.get(`/devices/${deviceSn}/energy/latest`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching energy:', error);
    throw error;
  }
}

// Usage
const energy = await fetchLatestEnergy('100202000124410097');
console.log('Today Energy:', energy.todayEnergy);
console.log('Total Energy:', energy.totalEnergy);
console.log('Active Power:', energy.activePower);
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "deviceSn": "100202000124410097",
    "timestamp": "2025-11-13T05:05:25.366Z",
    "activePower": 8.5,
    "todayEnergy": 45.2,
    "totalEnergy": 12345.6,
    "gridVoltage": 230.5,
    "batterySoc": 85,
    "pv1Power": 4.8,
    "pv2Power": 4.6,
    "loadPower": 3.5
  }
}
```

### 2. Get Energy History

**Endpoint:** `GET /api/api/fsolar/db/devices/:deviceSn/energy`

**Parameters:**
- `limit` (optional): Number of records (default: 20)

**Example:**

```javascript
async function fetchEnergyHistory(deviceSn, limit = 24) {
  try {
    const response = await fsolarAPI.get(`/devices/${deviceSn}/energy`, {
      params: { limit }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
}

// Usage - Get last 24 hours
const history = await fetchEnergyHistory('100202000124410097', 24);
```

### 3. Get All Energy Data (Paginated)

**Endpoint:** `GET /api/api/fsolar/db/energy`

**Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `deviceSn` (optional): Filter by device

**Example:**

```javascript
async function fetchAllEnergy(page = 1, limit = 20, deviceSn = null) {
  try {
    const params = { page, limit };
    if (deviceSn) params.deviceSn = deviceSn;

    const response = await fsolarAPI.get('/energy', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching all energy:', error);
    throw error;
  }
}
```

---

## 📊 Historical Data

### 1. Get Device Historical Data

**Endpoint:** `GET /api/api/fsolar/db/devices/:deviceSn/history`

**Parameters:**
- `granularity` (optional): 'daily', 'monthly', 'yearly' (default: 'daily')
- `limit` (optional): Number of records (default: 30)

**Example:**

```javascript
async function fetchDeviceHistory(deviceSn, granularity = 'daily', limit = 30) {
  try {
    const response = await fsolarAPI.get(`/devices/${deviceSn}/history`, {
      params: { granularity, limit }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
}

// Usage - Get last 30 days
const dailyHistory = await fetchDeviceHistory('100202000124410097', 'daily', 30);

// Get monthly history
const monthlyHistory = await fetchDeviceHistory('100202000124410097', 'monthly', 12);
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "deviceSn": "100202000124410097",
      "granularity": "daily",
      "periodStart": "2025-11-13T00:00:00.000Z",
      "energyProduction": 45.2,
      "energyConsumption": 32.5,
      "gridFeedIn": 15.5,
      "gridPurchase": 5.2,
      "selfConsumptionRate": 65.5,
      "peakPower": 9.5
    }
  ],
  "count": 30
}
```

### 2. Get All Historical Data (Paginated)

**Endpoint:** `GET /api/api/fsolar/db/history`

**Parameters:**
- `page`, `limit`: Pagination
- `deviceSn`: Filter by device
- `granularity`: Filter by time period

**Example:**

```javascript
async function fetchAllHistory(filters = {}) {
  const { page = 1, limit = 20, deviceSn, granularity } = filters;

  try {
    const response = await fsolarAPI.get('/history', {
      params: { page, limit, deviceSn, granularity }
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

---

## 🚨 Events & Alarms

### 1. Get Device Events

**Endpoint:** `GET /api/api/fsolar/db/devices/:deviceSn/events`

**Parameters:**
- `limit` (optional): Number of events (default: 50)

**Example:**

```javascript
async function fetchDeviceEvents(deviceSn, limit = 50) {
  try {
    const response = await fsolarAPI.get(`/devices/${deviceSn}/events`, {
      params: { limit }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

// Usage
const events = await fetchDeviceEvents('100202000124410097');
console.log(`Total events: ${events.length}`);
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "deviceSn": "100202000124410097",
      "eventType": "alarm",
      "severity": "high",
      "status": "active",
      "name": "Grid Voltage High",
      "description": "Grid voltage exceeded 265V",
      "eventTime": "2025-11-13T10:30:00.000Z",
      "requiresAction": true
    }
  ],
  "count": 5
}
```

### 2. Get All Events (Paginated)

**Endpoint:** `GET /api/api/fsolar/db/events`

**Parameters:**
- `page`, `limit`: Pagination
- `deviceSn`: Filter by device
- `status`: Filter by status ('active', 'cleared', 'acknowledged')

**Example:**

```javascript
async function fetchAllEvents(filters = {}) {
  const { page = 1, limit = 20, deviceSn, status } = filters;

  try {
    const response = await fsolarAPI.get('/events', {
      params: { page, limit, deviceSn, status }
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Get all active alarms
const activeAlarms = await fetchAllEvents({ status: 'active' });
```

### 3. Get Active Events Only

**Endpoint:** `GET /api/api/fsolar/db/events/active`

**Parameters:**
- `limit` (optional): Number of events (default: 50)

**Example:**

```javascript
async function fetchActiveEvents(limit = 50) {
  try {
    const response = await fsolarAPI.get('/events/active', {
      params: { limit }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Usage
const activeEvents = await fetchActiveEvents();
console.log(`Active alarms: ${activeEvents.length}`);
```

---

## 🔄 Sync Operations

### 1. Trigger Manual Sync

**Endpoint:** `POST /api/api/fsolar/db/sync/trigger`

**Request Body:**
```json
{
  "types": ["devices", "energy", "history_daily", "events", "full"],
  "date": "2025-11-13"
}
```

**Example:**

```javascript
async function triggerSync(types = ['full'], date = null) {
  try {
    const response = await fsolarAPI.post('/sync/trigger', {
      types,
      date
    });
    return response.data;
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  }
}

// Sync all data
await triggerSync(['full']);

// Sync specific types
await triggerSync(['devices', 'energy']);

// Sync historical data for specific date
await triggerSync(['history_daily'], '2025-11-13');
```

**Response:**
```json
{
  "success": true,
  "message": "Sync completed",
  "results": {
    "devices": {
      "syncType": "devices",
      "status": "success",
      "recordsFetched": 2,
      "recordsInserted": 0,
      "recordsUpdated": 2,
      "durationMs": 16285
    }
  }
}
```

### 2. Get Sync Status

**Endpoint:** `GET /api/api/fsolar/db/sync/status`

**Example:**

```javascript
async function getSyncStatus() {
  try {
    const response = await fsolarAPI.get('/sync/status');
    return response.data.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Usage
const status = await getSyncStatus();
console.log('Last device sync:', status.devices?.completedAt);
console.log('Last energy sync:', status.device_energy?.completedAt);
```

### 3. Get Sync History

**Endpoint:** `GET /api/api/fsolar/db/sync/history`

**Parameters:**
- `page`, `limit`: Pagination
- `type`: Filter by sync type

**Example:**

```javascript
async function getSyncHistory(page = 1, limit = 20, type = null) {
  try {
    const params = { page, limit };
    if (type) params.type = type;

    const response = await fsolarAPI.get('/sync/history', { params });
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Get all sync logs
const history = await getSyncHistory();

// Get device sync logs only
const deviceSyncs = await getSyncHistory(1, 10, 'devices');
```

### 4. Get Database Statistics

**Endpoint:** `GET /api/api/fsolar/db/stats`

**Example:**

```javascript
async function getDatabaseStats() {
  try {
    const response = await fsolarAPI.get('/stats');
    return response.data.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Usage
const stats = await getDatabaseStats();
console.log(`Total devices: ${stats.devices}`);
console.log(`Energy records: ${stats.energyRecords}`);
console.log(`Events: ${stats.events}`);
```

**Response:**
```json
{
  "success": true,
  "data": {
    "devices": 2,
    "energyRecords": 48,
    "historyRecords": 30,
    "events": 5,
    "total": 85
  }
}
```

---

## ⚛️ React Examples

### Device List Component

```jsx
import React, { useState, useEffect } from 'react';
import { fsolarAPI } from './api/fsolar';

function DeviceList() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchDevices();
  }, [page]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await fsolarAPI.get('/devices', {
        params: { page, limit: 10 }
      });
      setDevices(response.data.data);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError('Failed to load devices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading devices...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="device-list">
      <h2>Devices ({pagination?.total})</h2>

      <div className="devices-grid">
        {devices.map(device => (
          <div key={device.id} className="device-card">
            <h3>{device.deviceSn}</h3>
            <p>Type: {device.deviceType}</p>
            <p>Status: <span className={`status-${device.status}`}>
              {device.status}
            </span></p>
            <p>Rated Power: {device.ratedPower} kW</p>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          onClick={() => setPage(p => p - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page} of {pagination?.totalPages}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page === pagination?.totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default DeviceList;
```

### Real-Time Energy Monitor

```jsx
import React, { useState, useEffect } from 'react';
import { fsolarAPI } from './api/fsolar';

function EnergyMonitor({ deviceSn }) {
  const [energy, setEnergy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnergy();
    const interval = setInterval(fetchEnergy, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [deviceSn]);

  const fetchEnergy = async () => {
    try {
      const response = await fsolarAPI.get(`/devices/${deviceSn}/energy/latest`);
      setEnergy(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching energy:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!energy) return <div>No data available</div>;

  return (
    <div className="energy-monitor">
      <h2>Real-Time Energy</h2>

      <div className="energy-metrics">
        <div className="metric">
          <label>Active Power</label>
          <value>{energy.activePower || 0} kW</value>
        </div>

        <div className="metric">
          <label>Today Energy</label>
          <value>{energy.todayEnergy || 0} kWh</value>
        </div>

        <div className="metric">
          <label>Total Energy</label>
          <value>{energy.totalEnergy || 0} kWh</value>
        </div>

        <div className="metric">
          <label>Battery SOC</label>
          <value>{energy.batterySoc || 0}%</value>
        </div>

        <div className="metric">
          <label>Grid Voltage</label>
          <value>{energy.gridVoltage || 0} V</value>
        </div>

        <div className="metric">
          <label>Load Power</label>
          <value>{energy.loadPower || 0} kW</value>
        </div>
      </div>

      <div className="last-update">
        Last updated: {new Date(energy.timestamp).toLocaleString()}
      </div>
    </div>
  );
}

export default EnergyMonitor;
```

### Active Alarms Widget

```jsx
import React, { useState, useEffect } from 'react';
import { fsolarAPI } from './api/fsolar';

function ActiveAlarms() {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlarms();
    const interval = setInterval(fetchAlarms, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const fetchAlarms = async () => {
    try {
      const response = await fsolarAPI.get('/events/active');
      setAlarms(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching alarms:', error);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'red',
      high: 'orange',
      medium: 'yellow',
      low: 'blue',
      info: 'gray'
    };
    return colors[severity] || 'gray';
  };

  if (loading) return <div>Loading alarms...</div>;

  return (
    <div className="active-alarms">
      <h2>Active Alarms ({alarms.length})</h2>

      {alarms.length === 0 ? (
        <div className="no-alarms">
          ✓ All devices operating normally
        </div>
      ) : (
        <div className="alarms-list">
          {alarms.map(alarm => (
            <div
              key={alarm.id}
              className="alarm-item"
              style={{ borderLeftColor: getSeverityColor(alarm.severity) }}
            >
              <div className="alarm-header">
                <span className={`severity ${alarm.severity}`}>
                  {alarm.severity.toUpperCase()}
                </span>
                <span className="device-sn">{alarm.deviceSn}</span>
              </div>

              <div className="alarm-body">
                <h4>{alarm.name}</h4>
                <p>{alarm.description}</p>
              </div>

              <div className="alarm-footer">
                <span>{new Date(alarm.eventTime).toLocaleString()}</span>
                {alarm.requiresAction && (
                  <span className="action-required">⚠ Action Required</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActiveAlarms;
```

### Energy Chart Component

```jsx
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { fsolarAPI } from './api/fsolar';

function EnergyChart({ deviceSn, days = 7 }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistoricalData();
  }, [deviceSn, days]);

  const fetchHistoricalData = async () => {
    try {
      const response = await fsolarAPI.get(`/devices/${deviceSn}/history`, {
        params: { granularity: 'daily', limit: days }
      });

      const data = response.data.data.reverse(); // Oldest first

      setChartData({
        labels: data.map(d =>
          new Date(d.periodStart).toLocaleDateString()
        ),
        datasets: [
          {
            label: 'Energy Production (kWh)',
            data: data.map(d => d.energyProduction || 0),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: 'Energy Consumption (kWh)',
            data: data.map(d => d.energyConsumption || 0),
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          }
        ]
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  if (loading) return <div>Loading chart...</div>;
  if (!chartData) return <div>No data available</div>;

  return (
    <div className="energy-chart">
      <h2>Energy Production vs Consumption</h2>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: `Last ${days} Days`
            }
          }
        }}
      />
    </div>
  );
}

export default EnergyChart;
```

---

## 🎨 Vue.js Examples

### Device List Component

```vue
<template>
  <div class="device-list">
    <h2>Devices ({{ pagination?.total }})</h2>

    <div v-if="loading" class="loading">Loading devices...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="devices-grid">
      <div
        v-for="device in devices"
        :key="device.id"
        class="device-card"
      >
        <h3>{{ device.deviceSn }}</h3>
        <p>Type: {{ device.deviceType }}</p>
        <p>Status: <span :class="`status-${device.status}`">
          {{ device.status }}
        </span></p>
        <p>Rated Power: {{ device.ratedPower }} kW</p>
      </div>
    </div>

    <div class="pagination">
      <button @click="prevPage" :disabled="page === 1">
        Previous
      </button>
      <span>Page {{ page }} of {{ pagination?.totalPages }}</span>
      <button @click="nextPage" :disabled="page === pagination?.totalPages">
        Next
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { fsolarAPI } from './api/fsolar';

export default {
  name: 'DeviceList',
  setup() {
    const devices = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const page = ref(1);
    const pagination = ref(null);

    const fetchDevices = async () => {
      loading.value = true;
      try {
        const response = await fsolarAPI.get('/devices', {
          params: { page: page.value, limit: 10 }
        });
        devices.value = response.data.data;
        pagination.value = response.data.pagination;
        error.value = null;
      } catch (err) {
        error.value = 'Failed to load devices';
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const prevPage = () => {
      if (page.value > 1) page.value--;
    };

    const nextPage = () => {
      if (page.value < pagination.value.totalPages) page.value++;
    };

    watch(page, fetchDevices);
    onMounted(fetchDevices);

    return {
      devices,
      loading,
      error,
      page,
      pagination,
      prevPage,
      nextPage
    };
  }
};
</script>
```

### Energy Monitor Component

```vue
<template>
  <div class="energy-monitor">
    <h2>Real-Time Energy</h2>

    <div v-if="loading">Loading...</div>
    <div v-else-if="!energy">No data available</div>

    <div v-else class="energy-metrics">
      <div class="metric">
        <label>Active Power</label>
        <value>{{ energy.activePower || 0 }} kW</value>
      </div>

      <div class="metric">
        <label>Today Energy</label>
        <value>{{ energy.todayEnergy || 0 }} kWh</value>
      </div>

      <div class="metric">
        <label>Total Energy</label>
        <value>{{ energy.totalEnergy || 0 }} kWh</value>
      </div>

      <div class="metric">
        <label>Battery SOC</label>
        <value>{{ energy.batterySoc || 0 }}%</value>
      </div>

      <div class="last-update">
        Last updated: {{ formatDate(energy.timestamp) }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { fsolarAPI } from './api/fsolar';

export default {
  name: 'EnergyMonitor',
  props: {
    deviceSn: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const energy = ref(null);
    const loading = ref(true);
    let interval;

    const fetchEnergy = async () => {
      try {
        const response = await fsolarAPI.get(
          `/devices/${props.deviceSn}/energy/latest`
        );
        energy.value = response.data.data;
        loading.value = false;
      } catch (error) {
        console.error('Error fetching energy:', error);
      }
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString();
    };

    onMounted(() => {
      fetchEnergy();
      interval = setInterval(fetchEnergy, 30000); // Update every 30s
    });

    onUnmounted(() => {
      if (interval) clearInterval(interval);
    });

    return {
      energy,
      loading,
      formatDate
    };
  }
};
</script>
```

---

## 🅰️ Angular Examples

### Device List Component

```typescript
// device-list.component.ts
import { Component, OnInit } from '@angular/core';
import { FsolarService } from './services/fsolar.service';

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.css']
})
export class DeviceListComponent implements OnInit {
  devices: any[] = [];
  loading = true;
  error: string | null = null;
  page = 1;
  pagination: any = null;

  constructor(private fsolarService: FsolarService) {}

  ngOnInit(): void {
    this.fetchDevices();
  }

  fetchDevices(): void {
    this.loading = true;
    this.fsolarService.getDevices(this.page, 10).subscribe({
      next: (response) => {
        this.devices = response.data;
        this.pagination = response.pagination;
        this.error = null;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load devices';
        console.error(err);
        this.loading = false;
      }
    });
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.fetchDevices();
    }
  }

  nextPage(): void {
    if (this.page < this.pagination.totalPages) {
      this.page++;
      this.fetchDevices();
    }
  }
}
```

```html
<!-- device-list.component.html -->
<div class="device-list">
  <h2>Devices ({{ pagination?.total }})</h2>

  <div *ngIf="loading" class="loading">Loading devices...</div>
  <div *ngIf="error" class="error">{{ error }}</div>

  <div *ngIf="!loading && !error" class="devices-grid">
    <div *ngFor="let device of devices" class="device-card">
      <h3>{{ device.deviceSn }}</h3>
      <p>Type: {{ device.deviceType }}</p>
      <p>Status: <span [class]="'status-' + device.status">
        {{ device.status }}
      </span></p>
      <p>Rated Power: {{ device.ratedPower }} kW</p>
    </div>
  </div>

  <div class="pagination">
    <button (click)="prevPage()" [disabled]="page === 1">
      Previous
    </button>
    <span>Page {{ page }} of {{ pagination?.totalPages }}</span>
    <button (click)="nextPage()" [disabled]="page === pagination?.totalPages">
      Next
    </button>
  </div>
</div>
```

### Fsolar Service

```typescript
// services/fsolar.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FsolarService {
  private baseUrl = 'http://localhost:3000/api/api/fsolar/db';

  constructor(private http: HttpClient) {}

  // Devices
  getDevices(page = 1, limit = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get(`${this.baseUrl}/devices`, { params });
  }

  getDevice(deviceSn: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/devices/${deviceSn}`);
  }

  // Energy
  getLatestEnergy(deviceSn: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/devices/${deviceSn}/energy/latest`);
  }

  getEnergyHistory(deviceSn: string, limit = 24): Observable<any> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get(`${this.baseUrl}/devices/${deviceSn}/energy`, { params });
  }

  // History
  getDeviceHistory(deviceSn: string, granularity = 'daily', limit = 30): Observable<any> {
    const params = new HttpParams()
      .set('granularity', granularity)
      .set('limit', limit.toString());
    return this.http.get(`${this.baseUrl}/devices/${deviceSn}/history`, { params });
  }

  // Events
  getActiveEvents(limit = 50): Observable<any> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get(`${this.baseUrl}/events/active`, { params });
  }

  getDeviceEvents(deviceSn: string, limit = 50): Observable<any> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get(`${this.baseUrl}/devices/${deviceSn}/events`, { params });
  }

  // Sync
  triggerSync(types: string[], date?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/sync/trigger`, { types, date });
  }

  getSyncStatus(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sync/status`);
  }

  // Stats
  getStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/stats`);
  }
}
```

---

## ⚠️ Error Handling

### Global Error Handler

```javascript
// api/errorHandler.js
export class FsolarAPIError extends Error {
  constructor(message, statusCode, response) {
    super(message);
    this.name = 'FsolarAPIError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

export function handleAPIError(error) {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;

    switch (status) {
      case 400:
        throw new FsolarAPIError('Bad Request', 400, data);
      case 401:
        // Unauthorized - redirect to login
        window.location.href = '/login';
        throw new FsolarAPIError('Unauthorized', 401, data);
      case 404:
        throw new FsolarAPIError('Resource not found', 404, data);
      case 500:
        throw new FsolarAPIError('Server error', 500, data);
      default:
        throw new FsolarAPIError(`Error: ${status}`, status, data);
    }
  } else if (error.request) {
    // Request made but no response
    throw new FsolarAPIError('Network error - no response', 0, null);
  } else {
    // Error in request setup
    throw new FsolarAPIError(error.message, 0, null);
  }
}
```

### Using Error Handler

```javascript
import { handleAPIError } from './api/errorHandler';

async function fetchDevicesSafely() {
  try {
    const response = await fsolarAPI.get('/devices');
    return response.data;
  } catch (error) {
    const apiError = handleAPIError(error);

    // Show user-friendly message
    showNotification({
      type: 'error',
      message: apiError.message
    });

    // Log for debugging
    console.error('API Error:', apiError);

    return null;
  }
}
```

---

## 💡 Best Practices

### 1. Caching Strategy

```javascript
// Simple cache implementation
class APICache {
  constructor(ttl = 60000) { // 1 minute default
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

const apiCache = new APICache(30000); // 30 seconds

async function fetchDevicesWithCache() {
  const cacheKey = 'devices';
  const cached = apiCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const response = await fsolarAPI.get('/devices');
  apiCache.set(cacheKey, response.data);
  return response.data;
}
```

### 2. Request Debouncing

```javascript
// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Usage in search
const debouncedSearch = debounce(async (query) => {
  const response = await fsolarAPI.get('/devices', {
    params: { search: query }
  });
  updateResults(response.data);
}, 300);
```

### 3. Real-Time Updates

```javascript
// Polling with automatic cleanup
class DataPoller {
  constructor(fetchFunction, interval = 30000) {
    this.fetchFunction = fetchFunction;
    this.interval = interval;
    this.intervalId = null;
  }

  start() {
    this.fetchFunction(); // Fetch immediately
    this.intervalId = setInterval(this.fetchFunction, this.interval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  updateInterval(newInterval) {
    this.stop();
    this.interval = newInterval;
    this.start();
  }
}

// Usage
const energyPoller = new DataPoller(
  () => fetchLatestEnergy('100202000124410097'),
  30000 // 30 seconds
);

// Start polling
energyPoller.start();

// Stop when component unmounts
onUnmount(() => energyPoller.stop());
```

### 4. Batch Requests

```javascript
// Fetch multiple devices in parallel
async function fetchMultipleDevices(deviceSns) {
  try {
    const requests = deviceSns.map(sn =>
      fsolarAPI.get(`/devices/${sn}`)
    );

    const responses = await Promise.all(requests);
    return responses.map(r => r.data.data);
  } catch (error) {
    console.error('Error fetching devices:', error);
    throw error;
  }
}

// Usage
const devices = await fetchMultipleDevices([
  '100202000124410097',
  '072604810025340992'
]);
```

### 5. Loading States

```javascript
// Centralized loading state management
class LoadingManager {
  constructor() {
    this.loading = new Map();
    this.subscribers = new Set();
  }

  setLoading(key, isLoading) {
    this.loading.set(key, isLoading);
    this.notify();
  }

  isLoading(key) {
    return this.loading.get(key) || false;
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    this.subscribers.forEach(callback => callback(this.loading));
  }
}

const loadingManager = new LoadingManager();

// Usage
async function fetchWithLoading(key, fetchFunction) {
  loadingManager.setLoading(key, true);
  try {
    const result = await fetchFunction();
    return result;
  } finally {
    loadingManager.setLoading(key, false);
  }
}
```

---

## 📱 Mobile Considerations

### Optimized Pagination

```javascript
// Use smaller page sizes for mobile
const isMobile = window.innerWidth < 768;
const pageSize = isMobile ? 5 : 20;

await fsolarAPI.get('/devices', {
  params: { page: 1, limit: pageSize }
});
```

### Reduced Polling Frequency

```javascript
// Poll less frequently on mobile to save battery
const pollInterval = isMobile ? 60000 : 30000; // 60s vs 30s
```

### Lazy Loading

```javascript
// Intersection Observer for infinite scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !loading && hasMore) {
      loadMoreDevices();
    }
  });
});

observer.observe(document.querySelector('.load-more-trigger'));
```

---

## 🔒 Security Best Practices

### 1. Token Storage

```javascript
// Use secure storage
import SecureLS from 'secure-ls';
const ls = new SecureLS({ encodingType: 'aes' });

// Store token securely
ls.set('authToken', token);

// Retrieve token
const token = ls.get('authToken');
```

### 2. Request Signing

```javascript
// Add request signature
fsolarAPI.interceptors.request.use(config => {
  const timestamp = Date.now();
  const signature = generateSignature(config.url, timestamp);

  config.headers['X-Timestamp'] = timestamp;
  config.headers['X-Signature'] = signature;

  return config;
});
```

### 3. HTTPS Only

```javascript
// Ensure HTTPS in production
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.yourdomain.com/api'
  : 'http://localhost:3000/api';
```

---

## 📚 Additional Resources

### TypeScript Types

```typescript
// types/fsolar.ts
export interface Device {
  id: string;
  deviceSn: string;
  stationCode: string;
  name: string | null;
  deviceType: 'inverter' | 'battery' | 'meter' | 'other';
  status: 'online' | 'offline' | 'fault' | 'standby';
  ratedPower: number | null;
  metadata: any;
  lastSyncedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnergyData {
  id: string;
  deviceSn: string;
  timestamp: string;
  activePower: number | null;
  todayEnergy: number | null;
  totalEnergy: number | null;
  gridVoltage: number | null;
  batterySoc: number | null;
  pv1Power: number | null;
  pv2Power: number | null;
  loadPower: number | null;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
```

### API Client with TypeScript

```typescript
// api/fsolar.ts
import axios, { AxiosInstance } from 'axios';
import { Device, EnergyData, PaginatedResponse, ApiResponse } from '../types/fsolar';

class FsolarAPIClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL: `${baseURL}/api/fsolar/db`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getDevices(page = 1, limit = 20): Promise<PaginatedResponse<Device>> {
    const response = await this.client.get('/devices', {
      params: { page, limit }
    });
    return response.data;
  }

  async getDevice(deviceSn: string): Promise<ApiResponse<Device>> {
    const response = await this.client.get(`/devices/${deviceSn}`);
    return response.data;
  }

  async getLatestEnergy(deviceSn: string): Promise<ApiResponse<EnergyData>> {
    const response = await this.client.get(`/devices/${deviceSn}/energy/latest`);
    return response.data;
  }
}

export const fsolarClient = new FsolarAPIClient('http://localhost:3000/api');
```

---

## 🎉 Quick Reference

### Most Common Operations

```javascript
// 1. Get all devices
const devices = await fsolarAPI.get('/devices');

// 2. Get latest energy for a device
const energy = await fsolarAPI.get(`/devices/${deviceSn}/energy/latest`);

// 3. Get active alarms
const alarms = await fsolarAPI.get('/events/active');

// 4. Trigger full sync
await fsolarAPI.post('/sync/trigger', { types: ['full'] });

// 5. Get database stats
const stats = await fsolarAPI.get('/stats');
```

### Response Format

All responses follow this format:
```json
{
  "success": true,
  "data": { ... },
  "pagination": { ... } // Only for paginated endpoints
}
```

---

## 📞 Support

For issues or questions:
- Check API endpoint status: `GET /sync/status`
- Review sync logs: `GET /sync/history`
- Verify database stats: `GET /stats`

---

**Document Version:** 1.0
**Last Updated:** November 13, 2025
**API Status:** ✅ Production Ready
