# HopeCloud Sync APIs Documentation

## Current Sync APIs Available

### 1. Realtime Sync
- **Endpoint**: `/hopecloud/sync/realtime`
- **Method**: `POST`
- **Service Method**: `triggerRealtimeSync()`
- **Description**: Synchronizes real-time data from HopeCloud
- **Status**: ✅ Available

### 2. Daily Sync
- **Endpoint**: `/hopecloud/sync/daily`
- **Method**: `POST`
- **Service Method**: `triggerDailySync(options?: HopeCloudSyncOptions)`
- **Description**: Synchronizes daily aggregated data
- **Parameters**: Optional sync options
- **Status**: ✅ Available

### 3. Monthly Sync
- **Endpoint**: `/hopecloud/sync/monthly`
- **Method**: `POST`
- **Service Method**: `triggerMonthlySync()`
- **Description**: Synchronizes monthly aggregated data
- **Status**: ✅ Available

### 4. Sites Sync
- **Endpoint**: `/hopecloud/sync/sites`
- **Method**: `POST`
- **Service Method**: `triggerSiteSync()`
- **Description**: Synchronizes site/plant data
- **Status**: ✅ Available

### 5. Devices Sync
- **Endpoint**: `/hopecloud/sync/devices`
- **Method**: `POST`
- **Service Method**: `triggerDeviceSync()`
- **Description**: Synchronizes device/equipment data
- **Status**: ✅ Available

## Missing Sync APIs (Commonly Needed)

### 1. Yearly Sync
- **Expected Endpoint**: `/hopecloud/sync/yearly`
- **Expected Method**: `POST`
- **Expected Service Method**: `triggerYearlySync()`
- **Description**: Synchronizes yearly aggregated data
- **Status**: ❌ Missing
- **Priority**: Medium

### 2. Alarm Sync
- **Expected Endpoint**: `/hopecloud/sync/alarms`
- **Expected Method**: `POST`
- **Expected Service Method**: `triggerAlarmSync()`
- **Description**: Synchronizes alarm and alert data
- **Status**: ❌ Missing
- **Priority**: High

### 3. Historical Data Sync
- **Expected Endpoint**: `/hopecloud/sync/historical`
- **Expected Method**: `POST`
- **Expected Service Method**: `triggerHistoricalSync(config)`
- **Description**: Synchronizes historical data with date range and filtering
- **Expected Parameters**:
  ```typescript
  {
    startDate: string;
    endDate: string;
    siteIds?: number[];
    dataTypes?: string[];
    maxDaysPerBatch?: number;
  }
  ```
- **Status**: ❌ Missing
- **Priority**: High

### 4. Equipment/Inverter Sync
- **Expected Endpoint**: `/hopecloud/sync/equipment`
- **Expected Method**: `POST`
- **Expected Service Method**: `triggerEquipmentSync()`
- **Description**: Specifically syncs equipment/inverter data
- **Status**: ❌ Missing
- **Priority**: Medium

### 5. User Data Sync
- **Expected Endpoint**: `/hopecloud/sync/users`
- **Expected Method**: `POST`
- **Expected Service Method**: `triggerUserSync()`
- **Description**: Synchronizes user accounts and permissions
- **Status**: ❌ Missing
- **Priority**: Low

## Database APIs for Synced Data

### 1. Site KPIs Service
- **Service**: `site-kpis.service.ts`
- **Endpoints**:
  - `GET /site-kpis` - Get all site KPIs
  - `GET /site-kpis/:id` - Get specific KPI
  - `POST /site-kpis` - Create new KPI
  - `PUT /site-kpis/:id` - Update KPI
  - `DELETE /site-kpis/:id` - Delete KPI
- **Status**: ✅ Available

### 2. Device Alarms Service
- **Service**: `device-alarms.service.ts`
- **Endpoints**:
  - `GET /device-alarms` - Get all alarms
  - `GET /device-alarms/:id` - Get specific alarm
  - `POST /device-alarms` - Create new alarm
  - `PUT /device-alarms/:id` - Update alarm
  - `DELETE /device-alarms/:id` - Delete alarm
  - `POST /device-alarms/:id/acknowledge` - Acknowledge alarm
  - `POST /device-alarms/:id/resolve` - Resolve alarm
- **Status**: ✅ Available

## Manual Testing Checklist

### Current APIs to Test:
1. [ ] `POST /hopecloud/sync/realtime` - Test realtime sync trigger
2. [ ] `POST /hopecloud/sync/daily` - Test daily sync trigger
3. [ ] `POST /hopecloud/sync/monthly` - Test monthly sync trigger
4. [ ] `POST /hopecloud/sync/sites` - Test sites sync trigger
5. [ ] `POST /hopecloud/sync/devices` - Test devices sync trigger

### Database APIs to Test:
1. [ ] `GET /site-kpis` - Verify site KPIs endpoint
2. [ ] `GET /device-alarms` - Verify device alarms endpoint
3. [ ] `POST /device-alarms/:id/acknowledge` - Test alarm acknowledgment
4. [ ] `POST /device-alarms/:id/resolve` - Test alarm resolution

### Missing APIs to Request from Backend:
1. [ ] `POST /hopecloud/sync/yearly` - Request yearly sync endpoint
2. [ ] `POST /hopecloud/sync/alarms` - Request alarm sync endpoint
3. [ ] `POST /hopecloud/sync/historical` - Request historical sync with config
4. [ ] `POST /hopecloud/sync/equipment` - Request equipment-specific sync

## Implementation Notes

### Error Handling
All sync APIs should return `HopeCloudSyncResult` with:
- `status: 'success' | 'error'`
- `message: string`
- `data?: any`

### Rate Limiting
Consider implementing rate limiting for sync operations to prevent system overload.

### Monitoring
Implement logging and monitoring for sync operations to track:
- Sync duration
- Success/failure rates
- Data volume synced
- Error patterns

## Next Steps

1. **Manual Testing**: Test all available sync APIs to verify functionality
2. **Backend Coordination**: Request missing sync endpoints from backend team
3. **Error Handling**: Implement robust error handling for sync operations
4. **UI Integration**: Create UI components for manual sync triggers
5. **Scheduling**: Implement automated sync scheduling