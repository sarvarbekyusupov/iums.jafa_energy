# Fsolar API Integration

Complete TypeScript integration for all 29 Fsolar API endpoints.

## 📁 Structure

```
fsolar/
├── auth.service.ts       # Authentication (5 endpoints)
├── device.service.ts     # Device Management (10 endpoints)
├── template.service.ts   # Strategy Templates (5 endpoints)
├── task.service.ts       # Economic Tasks (6 endpoints)
├── monitor.service.ts    # Task Monitoring (1 endpoint)
├── record.service.ts     # Run Records (2 endpoints)
├── utils.ts              # Utility functions
├── examples.ts           # Usage examples
├── index.ts              # Main export
└── README.md            # This file
```

## 🚀 Quick Start

### Import Services

```typescript
import {
  fsolarAuthService,
  fsolarDeviceService,
  fsolarTemplateService,
  fsolarTaskService,
  fsolarMonitorService,
  fsolarRecordService,
} from '@/service/fsolar';
```

### Check Authentication

```typescript
const status = await fsolarAuthService.getAuthStatus();
console.log('Authenticated:', status.authenticated);
```

### Get Devices

```typescript
const devices = await fsolarDeviceService.getDeviceList({
  pageNum: 1,
  pageSize: 20,
});
```

### Create Template

```typescript
const template = await fsolarTemplateService.addTemplate({
  templateName: 'Morning Peak Strategy',
  strategy1: { type: 1, startTime: '06:00', endTime: '09:00', mode: 1, power: 5000 },
  strategy2: { type: 0 },
  strategy3: { type: 0 },
  strategy4: { type: 0 },
});
```

### Run Task and Monitor

```typescript
// Run task
const runResult = await fsolarTaskService.runTaskNormal(taskId);

// Monitor execution
const finalStatus = await fsolarMonitorService.monitorTaskUntilComplete(
  parseInt(runResult.runTaskRecordId),
  taskId,
  {
    onUpdate: (status) => {
      console.log(`Progress: ${fsolarMonitorService.getProgressPercentage(status)}%`);
    },
  }
);

console.log('Task completed!', finalStatus);
```

## 📚 Service Overview

### 1. Authentication Service (5 endpoints)

- `login()` - Manual login (auto-handled by backend)
- `getAuthStatus()` - Check authentication status
- `refreshToken()` - Refresh access token
- `logout()` - Logout and clear tokens
- `encryptPassword(password)` - Encrypt password with RSA

### 2. Device Service (10 endpoints)

- `getDeviceList(params)` - List devices with pagination
- `getDeviceEnergy(params)` - Get energy data
- `getDeviceBasicInfo(deviceSn)` - Get device info
- `getDeviceHistory(deviceSn, params)` - Get historical data
- `getBatchDeviceHistory(params)` - Batch historical query
- `getDeviceEvents(deviceSn, params)` - Get events/alarms
- `addDevices(request)` - Add new devices
- `deleteDevices(deviceSns)` - Delete devices
- `getDeviceSettings(deviceSn)` - Get device settings
- `setDeviceSettings(request)` - Update device settings

**Helper Methods:**
- `getAllDevices()` - Auto-pagination
- `deviceExists(deviceSn)` - Check if device exists
- `searchDevices(query)` - Search by name/SN

### 3. Template Service (5 endpoints)

- `listTemplates(request)` - List templates
- `addTemplate(request)` - Create template
- `getTemplate(id)` - Get template details
- `updateTemplate(id, request)` - Update template
- `deleteTemplate(id)` - Delete template

**Helper Methods:**
- `createEmptySlot()` - Create empty strategy slot
- `createActiveSlot(start, end, mode, power)` - Create active slot
- `getAllTemplates()` - Auto-pagination
- `searchTemplates(name)` - Search by name

### 4. Task Service (6 endpoints)

- `listTasks(request)` - List tasks
- `addTask(request)` - Create task
- `updateTask(id, request)` - Update task
- `deleteTask(id)` - Delete task
- `runTask(request)` - Run task
- `getTaskDetail(taskId)` - Get task devices

**Helper Methods:**
- `runTaskNormal(taskId)` - Run task normally
- `resendFailedTask(taskId, recordId)` - Resend failed
- `getAllTasks()` - Auto-pagination
- `getTasksByStatus(status)` - Filter by status

### 5. Monitor Service (1 endpoint + utilities)

- `getTaskRuntimeDetail(request)` - Get real-time status
- `createMonitor(recordId, taskId)` - Create monitor instance
- `monitorTaskUntilComplete(recordId, taskId, options)` - Promise-based monitoring

**Monitor Class:**
```typescript
const monitor = new TaskMonitor(runTaskRecordId, taskId);
monitor.start(onUpdate, onComplete, onError);
monitor.stop();
```

**Helper Methods:**
- `getProgressPercentage(status)` - Calculate progress
- `getSuccessfulDevices(status)` - Get successful device SNs
- `getFailedDevices(status)` - Get failed device SNs
- `formatRemainingTime(status)` - Format time string
- `getTaskSummary(status)` - Get summary object

### 6. Record Service (2 endpoints)

- `listRunRecords(request)` - List run records
- `getRunRecordDetail(id)` - Get record details

**Helper Methods:**
- `getAllRunRecords()` - Auto-pagination
- `getTaskRunRecords(taskId)` - Records for task
- `getCompletedRunRecords()` - Completed only
- `getFailedRunRecords()` - Failed only
- `getRecordSummary(record)` - Get summary
- `exportToCSV(records)` - Export to CSV

## 🛠️ Utility Functions

```typescript
import {
  toFsolarDate,
  toFsolarTimestamp,
  fromFsolarTimestamp,
  getTodayFsolarDate,
  getLastNDaysRange,
  validateDeviceSn,
  validateDateRange,
  validatePagination,
  retryWithBackoff,
  shouldRetryError,
  APICache,
} from '@/service/fsolar';
```

### Date Utilities

```typescript
const today = toFsolarDate(new Date()); // "20250127"
const timestamp = toFsolarTimestamp(new Date()); // 1706356800000
const date = fromFsolarTimestamp(1706356800000); // Date object
const { start, end } = getLastNDaysRange(7); // Last 7 days range
```

### Validation

```typescript
validateDeviceSn('DEV001'); // Throws if invalid
validateDateRange(startTime, endTime, 7); // Max 7 days
validatePagination(1, 20); // Valid page params
```

### Caching

```typescript
const cache = new APICache<Device[]>(300000); // 5 min TTL
cache.set('devices', devices);
const cached = cache.get('devices');
```

### Retry Logic

```typescript
const result = await retryWithBackoff(
  async () => await fsolarDeviceService.getDeviceList({ pageNum: 1, pageSize: 20 }),
  {
    maxRetries: 3,
    retryDelay: 1000,
    retryOn: shouldRetryError, // Retry on "Server busy"
  }
);
```

### Constants

```typescript
import {
  TASK_STATUS,
  COMMAND_STATUS,
  RUN_TYPE,
  TIME_DIMENSION,
  ALARM_LEVEL,
} from '@/service/fsolar';

// Usage
if (status.taskStatus === TASK_STATUS.DONE) { ... }
if (device.commandStatus === COMMAND_STATUS.SUCCESS) { ... }
```

## 📖 Examples

See [examples.ts](./examples.ts) for comprehensive usage examples including:

- Authentication checking
- Device management (CRUD)
- Energy data queries
- Template creation and management
- Task execution and monitoring
- Run record analysis
- Complete workflows

## 🎯 Common Patterns

### Pattern 1: List with Pagination

```typescript
const result = await fsolarDeviceService.getDeviceList({
  pageNum: 1,
  pageSize: 20,
  deviceSn: 'DEV001', // Optional filter
});

console.log(`Total: ${result.total}, Page: ${result.currentPage}/${result.totalPage}`);
result.dataList.forEach(device => console.log(device));
```

### Pattern 2: Get All Items (Auto-pagination)

```typescript
// Instead of manual pagination, use helper methods
const allDevices = await fsolarDeviceService.getAllDevices();
const allTemplates = await fsolarTemplateService.getAllTemplates();
const allTasks = await fsolarTaskService.getAllTasks();
```

### Pattern 3: Run Task with Monitoring

```typescript
async function runTaskWithProgress(taskId: number) {
  // Start task
  const runResult = await fsolarTaskService.runTaskNormal(taskId);

  // Monitor with callbacks
  const monitor = fsolarMonitorService.createMonitor(
    parseInt(runResult.runTaskRecordId),
    taskId
  );

  monitor.start(
    (status) => {
      // Update UI every 5 seconds
      updateProgressBar(fsolarMonitorService.getProgressPercentage(status));
    },
    (status) => {
      // Task completed
      const summary = fsolarMonitorService.getTaskSummary(status);
      showSuccess(`Completed: ${summary.success}/${summary.total} devices`);
    },
    (error) => {
      showError('Task failed: ' + error.message);
    }
  );
}
```

### Pattern 4: Error Handling

```typescript
try {
  const devices = await fsolarDeviceService.getDeviceList({ pageNum: 1, pageSize: 20 });
} catch (error: any) {
  const message = error?.response?.data?.message || error?.message;

  if (message === 'Server busy') {
    // Retry after delay
    setTimeout(() => retryRequest(), 3000);
  } else if (error?.response?.status === 401) {
    // Authentication issue
    showError('Authentication failed');
  } else {
    // Generic error
    showError(message);
  }
}
```

## 🔧 Configuration

### Base URL

The base URL is configured in the backend proxy:
- Development: `http://localhost:3000/api/api/fsolar`
- Production: `https://your-domain.com/api/api/fsolar`

### Axios Instance

All services use the shared `apiClient` from `@/service/api-client.ts` which includes:
- Automatic token management
- Request/response interceptors
- Error handling
- Credentials support

## 📝 Type Safety

All services are fully typed with TypeScript:

```typescript
import type {
  Device,
  DeviceListParams,
  EconomicStrategyTemplate,
  EconomicTask,
  TaskRuntimeDetail,
  TaskRunRecord,
} from '@/types/fsolar';
```

## 🎨 Integration with UI

### React Hook Example

```typescript
import { useState, useEffect } from 'react';
import { fsolarDeviceService } from '@/service/fsolar';

function useDevices(pageNum: number, pageSize: number) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDevices() {
      try {
        setLoading(true);
        const result = await fsolarDeviceService.getDeviceList({ pageNum, pageSize });
        setDevices(result.dataList);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDevices();
  }, [pageNum, pageSize]);

  return { devices, loading, error };
}
```

## 📊 Backend Documentation

For complete API documentation including:
- Request/response formats
- Error codes and messages
- Use cases and best practices
- Common error handling

See: [docs/fsolar/FSOLAR_FRONTEND_INTEGRATION_GUIDE.md](../../../docs/fsolar/FSOLAR_FRONTEND_INTEGRATION_GUIDE.md)

## 🧪 Testing

To test the integration:

1. Ensure backend is running on `http://localhost:3000`
2. Check authentication status:
   ```typescript
   const status = await fsolarAuthService.getAuthStatus();
   ```
3. Run example functions from `examples.ts`
4. Monitor network tab in browser DevTools

## ❓ Troubleshooting

### "Authentication failed"
- Check backend Fsolar credentials configuration
- Verify backend is running
- Check auth status endpoint

### "Server busy"
- Fsolar API is temporarily overloaded
- Implement retry logic with delay
- Use `retryWithBackoff` utility

### "Device does not exist"
- Verify device SN is correct
- Check device exists with `deviceExists()`

### TypeScript errors
- Run `npx tsc --noEmit` to check types
- Ensure all types are imported correctly
- Check for version mismatches

## 📞 Support

For issues or questions:
1. Check backend logs at `/tmp/nest-server.log`
2. Test endpoint with curl/Postman first
3. Review the integration guide documentation
4. Contact Fsolar support for API-specific issues
