# Manual Testing Checklist for Sync APIs

## Application Setup
- ✅ Development server running at: `http://localhost:5175/`
- ✅ Admin panel accessible at: `http://localhost:5175/admin`
- ✅ HopeCloud management page at: `http://localhost:5175/admin/hopecloud`

## Manual Testing Steps

### 1. Access Application
1. Open browser and navigate to `http://localhost:5175/`
2. Login to admin panel
3. Navigate to HopeCloud section

### 2. Open Developer Console
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Go to Network tab to monitor API calls

### 3. Test Available Sync APIs

#### Test Script to Run in Console:
```javascript
// Helper function to test sync APIs
const testSyncAPI = async (endpoint, name) => {
  try {
    console.log(`Testing ${name}...`);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Token will be automatically included if you're logged in
      }
    });

    const data = await response.json();
    console.log(`✅ ${name} Response:`, data);
    return data;
  } catch (error) {
    console.error(`❌ ${name} Error:`, error);
    return null;
  }
};

// Test all available sync APIs
const testAllSyncAPIs = async () => {
  console.log('🚀 Starting Sync API Tests...');

  await testSyncAPI('/api/hopecloud/sync/realtime', 'Realtime Sync');
  await testSyncAPI('/api/hopecloud/sync/daily', 'Daily Sync');
  await testSyncAPI('/api/hopecloud/sync/monthly', 'Monthly Sync');
  await testSyncAPI('/api/hopecloud/sync/sites', 'Sites Sync');
  await testSyncAPI('/api/hopecloud/sync/devices', 'Devices Sync');

  console.log('🏁 Sync API Tests Complete');
};

// Run the tests
testAllSyncAPIs();
```

### 4. Test Database APIs

#### Test Script for Database APIs:
```javascript
// Test database APIs
const testDatabaseAPIs = async () => {
  console.log('🚀 Starting Database API Tests...');

  // Test Site KPIs
  try {
    console.log('Testing Site KPIs...');
    const kpisResponse = await fetch('/api/site-kpis');
    const kpisData = await kpisResponse.json();
    console.log('✅ Site KPIs Response:', kpisData);
  } catch (error) {
    console.error('❌ Site KPIs Error:', error);
  }

  // Test Device Alarms
  try {
    console.log('Testing Device Alarms...');
    const alarmsResponse = await fetch('/api/device-alarms');
    const alarmsData = await alarmsResponse.json();
    console.log('✅ Device Alarms Response:', alarmsData);
  } catch (error) {
    console.error('❌ Device Alarms Error:', error);
  }

  console.log('🏁 Database API Tests Complete');
};

// Run database tests
testDatabaseAPIs();
```

### 5. Test Missing APIs (Expected to Fail)

#### Test Script for Missing APIs:
```javascript
// Test missing APIs (should return 404)
const testMissingAPIs = async () => {
  console.log('🚀 Testing Missing APIs (Expected Failures)...');

  const missingAPIs = [
    { endpoint: '/api/hopecloud/sync/yearly', name: 'Yearly Sync' },
    { endpoint: '/api/hopecloud/sync/alarms', name: 'Alarm Sync' },
    { endpoint: '/api/hopecloud/sync/historical', name: 'Historical Sync' },
    { endpoint: '/api/hopecloud/sync/equipment', name: 'Equipment Sync' }
  ];

  for (const api of missingAPIs) {
    try {
      console.log(`Testing ${api.name} (Expected 404)...`);
      const response = await fetch(api.endpoint, { method: 'POST' });

      if (response.status === 404) {
        console.log(`✅ ${api.name}: 404 Not Found (Expected)`);
      } else {
        console.log(`⚠️ ${api.name}: Unexpected status ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ ${api.name} Error:`, error);
    }
  }

  console.log('🏁 Missing API Tests Complete');
};

// Run missing API tests
testMissingAPIs();
```

## Network Tab Monitoring

### What to Look For:
1. **Status Codes**:
   - `200`: Success
   - `404`: Not Found (expected for missing APIs)
   - `401`: Unauthorized
   - `500`: Server Error

2. **Response Times**: Monitor how long sync operations take

3. **Request/Response Payloads**: Check data being sent/received

## Expected Results

### Working APIs Should Return:
```json
{
  "status": "success",
  "message": "Sync completed",
  "data": { /* sync results */ }
}
```

### Missing APIs Should Return:
```json
{
  "status": "error",
  "message": "Not Found",
  "statusCode": 404
}
```

## Manual UI Testing

### Test Through HopeCloud Interface:
1. Navigate to HopeCloud management page
2. Look for any sync buttons or triggers
3. Click sync buttons and monitor console/network
4. Check if UI shows sync status or progress

## Documentation of Findings

### Create Test Results Log:
```javascript
// Log test results
const logTestResults = (results) => {
  console.log('📊 TEST RESULTS SUMMARY:');
  console.log('========================');

  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.message}`);
  });

  console.log('========================');
};
```

## Action Items After Testing

### Based on Test Results:
1. **Document Working APIs**: List which sync endpoints are functional
2. **Identify Issues**: Note any APIs returning errors
3. **Report Missing APIs**: Create list of needed endpoints for backend team
4. **Performance Analysis**: Note any slow-responding endpoints
5. **Error Handling**: Document error response formats

## Next Steps

After manual testing:
1. Update documentation with actual test results
2. Create issue tickets for missing APIs
3. Implement UI components for sync triggers
4. Add error handling for sync operations
5. Set up automated testing for sync APIs

## Testing Checklist

- [ ] All available sync APIs tested
- [ ] Database APIs tested
- [ ] Missing APIs confirmed as 404
- [ ] Response formats documented
- [ ] Performance metrics noted
- [ ] Error cases documented
- [ ] UI sync triggers tested
- [ ] Network traffic analyzed