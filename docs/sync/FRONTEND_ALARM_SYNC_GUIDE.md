# Frontend Integration Guide: HopeCloud Alarm Synchronization

## Overview

This guide explains how to integrate HopeCloud alarm synchronization into your frontend application. The alarm sync system retrieves device alarms from HopeCloud and stores them in the IUMS database for display and management.

---

## API Endpoints

### 1. **Resync Device Alarms**
Synchronizes alarms from HopeCloud for specified devices within a date range.

**Endpoint:** `POST /api/hopecloud/alarms/resync`

**Request Body:**
```typescript
interface AlarmResyncRequest {
  deviceIds?: number[];      // Optional: Specific device IDs to sync
  siteIds?: number[];        // Optional: Sync alarms for all devices from specific sites
  startDate?: string;        // Optional: Start date (YYYY-MM-DD). Default: 7 days ago
  endDate?: string;          // Optional: End date (YYYY-MM-DD). Default: today
}
```

**Response:**
```typescript
interface AlarmResyncResponse {
  status: string;
  message: string;
  data: {
    batchType: string;
    status: 'completed' | 'failed';
    recordsProcessed: number;
    recordsFailed: number;
    startTime: string;
    endTime: string;
    details: {
      devicesProcessed: number;
      alarmsCreated: number;
      alarmsFailed: number;
      startDate: string;
      endDate: string;
      errors: Array<{
        period: string;
        error: string;
      }>;
    };
  };
}
```

**Example Request:**
```javascript
// Sync last 7 days of alarms for specific devices
const response = await fetch('http://localhost:3000/api/hopecloud/alarms/resync', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    deviceIds: [5],
    startDate: '2025-09-29',
    endDate: '2025-09-29'
  })
});

const result = await response.json();
// result.data.details.alarmsCreated = 1
```

### 2. **Get Device Alarms**
Retrieve alarms for a specific device from the IUMS database.

**Endpoint:** `GET /api/device-alarms?deviceId={deviceId}`

**Response:**
```typescript
interface DeviceAlarm {
  id: number;
  deviceId: number;
  alarmType: string;
  alarmCode: string;
  externalId: string;        // HopeCloud alarm ID (prefixed with HC_)
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'active' | 'acknowledged' | 'resolved';
  occurredAt: string;        // ISO 8601 format
  acknowledgedAt?: string;
  resolvedAt?: string;
  acknowledgedBy?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 3. **Get HopeCloud Alarms (Direct API)**
Fetch alarms directly from HopeCloud API without storing in database.

**Endpoint:** `GET /api/hopecloud/alarms`

**Query Parameters:**
- `pageIndex` (required): Page number (starting from 1)
- `pageSize` (required): Items per page (1-50)
- `startTime` (optional): Start date (YYYY-MM-DD)
- `endTime` (optional): End date (YYYY-MM-DD), max 24 hours from startTime
- `faultCode` (optional): Alarm code filter
- `faultLevel` (optional): Alarm severity filter
- `status` (optional): 0=Pending, 1=Restored

**Response:**
```typescript
interface HopeCloudAlarm {
  id: string;
  reportedTime: string;
  equipmentSn: string;
  equipmentPn: string;
  alarmType: string | null;
  alarmGrade: string;
  alarmCode: string;
  alarmContent: string;
  alarmSource: string;
  status: string;             // "0" = pending, "1" = restored
  powerPlantId: string;
  powerPlantName: string;
  causesAnalysis: string;
  diagnosticAdvice: string;
  restoreTime: string;
  duration: string;
}
```

---

## React Implementation Examples

### Basic Alarm Sync Hook

```typescript
// hooks/useAlarmSync.ts
import { useState } from 'react';

interface AlarmSyncOptions {
  deviceIds?: number[];
  siteIds?: number[];
  startDate?: string;
  endDate?: string;
}

interface AlarmSyncResult {
  alarmsCreated: number;
  errors: Array<{ period: string; error: string }>;
}

export const useAlarmSync = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncAlarms = async (options: AlarmSyncOptions): Promise<AlarmSyncResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/hopecloud/alarms/resync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error(`Failed to sync alarms: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.status !== 'success') {
        throw new Error(result.message || 'Alarm sync failed');
      }

      return {
        alarmsCreated: result.data.details.alarmsCreated,
        errors: result.data.details.errors,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { syncAlarms, loading, error };
};
```

### Alarm List Component

```tsx
// components/DeviceAlarms.tsx
import React, { useState, useEffect } from 'react';
import { useAlarmSync } from '../hooks/useAlarmSync';

interface DeviceAlarm {
  id: number;
  deviceId: number;
  alarmCode: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  occurredAt: string;
  description?: string;
}

interface DeviceAlarmsProps {
  deviceId: number;
}

export const DeviceAlarms: React.FC<DeviceAlarmsProps> = ({ deviceId }) => {
  const [alarms, setAlarms] = useState<DeviceAlarm[]>([]);
  const [loading, setLoading] = useState(true);
  const { syncAlarms, loading: syncing } = useAlarmSync();

  useEffect(() => {
    fetchAlarms();
  }, [deviceId]);

  const fetchAlarms = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/device-alarms?deviceId=${deviceId}`);
      const data = await response.json();
      setAlarms(data);
    } catch (error) {
      console.error('Failed to fetch alarms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    const result = await syncAlarms({
      deviceIds: [deviceId],
      // Default: last 7 days
    });

    if (result) {
      alert(`Synced ${result.alarmsCreated} alarms`);
      fetchAlarms(); // Refresh the list
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div>Loading alarms...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Device Alarms</h2>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {syncing ? 'Syncing...' : 'Sync from HopeCloud'}
        </button>
      </div>

      {alarms.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No alarms found for this device
        </div>
      ) : (
        <div className="space-y-2">
          {alarms.map((alarm) => (
            <div
              key={alarm.id}
              className="border rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${getSeverityColor(alarm.severity)}`}>
                      Code {alarm.alarmCode}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(alarm.status)}`}>
                      {alarm.status}
                    </span>
                  </div>
                  <h3 className="font-medium mt-1">{alarm.title}</h3>
                  {alarm.description && (
                    <p className="text-sm text-gray-600 mt-1">{alarm.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Occurred: {new Date(alarm.occurredAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Advanced Alarm Sync with Date Range

```tsx
// components/AlarmSyncDialog.tsx
import React, { useState } from 'react';
import { useAlarmSync } from '../hooks/useAlarmSync';

interface AlarmSyncDialogProps {
  deviceIds: number[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AlarmSyncDialog: React.FC<AlarmSyncDialogProps> = ({
  deviceIds,
  onClose,
  onSuccess,
}) => {
  const { syncAlarms, loading, error } = useAlarmSync();
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await syncAlarms({
      deviceIds,
      startDate,
      endDate,
    });

    if (result) {
      if (result.errors.length > 0) {
        alert(
          `Synced ${result.alarmsCreated} alarms with ${result.errors.length} errors:\n` +
          result.errors.map(e => `${e.period}: ${e.error}`).join('\n')
        );
      } else {
        alert(`Successfully synced ${result.alarmsCreated} alarms`);
      }
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Sync Device Alarms</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={new Date().toISOString().split('T')[0]}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
            <p className="font-medium text-yellow-800">Note:</p>
            <ul className="text-yellow-700 mt-1 ml-4 list-disc">
              <li>HopeCloud processes alarms in 1-day chunks</li>
              <li>Large date ranges may take longer to sync</li>
              <li>Recommended: Sync 7-30 days at a time</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Syncing...' : 'Sync Alarms'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

### Site-Wide Alarm Sync

```tsx
// components/SiteAlarmSync.tsx
import React, { useState } from 'react';
import { useAlarmSync } from '../hooks/useAlarmSync';

interface SiteAlarmSyncProps {
  siteId: number;
  siteName: string;
}

export const SiteAlarmSync: React.FC<SiteAlarmSyncProps> = ({ siteId, siteName }) => {
  const { syncAlarms, loading, error } = useAlarmSync();
  const [syncPeriod, setSyncPeriod] = useState<'week' | 'month' | 'custom'>('week');

  const handleSync = async () => {
    const today = new Date();
    let startDate: string;

    switch (syncPeriod) {
      case 'week':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0];
        break;
      case 'month':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0];
        break;
      default:
        return; // Custom handled separately
    }

    const result = await syncAlarms({
      siteIds: [siteId],
      startDate,
      endDate: today.toISOString().split('T')[0],
    });

    if (result) {
      alert(
        `Site "${siteName}" alarm sync complete\n` +
        `Alarms created: ${result.alarmsCreated}\n` +
        `Errors: ${result.errors.length}`
      );
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-3">Sync Alarms for {siteName}</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-2">Sync Period</label>
          <select
            value={syncPeriod}
            onChange={(e) => setSyncPeriod(e.target.value as any)}
            className="w-full border rounded px-3 py-2"
            disabled={loading}
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        <button
          onClick={handleSync}
          disabled={loading || syncPeriod === 'custom'}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Syncing...' : 'Sync Alarms'}
        </button>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## Important Notes

### Date Format Requirements

**Always use `YYYY-MM-DD` format:**
```typescript
// ✅ CORRECT
startDate: '2025-09-29'
endDate: '2025-10-05'

// ❌ WRONG
startDate: '2025 09 29'  // Spaces not supported
endDate: '09-29-2025'    // MM-DD-YYYY not supported
```

### API Limitations

1. **Date Range Limit:** HopeCloud alarm API supports maximum 24-hour range per request
   - Backend automatically chunks requests into 1-day periods
   - Frontend can request any range, backend handles chunking

2. **Page Size Limit:** Maximum 50 alarms per page
   - Use `pageSize: 50` for optimal performance
   - Backend uses this limit automatically

3. **Rate Limiting:** HopeCloud has rate limits on alarm API
   - Avoid syncing too frequently
   - Recommend syncing once per hour maximum
   - Show loading state during sync operations

### Error Handling

```typescript
// Handle partial sync failures
const result = await syncAlarms({ deviceIds: [1, 2, 3] });

if (result) {
  if (result.errors.length > 0) {
    // Some periods failed but others succeeded
    console.log(`Created ${result.alarmsCreated} alarms`);
    console.log('Errors:', result.errors);
  } else {
    // Complete success
    console.log(`Successfully created ${result.alarmsCreated} alarms`);
  }
}
```

### Default Behavior

If no date range is specified, the API defaults to **last 7 days**:

```typescript
// These are equivalent:
await syncAlarms({ deviceIds: [5] });

await syncAlarms({
  deviceIds: [5],
  startDate: sevenDaysAgo,
  endDate: today
});
```

---

## Testing Examples

### Test Alarm Sync via cURL

```bash
# Sync last 7 days (default)
curl -X POST http://localhost:3000/api/hopecloud/alarms/resync \
  -H "Content-Type: application/json" \
  -d '{"deviceIds": [5]}'

# Sync specific date range
curl -X POST http://localhost:3000/api/hopecloud/alarms/resync \
  -H "Content-Type: application/json" \
  -d '{
    "deviceIds": [5],
    "startDate": "2025-09-29",
    "endDate": "2025-09-29"
  }'

# Sync all devices from a site
curl -X POST http://localhost:3000/api/hopecloud/alarms/resync \
  -H "Content-Type: application/json" \
  -d '{"siteIds": [1]}'
```

### Test Fetching Alarms

```bash
# Get all alarms for a device
curl http://localhost:3000/api/device-alarms?deviceId=5

# Get alarms directly from HopeCloud
curl 'http://localhost:3000/api/hopecloud/alarms?pageIndex=1&pageSize=10'

# Get alarms with date filter from HopeCloud
curl 'http://localhost:3000/api/hopecloud/alarms?pageIndex=1&pageSize=10&startTime=2025-09-29&endTime=2025-09-29'
```

---

## Troubleshooting

### Issue: "Request parameter error"
- **Cause:** Page size exceeds 50 or date range exceeds 24 hours
- **Solution:** Backend handles this automatically; if using direct API, ensure `pageSize ≤ 50`

### Issue: "Access frequency too high"
- **Cause:** HopeCloud rate limit exceeded
- **Solution:** Wait 1-2 minutes before retrying; implement rate limiting in UI

### Issue: No alarms synced despite HopeCloud showing alarms
- **Cause:** Device serial number mismatch
- **Solution:** Ensure device `serialNumber` in IUMS matches `equipmentSn` in HopeCloud

### Issue: Alarms not appearing in list after sync
- **Cause:** Frontend cache not refreshed
- **Solution:** Call `fetchAlarms()` after successful sync

---

## Best Practices

1. **Show loading states** during sync operations
2. **Display sync progress** for large date ranges
3. **Refresh alarm list** after successful sync
4. **Handle partial failures** gracefully (some days succeed, some fail)
5. **Limit sync frequency** to avoid rate limits (e.g., max once per hour)
6. **Validate date ranges** before submitting (start ≤ end, end ≤ today)
7. **Use sensible defaults** (e.g., last 7 days)

---

## Summary

The HopeCloud alarm sync system is now fully functional with:

✅ Date format: `YYYY-MM-DD` with dashes
✅ Default sync period: Last 7 days
✅ Automatic 1-day chunking for API limits
✅ Maximum page size: 50 alarms
✅ Support for device and site filtering
✅ Proper error handling and partial failure support

Use the React examples above to integrate alarm syncing into your frontend application.
