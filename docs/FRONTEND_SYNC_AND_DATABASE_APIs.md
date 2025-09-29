# HopeCloud Frontend Integration: Sync Triggers & Database APIs

## 🎯 Overview

This document provides complete frontend integration guidance for:
1. **Manual Sync Trigger APIs** - Manually trigger HopeCloud data synchronization
2. **Database APIs for Synced Data** - Access synchronized data efficiently from your database

## 🔄 Manual Sync Trigger APIs

All sync trigger APIs are **POST** requests that initiate data synchronization jobs. Use these for manual refreshes, testing, or immediate updates.

### Base URL Structure
```
POST /api/integrations/hopecloud/sync/{syncType}
```

### 1. Realtime Data Sync
**Endpoint**: `POST /hopecloud/sync/realtime`

**Purpose**: Trigger immediate synchronization of current power generation data for all sites.

**Frontend Implementation**:
```javascript
const triggerRealtimeSync = async () => {
  try {
    const response = await fetch('/api/integrations/hopecloud/sync/realtime', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Realtime sync failed:', error);
    throw error;
  }
};

// Usage in React component
const RealtimeSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await triggerRealtimeSync();
      setLastSync(new Date());
      console.log('Sync completed:', result.data);
    } catch (error) {
      alert('Sync failed: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button onClick={handleSync} disabled={syncing}>
      {syncing ? 'Syncing...' : 'Sync Realtime Data'}
    </button>
  );
};
```

**Response Format**:
```json
{
  "status": "success",
  "data": {
    "batchType": "hopecloud-realtime-manual",
    "status": "completed",
    "recordsProcessed": 3,
    "recordsFailed": 0,
    "startTime": "2025-09-26T10:30:00Z",
    "endTime": "2025-09-26T10:30:15Z",
    "details": {
      "sites": [
        {
          "siteId": 1,
          "siteName": "Solar Farm Alpha",
          "processed": 1,
          "failed": 0
        }
      ]
    }
  }
}
```

### 2. Daily Data Sync
**Endpoint**: `POST /hopecloud/sync/daily`

**Purpose**: Synchronize daily statistics for a specific date.

**Frontend Implementation**:
```javascript
const triggerDailySync = async (date = null) => {
  const url = new URL('/api/integrations/hopecloud/sync/daily', window.location.origin);
  if (date) {
    url.searchParams.append('date', date); // Format: YYYY-MM-DD
  }

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    }
  });

  return response.json();
};

// Date picker component for daily sync
const DailySync = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await triggerDailySync(selectedDate || null);
      alert('Daily sync completed successfully');
    } catch (error) {
      alert('Daily sync failed: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        max={new Date().toISOString().split('T')[0]}
      />
      <button onClick={handleSync} disabled={syncing}>
        {syncing ? 'Syncing...' : 'Sync Daily Data'}
      </button>
    </div>
  );
};
```

### 3. Monthly Data Sync
**Endpoint**: `POST /hopecloud/sync/monthly`

**Purpose**: Synchronize monthly statistics for the current month.

**Frontend Implementation**:
```javascript
const triggerMonthlySync = async () => {
  const response = await fetch('/api/integrations/hopecloud/sync/monthly', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    }
  });

  return response.json();
};
```

### 4. Yearly Data Sync
**Endpoint**: `POST /hopecloud/sync/yearly`

**Purpose**: Synchronize yearly statistics for the current year.

**Frontend Implementation**:
```javascript
const triggerYearlySync = async () => {
  const response = await fetch('/api/integrations/hopecloud/sync/yearly', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    }
  });

  return response.json();
};
```

### 5. Alarm Sync
**Endpoint**: `POST /hopecloud/sync/alarms`

**Purpose**: Synchronize active alarms and fault data.

**Frontend Implementation**:
```javascript
const triggerAlarmSync = async () => {
  const response = await fetch('/api/integrations/hopecloud/sync/alarms', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    }
  });

  return response.json();
};
```

### 6. Device Sync
**Endpoint**: `POST /hopecloud/sync/devices`

**Purpose**: Discover and synchronize device information.

**Frontend Implementation**:
```javascript
const triggerDeviceSync = async () => {
  const response = await fetch('/api/integrations/hopecloud/sync/devices', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    }
  });

  return response.json();
};
```

### 7. Site Sync
**Endpoint**: `POST /hopecloud/sync/sites`

**Purpose**: Discover and synchronize site information.

**Frontend Implementation**:
```javascript
const triggerSiteSync = async () => {
  const response = await fetch('/api/integrations/hopecloud/sync/sites', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    }
  });

  return response.json();
};
```

### 8. Historical Data Backfill
**Endpoint**: `POST /hopecloud/sync/historical`

**Purpose**: Backfill historical data for specific date ranges and sites.

**Frontend Implementation**:
```javascript
const triggerHistoricalBackfill = async (config) => {
  const response = await fetch('/api/integrations/hopecloud/sync/historical', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(config)
  });

  return response.json();
};

// Historical backfill component
const HistoricalBackfill = () => {
  const [config, setConfig] = useState({
    startDate: '',
    endDate: '',
    siteIds: [],
    dataTypes: ['daily'],
    maxDaysPerBatch: 30
  });
  const [syncing, setSyncing] = useState(false);

  const handleBackfill = async () => {
    setSyncing(true);
    try {
      const result = await triggerHistoricalBackfill(config);
      alert(`Backfill completed: ${result.data.recordsProcessed} sites processed`);
    } catch (error) {
      alert('Backfill failed: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <input
        type="date"
        placeholder="Start Date"
        value={config.startDate}
        onChange={(e) => setConfig({...config, startDate: e.target.value})}
      />
      <input
        type="date"
        placeholder="End Date"
        value={config.endDate}
        onChange={(e) => setConfig({...config, endDate: e.target.value})}
      />
      <button onClick={handleBackfill} disabled={syncing}>
        {syncing ? 'Processing...' : 'Start Backfill'}
      </button>
    </div>
  );
};
```

---

## 📊 Database APIs for Synced Data

These APIs provide fast access to data that has already been synchronized to your database. Use these for dashboards, reports, and general data display.

### 1. Site KPI Data APIs

#### Realtime Data (Synced every 5 minutes)
**Endpoint**: `GET /api/site-kpis`

**Query Parameters**:
- `dataType=realtime` (required)
- `siteId` (optional): Filter by specific site
- `limit` (optional): Number of records to return
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter

**Frontend Implementation**:
```javascript
// Get latest realtime data for all sites
const getLatestRealtimeData = async () => {
  const response = await fetch('/api/site-kpis?dataType=realtime&limit=1');
  return response.json();
};

// Get realtime data for specific site
const getSiteRealtimeData = async (siteId, limit = 10) => {
  const response = await fetch(`/api/site-kpis?siteId=${siteId}&dataType=realtime&limit=${limit}`);
  return response.json();
};

// Get realtime data for time range
const getRealtimeDataRange = async (siteId, startDate, endDate) => {
  const url = new URL('/api/site-kpis', window.location.origin);
  url.searchParams.append('siteId', siteId);
  url.searchParams.append('dataType', 'realtime');
  url.searchParams.append('startDate', startDate);
  url.searchParams.append('endDate', endDate);

  const response = await fetch(url.toString());
  return response.json();
};

// React hook for realtime data
const useRealtimeData = (siteId, refreshInterval = 300000) => { // 5 minutes
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getSiteRealtimeData(siteId, 1);
        setData(result.data || []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [siteId, refreshInterval]);

  return { data, loading, error };
};
```

**Data Structure**:
```typescript
interface RealtimeKPI {
  id: number;
  siteId: number;
  dataType: "realtime";
  timestamp: string; // ISO 8601
  activePower: number; // Current power (kW)
  totalYield: number; // Total energy generated (kWh)
  dailyYield: number; // Today's energy (kWh)
  efficiency: number; // Current efficiency %
  hopeCloudPlantId: string;
}
```

#### Daily Data (Synced daily at 1:30 AM)
**Endpoint**: `GET /api/site-kpis`

**Query Parameters**:
- `dataType=daily` (required)
- `siteId` (optional): Filter by specific site
- `startDate` (required): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `limit` (optional): Number of records

**Frontend Implementation**:
```javascript
// Get daily data for site in date range
const getDailyKPIData = async (siteId, startDate, endDate) => {
  const url = new URL('/api/site-kpis', window.location.origin);
  url.searchParams.append('siteId', siteId);
  url.searchParams.append('dataType', 'daily');
  url.searchParams.append('startDate', startDate);
  if (endDate) url.searchParams.append('endDate', endDate);

  const response = await fetch(url.toString());
  return response.json();
};

// Get last 30 days of daily data
const getLastMonthDailyData = async (siteId) => {
  const response = await fetch(`/api/site-kpis?siteId=${siteId}&dataType=daily&limit=30`);
  return response.json();
};

// Daily performance chart component
const DailyPerformanceChart = ({ siteId }) => {
  const [chartData, setChartData] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getDailyKPIData(siteId, dateRange.start, dateRange.end);
        setChartData(result.data);
      } catch (error) {
        console.error('Failed to load daily data:', error);
      }
    };

    loadData();
  }, [siteId, dateRange]);

  return (
    <div>
      <div>
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
        />
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
        />
      </div>
      {/* Chart implementation here */}
    </div>
  );
};
```

#### Monthly Data (Synced monthly on 2nd at 2:30 AM)
**Endpoint**: `GET /api/site-kpis`

**Query Parameters**:
- `dataType=monthly` (required)
- `siteId` (optional): Filter by specific site
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter
- `limit` (optional): Number of records (default: 12 for last 12 months)

**Frontend Implementation**:
```javascript
// Get monthly data for site
const getMonthlyKPIData = async (siteId, startDate = null, endDate = null) => {
  const url = new URL('/api/site-kpis', window.location.origin);
  url.searchParams.append('siteId', siteId);
  url.searchParams.append('dataType', 'monthly');
  if (startDate) url.searchParams.append('startDate', startDate);
  if (endDate) url.searchParams.append('endDate', endDate);

  const response = await fetch(url.toString());
  return response.json();
};

// Get last 12 months
const getLastYearMonthlyData = async (siteId) => {
  const response = await fetch(`/api/site-kpis?siteId=${siteId}&dataType=monthly&limit=12`);
  return response.json();
};
```

#### Yearly Data (Synced annually on Jan 1st at 4:00 AM)
**Endpoint**: `GET /api/site-kpis`

**Query Parameters**:
- `dataType=yearly` (required)
- `siteId` (optional): Filter by specific site
- `startDate` (optional): Start year
- `endDate` (optional): End year
- `limit` (optional): Number of records

**Frontend Implementation**:
```javascript
// Get yearly data for site
const getYearlyKPIData = async (siteId, startYear = null, endYear = null) => {
  const url = new URL('/api/site-kpis', window.location.origin);
  url.searchParams.append('siteId', siteId);
  url.searchParams.append('dataType', 'yearly');
  if (startYear) url.searchParams.append('startDate', `${startYear}-01-01`);
  if (endYear) url.searchParams.append('endDate', `${endYear}-12-31`);

  const response = await fetch(url.toString());
  return response.json();
};

// Get last 5 years
const getLastFiveYearsData = async (siteId) => {
  const response = await fetch(`/api/site-kpis?siteId=${siteId}&dataType=yearly&limit=5`);
  return response.json();
};
```

### 2. Device & Alarm Data APIs

#### Devices (Synced daily at 3:00 AM)
**Endpoint**: `GET /api/devices`

**Query Parameters**:
- `siteId` (optional): Filter by site
- `status` (optional): Filter by status (online/offline)
- `hasHopeCloudIntegration` (optional): Filter devices with HopeCloud integration

**Frontend Implementation**:
```javascript
// Get all devices
const getAllDevices = async () => {
  const response = await fetch('/api/devices');
  return response.json();
};

// Get devices by site
const getSiteDevices = async (siteId) => {
  const response = await fetch(`/api/devices?siteId=${siteId}`);
  return response.json();
};

// Get devices with HopeCloud integration
const getHopeCloudDevices = async () => {
  const response = await fetch('/api/devices?hasHopeCloudIntegration=true');
  return response.json();
};

// Get device details
const getDeviceDetails = async (deviceId) => {
  const response = await fetch(`/api/devices/${deviceId}`);
  return response.json();
};

// Device status component
const DeviceStatusGrid = ({ siteId }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const result = await getSiteDevices(siteId);
        setDevices(result.data);
      } catch (error) {
        console.error('Failed to load devices:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDevices();
  }, [siteId]);

  if (loading) return <div>Loading devices...</div>;

  return (
    <div className="device-grid">
      {devices.map(device => (
        <div key={device.id} className={`device-card ${device.status}`}>
          <h3>{device.name}</h3>
          <p>Type: {device.deviceType}</p>
          <p>Status: {device.status}</p>
          <p>Capacity: {device.capacity} kW</p>
        </div>
      ))}
    </div>
  );
};
```

#### Device Alarms (Synced every 10 minutes)
**Endpoint**: `GET /api/device-alarms`

**Query Parameters**:
- `status` (optional): active, resolved, acknowledged
- `siteId` (optional): Filter by site
- `deviceId` (optional): Filter by device
- `severity` (optional): high, medium, low
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter
- `page` (optional): Page number for pagination
- `limit` (optional): Records per page

**Frontend Implementation**:
```javascript
// Get active alarms
const getActiveAlarms = async (page = 1, limit = 20) => {
  const response = await fetch(`/api/device-alarms?status=active&page=${page}&limit=${limit}`);
  return response.json();
};

// Get alarms by site
const getSiteAlarms = async (siteId, status = null) => {
  const url = new URL('/api/device-alarms', window.location.origin);
  url.searchParams.append('siteId', siteId);
  if (status) url.searchParams.append('status', status);

  const response = await fetch(url.toString());
  return response.json();
};

// Get alarms by device
const getDeviceAlarms = async (deviceId) => {
  const response = await fetch(`/api/device-alarms?deviceId=${deviceId}`);
  return response.json();
};

// Get alarms by severity
const getHighSeverityAlarms = async () => {
  const response = await fetch('/api/device-alarms?severity=high');
  return response.json();
};

// Get alarm details
const getAlarmDetails = async (alarmId) => {
  const response = await fetch(`/api/device-alarms/${alarmId}`);
  return response.json();
};

// Acknowledge alarm
const acknowledgeAlarm = async (alarmId) => {
  const response = await fetch(`/api/device-alarms/${alarmId}/acknowledge`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Resolve alarm
const resolveAlarm = async (alarmId, resolutionNotes = '') => {
  const response = await fetch(`/api/device-alarms/${alarmId}/resolve`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ resolutionNotes })
  });
  return response.json();
};

// Alarm management component
const AlarmDashboard = () => {
  const [alarms, setAlarms] = useState([]);
  const [filter, setFilter] = useState({ status: 'active', severity: 'all' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlarms = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filter.status !== 'all') params.append('status', filter.status);
        if (filter.severity !== 'all') params.append('severity', filter.severity);

        const response = await fetch(`/api/device-alarms?${params.toString()}`);
        const result = await response.json();
        setAlarms(result.data);
      } catch (error) {
        console.error('Failed to load alarms:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAlarms();
  }, [filter]);

  const handleAcknowledge = async (alarmId) => {
    try {
      await acknowledgeAlarm(alarmId);
      // Refresh alarms list
      setAlarms(prev => prev.map(alarm =>
        alarm.id === alarmId
          ? { ...alarm, status: 'acknowledged' }
          : alarm
      ));
    } catch (error) {
      alert('Failed to acknowledge alarm: ' + error.message);
    }
  };

  return (
    <div>
      <div className="alarm-filters">
        <select
          value={filter.status}
          onChange={(e) => setFilter({...filter, status: e.target.value})}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
        </select>

        <select
          value={filter.severity}
          onChange={(e) => setFilter({...filter, severity: e.target.value})}
        >
          <option value="all">All Severity</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {loading ? (
        <div>Loading alarms...</div>
      ) : (
        <div className="alarm-list">
          {alarms.map(alarm => (
            <div key={alarm.id} className={`alarm-card ${alarm.severity}`}>
              <h4>{alarm.message}</h4>
              <p>Device: {alarm.deviceId}</p>
              <p>Severity: {alarm.severity}</p>
              <p>Occurred: {new Date(alarm.occurredAt).toLocaleString()}</p>

              {alarm.status === 'active' && (
                <button onClick={() => handleAcknowledge(alarm.id)}>
                  Acknowledge
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### 3. Sites & Users APIs

#### Sites (Discovered weekly on Sundays)
**Endpoint**: `GET /api/sites`

**Query Parameters**:
- `hasHopeCloudIntegration` (optional): Filter sites with HopeCloud integration
- `search` (optional): Search sites by name
- `status` (optional): Filter by status

**Frontend Implementation**:
```javascript
// Get all sites
const getAllSites = async () => {
  const response = await fetch('/api/sites');
  return response.json();
};

// Get sites with HopeCloud integration
const getHopeCloudSites = async () => {
  const response = await fetch('/api/sites?hasHopeCloudIntegration=true');
  return response.json();
};

// Get site details
const getSiteDetails = async (siteId) => {
  const response = await fetch(`/api/sites/${siteId}`);
  return response.json();
};

// Search sites
const searchSites = async (searchTerm) => {
  const response = await fetch(`/api/sites?search=${encodeURIComponent(searchTerm)}`);
  return response.json();
};

// Site selector component
const SiteSelector = ({ onSiteChange }) => {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);

  useEffect(() => {
    const loadSites = async () => {
      try {
        const result = await getAllSites();
        setSites(result.data);
      } catch (error) {
        console.error('Failed to load sites:', error);
      }
    };

    loadSites();
  }, []);

  const handleSiteChange = (siteId) => {
    const site = sites.find(s => s.id === parseInt(siteId));
    setSelectedSite(site);
    onSiteChange(site);
  };

  return (
    <select onChange={(e) => handleSiteChange(e.target.value)} value={selectedSite?.id || ''}>
      <option value="">Select a site</option>
      {sites.map(site => (
        <option key={site.id} value={site.id}>
          {site.name} ({site.capacity} kW)
        </option>
      ))}
    </select>
  );
};
```

#### Users (Synced weekly on Mondays)
**Endpoint**: `GET /api/users`

**Query Parameters**:
- `role` (optional): Filter by role
- `includeHierarchy` (optional): Include organizational hierarchy

**Frontend Implementation**:
```javascript
// Get all users
const getAllUsers = async () => {
  const response = await fetch('/api/users');
  return response.json();
};

// Get users by role
const getUsersByRole = async (role) => {
  const response = await fetch(`/api/users?role=${role}`);
  return response.json();
};

// Get user details
const getUserDetails = async (userId) => {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
};

// Get organizational hierarchy
const getOrganizationalHierarchy = async () => {
  const response = await fetch('/api/users?includeHierarchy=true');
  return response.json();
};
```

---

## 🔧 Comprehensive Sync Management Component

Here's a complete React component that manages all sync operations:

```javascript
import React, { useState, useEffect } from 'react';

const SyncManager = () => {
  const [syncStatus, setSyncStatus] = useState({});
  const [syncing, setSyncing] = useState({});
  const [lastSync, setLastSync] = useState({});

  // Generic sync function
  const triggerSync = async (syncType, config = null) => {
    const syncKey = syncType;
    setSyncing(prev => ({ ...prev, [syncKey]: true }));

    try {
      let url = `/api/integrations/hopecloud/sync/${syncType}`;
      let options = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      };

      // Handle special cases
      if (syncType === 'daily' && config?.date) {
        url += `?date=${config.date}`;
      } else if (syncType === 'historical' && config) {
        options.body = JSON.stringify(config);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      setSyncStatus(prev => ({
        ...prev,
        [syncKey]: { status: 'success', data: result.data }
      }));

      setLastSync(prev => ({
        ...prev,
        [syncKey]: new Date()
      }));

      return result;
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        [syncKey]: { status: 'error', error: error.message }
      }));
      throw error;
    } finally {
      setSyncing(prev => ({ ...prev, [syncKey]: false }));
    }
  };

  // Sync configurations
  const syncConfigs = [
    {
      key: 'realtime',
      label: 'Realtime Data',
      description: 'Current power generation data',
      color: 'blue'
    },
    {
      key: 'daily',
      label: 'Daily Data',
      description: 'Daily statistics',
      color: 'green',
      hasDatePicker: true
    },
    {
      key: 'monthly',
      label: 'Monthly Data',
      description: 'Monthly statistics',
      color: 'orange'
    },
    {
      key: 'yearly',
      label: 'Yearly Data',
      description: 'Annual statistics',
      color: 'purple'
    },
    {
      key: 'alarms',
      label: 'Alarms',
      description: 'Fault and alarm data',
      color: 'red'
    },
    {
      key: 'devices',
      label: 'Devices',
      description: 'Device discovery and sync',
      color: 'teal'
    },
    {
      key: 'sites',
      label: 'Sites',
      description: 'Site discovery and sync',
      color: 'indigo'
    }
  ];

  return (
    <div className="sync-manager">
      <h2>HopeCloud Sync Management</h2>

      <div className="sync-grid">
        {syncConfigs.map(config => (
          <SyncCard
            key={config.key}
            config={config}
            syncing={syncing[config.key]}
            status={syncStatus[config.key]}
            lastSync={lastSync[config.key]}
            onSync={(syncConfig) => triggerSync(config.key, syncConfig)}
          />
        ))}
      </div>

      {/* Historical backfill section */}
      <HistoricalBackfillSection onSync={(config) => triggerSync('historical', config)} />
    </div>
  );
};

const SyncCard = ({ config, syncing, status, lastSync, onSync }) => {
  const [dateConfig, setDateConfig] = useState({});

  const handleSync = () => {
    onSync(config.hasDatePicker ? dateConfig : null);
  };

  return (
    <div className={`sync-card ${config.color}`}>
      <h3>{config.label}</h3>
      <p>{config.description}</p>

      {config.hasDatePicker && (
        <input
          type="date"
          value={dateConfig.date || ''}
          onChange={(e) => setDateConfig({ date: e.target.value })}
          max={new Date().toISOString().split('T')[0]}
        />
      )}

      <button
        onClick={handleSync}
        disabled={syncing}
        className={`sync-button ${syncing ? 'syncing' : ''}`}
      >
        {syncing ? 'Syncing...' : `Sync ${config.label}`}
      </button>

      {lastSync && (
        <p className="last-sync">
          Last sync: {lastSync.toLocaleString()}
        </p>
      )}

      {status && (
        <div className={`sync-status ${status.status}`}>
          {status.status === 'success' ? (
            <span>✓ Success</span>
          ) : (
            <span>✗ Error: {status.error}</span>
          )}
        </div>
      )}
    </div>
  );
};

const HistoricalBackfillSection = ({ onSync }) => {
  const [config, setConfig] = useState({
    startDate: '',
    endDate: '',
    siteIds: [],
    dataTypes: ['daily'],
    maxDaysPerBatch: 30
  });
  const [syncing, setSyncing] = useState(false);

  const handleBackfill = async () => {
    setSyncing(true);
    try {
      await onSync(config);
      alert('Historical backfill completed successfully');
    } catch (error) {
      alert('Backfill failed: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="historical-backfill">
      <h3>Historical Data Backfill</h3>
      <div className="backfill-form">
        <input
          type="date"
          placeholder="Start Date"
          value={config.startDate}
          onChange={(e) => setConfig({...config, startDate: e.target.value})}
        />
        <input
          type="date"
          placeholder="End Date"
          value={config.endDate}
          onChange={(e) => setConfig({...config, endDate: e.target.value})}
        />
        <select
          multiple
          value={config.dataTypes}
          onChange={(e) => setConfig({
            ...config,
            dataTypes: Array.from(e.target.selectedOptions, option => option.value)
          })}
        >
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
        </select>
        <button onClick={handleBackfill} disabled={syncing}>
          {syncing ? 'Processing...' : 'Start Backfill'}
        </button>
      </div>
    </div>
  );
};

export default SyncManager;
```

---

## 📈 Dashboard Integration Example

Here's a complete dashboard that uses both sync triggers and database APIs:

```javascript
import React, { useState, useEffect } from 'react';

const HopeCloudDashboard = () => {
  const [selectedSite, setSelectedSite] = useState(null);
  const [realtimeData, setRealtimeData] = useState(null);
  const [activeAlarms, setActiveAlarms] = useState([]);
  const [devices, setDevices] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh realtime data every 5 minutes
  useEffect(() => {
    if (!selectedSite) return;

    const fetchRealtimeData = async () => {
      try {
        const response = await fetch(`/api/site-kpis?siteId=${selectedSite.id}&dataType=realtime&limit=1`);
        const result = await response.json();
        setRealtimeData(result.data[0] || null);
      } catch (error) {
        console.error('Failed to fetch realtime data:', error);
      }
    };

    fetchRealtimeData();
    const interval = setInterval(fetchRealtimeData, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [selectedSite]);

  // Load active alarms
  useEffect(() => {
    if (!selectedSite) return;

    const fetchAlarms = async () => {
      try {
        const response = await fetch(`/api/device-alarms?siteId=${selectedSite.id}&status=active`);
        const result = await response.json();
        setActiveAlarms(result.data || []);
      } catch (error) {
        console.error('Failed to fetch alarms:', error);
      }
    };

    fetchAlarms();
  }, [selectedSite]);

  // Load devices
  useEffect(() => {
    if (!selectedSite) return;

    const fetchDevices = async () => {
      try {
        const response = await fetch(`/api/devices?siteId=${selectedSite.id}`);
        const result = await response.json();
        setDevices(result.data || []);
      } catch (error) {
        console.error('Failed to fetch devices:', error);
      }
    };

    fetchDevices();
  }, [selectedSite]);

  // Manual refresh all data
  const refreshAllData = async () => {
    setRefreshing(true);
    try {
      // Trigger realtime sync
      await fetch('/api/integrations/hopecloud/sync/realtime', { method: 'POST' });

      // Trigger alarm sync
      await fetch('/api/integrations/hopecloud/sync/alarms', { method: 'POST' });

      // Wait a moment for sync to complete, then refresh data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      alert('Refresh failed: ' + error.message);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="hopecloud-dashboard">
      <header className="dashboard-header">
        <h1>HopeCloud Solar Dashboard</h1>
        <div className="header-controls">
          <SiteSelector onSiteChange={setSelectedSite} />
          <button onClick={refreshAllData} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </header>

      {selectedSite ? (
        <div className="dashboard-content">
          {/* KPI Cards */}
          <div className="kpi-row">
            <KPICard
              title="Current Power"
              value={realtimeData?.activePower || 0}
              unit="kW"
              icon="⚡"
            />
            <KPICard
              title="Today's Yield"
              value={realtimeData?.dailyYield || 0}
              unit="kWh"
              icon="☀️"
            />
            <KPICard
              title="Total Yield"
              value={realtimeData?.totalYield || 0}
              unit="kWh"
              icon="🔋"
            />
            <KPICard
              title="Active Alarms"
              value={activeAlarms.length}
              unit=""
              icon="🚨"
              color={activeAlarms.length > 0 ? 'red' : 'green'}
            />
          </div>

          {/* Main Content Grid */}
          <div className="main-grid">
            <div className="device-status">
              <h3>Device Status</h3>
              <DeviceStatusGrid devices={devices} />
            </div>

            <div className="active-alarms">
              <h3>Active Alarms</h3>
              <AlarmsList alarms={activeAlarms} />
            </div>
          </div>
        </div>
      ) : (
        <div className="no-site-selected">
          <p>Please select a site to view dashboard data</p>
        </div>
      )}
    </div>
  );
};

const KPICard = ({ title, value, unit, icon, color = 'blue' }) => (
  <div className={`kpi-card ${color}`}>
    <div className="kpi-icon">{icon}</div>
    <div className="kpi-content">
      <h4>{title}</h4>
      <p className="kpi-value">{value.toLocaleString()} {unit}</p>
    </div>
  </div>
);

const DeviceStatusGrid = ({ devices }) => (
  <div className="device-grid">
    {devices.map(device => (
      <div key={device.id} className={`device-card ${device.status}`}>
        <h4>{device.name}</h4>
        <p>{device.deviceType}</p>
        <p className="device-status">{device.status}</p>
      </div>
    ))}
  </div>
);

const AlarmsList = ({ alarms }) => (
  <div className="alarms-list">
    {alarms.length === 0 ? (
      <p>No active alarms</p>
    ) : (
      alarms.map(alarm => (
        <div key={alarm.id} className={`alarm-item ${alarm.severity}`}>
          <h5>{alarm.message}</h5>
          <p>Device: {alarm.deviceId}</p>
          <p>Severity: {alarm.severity}</p>
          <small>{new Date(alarm.occurredAt).toLocaleString()}</small>
        </div>
      ))
    )}
  </div>
);

export default HopeCloudDashboard;
```

---

## 🎨 CSS Styles

```css
/* Sync Manager Styles */
.sync-manager {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.sync-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.sync-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.sync-card.blue { border-left: 4px solid #3b82f6; }
.sync-card.green { border-left: 4px solid #10b981; }
.sync-card.orange { border-left: 4px solid #f59e0b; }
.sync-card.purple { border-left: 4px solid #8b5cf6; }
.sync-card.red { border-left: 4px solid #ef4444; }
.sync-card.teal { border-left: 4px solid #14b8a6; }
.sync-card.indigo { border-left: 4px solid #6366f1; }

.sync-button {
  width: 100%;
  padding: 10px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.sync-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.sync-button.syncing {
  background: #f59e0b;
}

.sync-status.success {
  color: #10b981;
  margin-top: 10px;
}

.sync-status.error {
  color: #ef4444;
  margin-top: 10px;
}

/* Dashboard Styles */
.hopecloud-dashboard {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.header-controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.kpi-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid #3b82f6;
}

.kpi-card.red { border-left-color: #ef4444; }
.kpi-card.green { border-left-color: #10b981; }

.kpi-icon {
  font-size: 2rem;
  margin-right: 15px;
}

.kpi-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 5px 0;
}

.main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.device-card {
  padding: 15px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-left: 4px solid #9ca3af;
}

.device-card.online { border-left-color: #10b981; }
.device-card.offline { border-left-color: #ef4444; }

.alarms-list {
  max-height: 400px;
  overflow-y: auto;
}

.alarm-item {
  padding: 15px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 10px;
  border-left: 4px solid #9ca3af;
}

.alarm-item.high { border-left-color: #ef4444; }
.alarm-item.medium { border-left-color: #f59e0b; }
.alarm-item.low { border-left-color: #3b82f6; }

@media (max-width: 768px) {
  .main-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 15px;
  }
}
```

---

## 🚀 Quick Start Checklist

1. **Authentication Setup**
   ```javascript
   // Ensure you have user token for authenticated requests
   const userToken = localStorage.getItem('authToken');
   ```

2. **Install Components**
   - Copy the React components into your project
   - Install required dependencies (if any)
   - Add CSS styles

3. **Test Sync Operations**
   ```javascript
   // Test a simple sync
   const testSync = async () => {
     try {
       const result = await fetch('/api/integrations/hopecloud/sync/realtime', {
         method: 'POST',
         headers: { 'Authorization': `Bearer ${userToken}` }
       });
       console.log('Sync result:', await result.json());
     } catch (error) {
       console.error('Sync failed:', error);
     }
   };
   ```

4. **Test Database APIs**
   ```javascript
   // Test data retrieval
   const testDataAccess = async () => {
     try {
       const result = await fetch('/api/site-kpis?dataType=realtime&limit=1');
       console.log('Data:', await result.json());
     } catch (error) {
       console.error('Data access failed:', error);
     }
   };
   ```

5. **Integration Points**
   - Add `SyncManager` component to admin panel
   - Integrate dashboard components into main application
   - Set up automated refresh intervals
   - Configure error handling and notifications

This documentation provides everything needed to integrate HopeCloud sync triggers and database APIs into your frontend application efficiently and effectively.