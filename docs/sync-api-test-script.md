# Manual Sync API Testing Script

## Using Browser Developer Tools

### 1. Open Developer Console
- Navigate to your application
- Open Developer Tools (F12)
- Go to Console tab

### 2. Test Available Sync APIs

```javascript
// Test Realtime Sync
fetch('/api/hopecloud/sync/realtime', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
})
.then(response => response.json())
.then(data => console.log('Realtime Sync Result:', data))
.catch(error => console.error('Realtime Sync Error:', error));

// Test Daily Sync
fetch('/api/hopecloud/sync/daily', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
})
.then(response => response.json())
.then(data => console.log('Daily Sync Result:', data))
.catch(error => console.error('Daily Sync Error:', error));

// Test Monthly Sync
fetch('/api/hopecloud/sync/monthly', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
})
.then(response => response.json())
.then(data => console.log('Monthly Sync Result:', data))
.catch(error => console.error('Monthly Sync Error:', error));

// Test Sites Sync
fetch('/api/hopecloud/sync/sites', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
})
.then(response => response.json())
.then(data => console.log('Sites Sync Result:', data))
.catch(error => console.error('Sites Sync Error:', error));

// Test Devices Sync
fetch('/api/hopecloud/sync/devices', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
})
.then(response => response.json())
.then(data => console.log('Devices Sync Result:', data))
.catch(error => console.error('Devices Sync Error:', error));
```

### 3. Test Database APIs

```javascript
// Test Site KPIs
fetch('/api/site-kpis', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
})
.then(response => response.json())
.then(data => console.log('Site KPIs Result:', data))
.catch(error => console.error('Site KPIs Error:', error));

// Test Device Alarms
fetch('/api/device-alarms', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
})
.then(response => response.json())
.then(data => console.log('Device Alarms Result:', data))
.catch(error => console.error('Device Alarms Error:', error));
```

### 4. Test Missing APIs (Expected to Fail)

```javascript
// Test Yearly Sync (Expected to fail - 404)
fetch('/api/hopecloud/sync/yearly', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
})
.then(response => response.json())
.then(data => console.log('Yearly Sync Result:', data))
.catch(error => console.error('Yearly Sync Error (Expected):', error));

// Test Alarm Sync (Expected to fail - 404)
fetch('/api/hopecloud/sync/alarms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
})
.then(response => response.json())
.then(data => console.log('Alarm Sync Result:', data))
.catch(error => console.error('Alarm Sync Error (Expected):', error));

// Test Historical Sync (Expected to fail - 404)
fetch('/api/hopecloud/sync/historical', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  },
  body: JSON.stringify({
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    siteIds: [1, 2],
    dataTypes: ['power', 'energy']
  })
})
.then(response => response.json())
.then(data => console.log('Historical Sync Result:', data))
.catch(error => console.error('Historical Sync Error (Expected):', error));
```

## Using Application Service Methods

### Open Browser Console and Run:

```javascript
// Access the HopeCloud service through window (if exposed) or through React DevTools
// This assumes you have access to the service instance

// Test through service methods
const testSyncAPIs = async () => {
  try {
    // Test Realtime Sync
    console.log('Testing Realtime Sync...');
    const realtimeResult = await hopeCloudService.triggerRealtimeSync();
    console.log('Realtime Sync:', realtimeResult);

    // Test Daily Sync
    console.log('Testing Daily Sync...');
    const dailyResult = await hopeCloudService.triggerDailySync();
    console.log('Daily Sync:', dailyResult);

    // Test Monthly Sync
    console.log('Testing Monthly Sync...');
    const monthlyResult = await hopeCloudService.triggerMonthlySync();
    console.log('Monthly Sync:', monthlyResult);

    // Test Site Sync
    console.log('Testing Site Sync...');
    const siteResult = await hopeCloudService.triggerSiteSync();
    console.log('Site Sync:', siteResult);

    // Test Device Sync
    console.log('Testing Device Sync...');
    const deviceResult = await hopeCloudService.triggerDeviceSync();
    console.log('Device Sync:', deviceResult);

  } catch (error) {
    console.error('Sync API Test Error:', error);
  }
};

// Run the test
testSyncAPIs();
```

## Using Postman/Insomnia

### 1. Collection Setup
Create a new collection with the following requests:

#### Realtime Sync
- **Method**: POST
- **URL**: `{{baseUrl}}/hopecloud/sync/realtime`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`

#### Daily Sync
- **Method**: POST
- **URL**: `{{baseUrl}}/hopecloud/sync/daily`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`

#### Monthly Sync
- **Method**: POST
- **URL**: `{{baseUrl}}/hopecloud/sync/monthly`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`

#### Sites Sync
- **Method**: POST
- **URL**: `{{baseUrl}}/hopecloud/sync/sites`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`

#### Devices Sync
- **Method**: POST
- **URL**: `{{baseUrl}}/hopecloud/sync/devices`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`

### 2. Environment Variables
Set up environment variables:
- `baseUrl`: Your API base URL (e.g., `http://localhost:3000/api`)
- `token`: Your authentication token

## Expected Responses

### Success Response Format:
```json
{
  "status": "success",
  "message": "Sync operation completed successfully",
  "data": {
    "syncId": "uuid",
    "recordsProcessed": 100,
    "duration": "5.2s",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Response Format:
```json
{
  "status": "error",
  "message": "Sync operation failed",
  "error": {
    "code": "SYNC_ERROR",
    "details": "Connection timeout to HopeCloud API"
  }
}
```

## Monitoring and Logging

After running tests, check:
1. **Server Logs**: Look for sync operation logs
2. **Database**: Check if data was actually synced
3. **Performance**: Monitor sync duration and resource usage
4. **Error Rates**: Track failed sync attempts

## Troubleshooting

### Common Issues:
1. **401 Unauthorized**: Check authentication token
2. **404 Not Found**: API endpoint doesn't exist (expected for missing APIs)
3. **500 Internal Server Error**: Backend service issue
4. **Timeout**: Sync operation taking too long

### Debug Steps:
1. Verify API endpoint URLs in browser network tab
2. Check request headers and authentication
3. Validate response status codes
4. Review server logs for detailed error messages