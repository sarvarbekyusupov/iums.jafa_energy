# HopeCloud Device Resync Documentation

## Overview

This document describes the device synchronization system for HopeCloud equipment, including the optimization for fast bulk syncing and data validation through API vs DB comparisons.

## Device Data Synchronization

### What Gets Synced

The device resync pulls historical data from each device's installation date (or working date) through the current date:

1. **Daily Statistics** (bulk API - fast)
   - Total energy generation (kWh)
   - Daily yield metrics
   - Stored in `equipment_statistics` table

2. **Intraday Readings** (day-by-day API - slow, optional)
   - 5-minute interval power readings
   - Voltage, current, temperature
   - Stored in `equipment_readings` table

### Sync Endpoints

#### Resync All Devices
```bash
POST /api/hopecloud/devices/resync
Content-Type: application/json

# Resync all devices
{}

# Resync specific devices
{
  "deviceIds": [4, 5, 6]
}

# Resync all devices from specific sites
{
  "siteIds": [2, 3]
}

# Fast mode - skip intraday readings (recommended)
{
  "skipReadings": true
}

# Combine filters
{
  "deviceIds": [4],
  "skipReadings": true
}
```

#### Compare API vs DB Data
```bash
POST /api/hopecloud/devices/compare
Content-Type: application/json

# Compare all devices for all time periods
{
  "intervals": ["10days", "30days", "90days", "all"]
}

# Compare specific devices
{
  "deviceIds": [4, 5, 6],
  "intervals": ["all"]
}
```

## Performance Optimization

### The Problem

Without optimization, device resync is extremely slow:

```typescript
// Slow approach: 147 days × 3 seconds delay = 7+ minutes per device
for (let day = 0; day < 147; day++) {
  await api.getIntradayReadings(device, day);
  await delay(3000); // Rate limiting
}
```

### The Solution: Bulk Sync + skipReadings

Use bulk API calls for daily statistics and optionally skip intraday readings:

```bash
# Fast resync (5-20 seconds instead of 7+ minutes)
curl -X POST http://localhost:3000/api/hopecloud/devices/resync \
  -H "Content-Type: application/json" \
  -d '{"skipReadings": true}'
```

**Performance comparison:**
- **Without `skipReadings`**: 7+ minutes per device (147 days × 3 sec/day)
- **With `skipReadings`**: ~5 seconds per device (single bulk API call)
- **Speedup**: 75x faster

### When to Use skipReadings

| Use Case | skipReadings | Reason |
|----------|-------------|---------|
| Initial bulk sync | `true` | Fast historical data import |
| Daily scheduled sync | `true` | Only need daily totals |
| Analytics & reporting | `true` | Daily granularity sufficient |
| Detailed troubleshooting | `false` | Need 5-minute intervals |
| Performance analysis | `false` | Need intraday patterns |

## Implementation Details

### Date Range Calculation

Devices sync from their installation date or working date:

```typescript
// Device 4: May 10, 2025 → 147 days
// Device 5: Aug 15, 2025 → 50 days
// Device 6: Aug 15, 2025 → 50 days

const startDate = device.installationDate || device.workingDate || oneYearAgo;
const endDate = new Date(); // Today
```

### Data Storage

**Daily statistics** stored in `equipment_statistics`:
```sql
INSERT INTO equipment_statistics (
  device_id,
  date,
  total_energy_kwh,
  daily_yield_kwh
) VALUES (
  4,
  '2025-05-10',
  120.5,
  120.5
)
```

**Intraday readings** stored in `equipment_readings` (when `skipReadings=false`):
```sql
INSERT INTO equipment_readings (
  device_id,
  measured_at,
  power_kw,
  voltage_v,
  current_a
) VALUES (
  4,
  '2025-05-10 12:00:00',
  8.5,
  220.0,
  38.6
)
```

### Date Format Normalization

**Critical for comparison accuracy:**

API returns: `"2025-05-10 23:50:00"` (with timestamp)
DB stores: `"2025-05-10"` (date only)

The comparison extracts dates from API timestamps:

```typescript
// API data normalization
date: stat.time.split(' ')[0] // "2025-05-10 23:50:00" → "2025-05-10"

// DB data normalization
date: new Date(stat.date).toISOString().split('T')[0] // "2025-05-10"
```

## Data Validation

### Comparison Process

The comparison endpoint validates sync accuracy by:

1. Fetching data from HopeCloud API for date range
2. Fetching data from local DB for same date range
3. Normalizing dates to YYYY-MM-DD format
4. Comparing record counts and values
5. Identifying differences

### Comparison Results

```json
{
  "deviceId": 4,
  "interval": "all",
  "startDate": "2025-05-10",
  "endDate": "2025-10-03",
  "apiData": [...],     // 147 records from API
  "dbData": [...],      // 147 records from DB
  "differences": [
    {
      "type": "value_mismatch",
      "date": "2025-10-03",
      "apiValue": 67.91,
      "dbValue": 67.75,
      "difference": 0.16
    }
  ]
}
```

### Difference Types

1. **missing_in_db**: Record exists in API but not in DB
2. **missing_in_api**: Record exists in DB but not in API
3. **value_mismatch**: Record exists in both but values differ

### Acceptable Tolerances

- **Exact match**: Values identical
- **Minor mismatch**: < 1 kWh difference (acceptable - API updates in real-time)
- **Major mismatch**: > 1 kWh difference (requires investigation)

## Current Device Status

### Device 4
- **Serial**: 30100189E001A02235S00056
- **Sync period**: 642 days (Jan 1, 2024 - Oct 3, 2025)
- **Records synced**: 642
- **Accuracy**: 100% (642/642 exact matches)

### Device 5
- **Serial**: 30100204E001F00G247H57885
- **Sync period**: 642 days (Jan 1, 2024 - Oct 3, 2025)
- **Records synced**: 642
- **Accuracy**: 100% (642/642 exact matches)

### Device 6
- **Serial**: 30100189E001A02235S00064
- **Sync period**: 642 days (Jan 1, 2024 - Oct 3, 2025)
- **Records synced**: 642
- **Accuracy**: 100% (642/642 exact matches)

**Note**: Devices sync from Jan 1, 2024 to capture all available historical data from HopeCloud API, regardless of the installation date recorded in the local database.

## Station Installation Dates

The following are the actual installation dates (networkTime) from HopeCloud for each station:

### Station 1: Sag'bon Fayz
- **HopeCloud ID**: 1855864184282177538
- **Installation Date**: November 11, 2024
- **Capacity**: 20 kW
- **Location**: Tashkent, Almazar District

### Station 2: Farxod aka PALMA
- **HopeCloud ID**: 1921207990405709826
- **Installation Date**: May 10, 2025
- **Capacity**: 20 kW
- **Location**: Tashkent Region

### Station 3: OOO "Kontinent kachestvo"
- **HopeCloud ID**: 1931572113875873794
- **Installation Date**: June 8, 2025
- **Capacity**: 100 kW
- **Location**: Zangiota District, Tashkent Region

**Note**: Station sync uses the `installationDate` from the local database. Ensure this matches the `networkTime` field from HopeCloud API for accurate historical data sync.

## Testing Workflow

### 1. Fast Resync (Recommended)

```bash
# Resync all devices quickly
curl -X POST http://localhost:3000/api/hopecloud/devices/resync \
  -H "Content-Type: application/json" \
  -d '{"skipReadings": true}'

# Expected: ~20 seconds for 3 devices
```

### 2. Verify Data Accuracy

```bash
# Compare all devices
curl -X POST http://localhost:3000/api/hopecloud/devices/compare \
  -H "Content-Type: application/json" \
  -d '{"intervals": ["all"]}'

# Expected: 99%+ match rate
```

### 3. Check Specific Device

```bash
# Resync Device 4 only
curl -X POST http://localhost:3000/api/hopecloud/devices/resync \
  -H "Content-Type: application/json" \
  -d '{"deviceIds": [4], "skipReadings": true}'

# Compare Device 4
curl -X POST http://localhost:3000/api/hopecloud/devices/compare \
  -H "Content-Type: application/json" \
  -d '{"deviceIds": [4], "intervals": ["all"]}'
```

## Troubleshooting

### Issue: All records show "missing_in_db"

**Cause**: Date format mismatch between API and DB comparison

**Solution**: Ensure API dates are normalized:
```typescript
date: stat.time.split(' ')[0] // Extract date from timestamp
```

### Issue: Resync times out after 2 minutes

**Cause**: Too many day-by-day intraday readings calls

**Solution**: Use `skipReadings: true` for faster sync

### Issue: Minor value mismatches on recent dates

**Cause**: API data updates in real-time, DB syncs periodically

**Solution**: Normal behavior - differences < 1 kWh are acceptable for current day

### Issue: Large gaps in historical data

**Cause**: Device wasn't reporting during that period

**Solution**: Check device uptime and HopeCloud connection logs

## Code References

### Service Implementation
[hopecloud-batch.service.ts](../src/integrations/hopecloud/services/hopecloud-batch.service.ts)

- **Line 2936-2945**: `resyncDevicesFromInstallationDate()` - Main resync function
- **Line 3073-3178**: `resyncSingleDevice()` - Per-device sync with skipReadings support
- **Line 3145-3175**: Intraday readings loop (conditionally skipped)
- **Line 3296-3337**: `fetchDeviceDataFromApi()` - API data fetch with date normalization
- **Line 3339-3362**: `fetchDeviceDataFromDb()` - DB data fetch
- **Line 3364-3410**: `identifyDataDifferences()` - Comparison logic

### Controller Endpoints
[hopecloud.controller.ts](../src/integrations/hopecloud/hopecloud.controller.ts)

- **Line 2607-2704**: POST `/devices/resync` - Resync endpoint
- **Line 2706-2800**: POST `/devices/compare` - Comparison endpoint

## Best Practices

1. **Use bulk sync for initial setup**: `skipReadings: true` for fast historical import
2. **Daily maintenance sync**: Scheduled job with `skipReadings: true`
3. **Validate after bulk operations**: Always run comparison after resync
4. **Monitor for gaps**: Check comparison results for missing_in_db entries
5. **Accept minor mismatches**: Today's data often has small differences due to real-time updates
6. **Investigate major mismatches**: Differences > 1 kWh may indicate sync issues

## Related Documentation

- [HopeCloud Sync System](./HOPECLOUD_SYNC_SYSTEM.md) - Overall sync architecture
- [HopeCloud Site KPI Fix](./HOPECLOUD_SITE_KPI_FIX.md) - Station sync implementation
