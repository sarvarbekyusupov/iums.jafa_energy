// HopeCloud Sync APIs Manual Test Script
// Copy and paste this into your browser console at http://localhost:5175/admin/hopecloud

console.log('🚀 Starting HopeCloud Sync API Tests...');

// Helper function to test sync APIs
const testSyncAPI = async (endpoint, name, body = null) => {
  try {
    console.log(`\n🔄 Testing ${name}...`);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(endpoint, options);
    const data = await response.json();

    if (response.ok) {
      console.log(`✅ ${name} - SUCCESS:`, data);
    } else {
      console.log(`⚠️ ${name} - HTTP ${response.status}:`, data);
    }

    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.error(`❌ ${name} - ERROR:`, error);
    return { success: false, error: error.message };
  }
};

// Test function for all sync APIs
const testAllSyncAPIs = async () => {
  const results = [];

  // Test existing sync APIs
  results.push(await testSyncAPI('/api/hopecloud/sync/realtime', 'Realtime Sync'));
  results.push(await testSyncAPI('/api/hopecloud/sync/daily', 'Daily Sync'));
  results.push(await testSyncAPI('/api/hopecloud/sync/monthly', 'Monthly Sync'));
  results.push(await testSyncAPI('/api/hopecloud/sync/sites', 'Sites Sync'));
  results.push(await testSyncAPI('/api/hopecloud/sync/devices', 'Devices Sync'));

  // Test newly added sync APIs
  results.push(await testSyncAPI('/api/hopecloud/sync/yearly', 'Yearly Sync'));
  results.push(await testSyncAPI('/api/hopecloud/sync/alarms', 'Alarm Sync'));
  results.push(await testSyncAPI('/api/hopecloud/sync/equipment', 'Equipment Sync'));

  // Test historical sync with config
  const historicalConfig = {
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    siteIds: [1, 2],
    dataTypes: ['power', 'energy'],
    maxDaysPerBatch: 7
  };
  results.push(await testSyncAPI('/api/hopecloud/sync/historical', 'Historical Sync', historicalConfig));

  return results;
};

// Test database APIs
const testDatabaseAPIs = async () => {
  console.log('\n📊 Testing Database APIs...');

  const dbResults = [];

  // Test Site KPIs
  try {
    console.log('\n🔄 Testing Site KPIs...');
    const kpisResponse = await fetch('/api/site-kpis');
    const kpisData = await kpisResponse.json();

    if (kpisResponse.ok) {
      console.log('✅ Site KPIs - SUCCESS:', kpisData);
      dbResults.push({ name: 'Site KPIs', success: true, data: kpisData });
    } else {
      console.log(`⚠️ Site KPIs - HTTP ${kpisResponse.status}:`, kpisData);
      dbResults.push({ name: 'Site KPIs', success: false, status: kpisResponse.status });
    }
  } catch (error) {
    console.error('❌ Site KPIs - ERROR:', error);
    dbResults.push({ name: 'Site KPIs', success: false, error: error.message });
  }

  // Test Device Alarms
  try {
    console.log('\n🔄 Testing Device Alarms...');
    const alarmsResponse = await fetch('/api/device-alarms');
    const alarmsData = await alarmsResponse.json();

    if (alarmsResponse.ok) {
      console.log('✅ Device Alarms - SUCCESS:', alarmsData);
      dbResults.push({ name: 'Device Alarms', success: true, data: alarmsData });
    } else {
      console.log(`⚠️ Device Alarms - HTTP ${alarmsResponse.status}:`, alarmsData);
      dbResults.push({ name: 'Device Alarms', success: false, status: alarmsResponse.status });
    }
  } catch (error) {
    console.error('❌ Device Alarms - ERROR:', error);
    dbResults.push({ name: 'Device Alarms', success: false, error: error.message });
  }

  return dbResults;
};

// Test using service methods (if available in browser)
const testServiceMethods = async () => {
  console.log('\n🔧 Testing Service Methods...');

  // Check if hopeCloudService is available globally
  if (typeof hopeCloudService !== 'undefined') {
    try {
      console.log('\n🔄 Testing triggerRealtimeSync via service...');
      const result = await hopeCloudService.triggerRealtimeSync();
      console.log('✅ Service Method - SUCCESS:', result);
    } catch (error) {
      console.error('❌ Service Method - ERROR:', error);
    }
  } else {
    console.log('⚠️ hopeCloudService not available in global scope');
    console.log('💡 Try accessing it through React DevTools or component scope');
  }
};

// Generate summary report
const generateReport = (syncResults, dbResults) => {
  console.log('\n📋 TEST RESULTS SUMMARY');
  console.log('========================');

  const allResults = [...syncResults, ...dbResults];
  const successful = allResults.filter(r => r.success).length;
  const total = allResults.length;

  console.log(`Success Rate: ${successful}/${total} (${((successful/total)*100).toFixed(1)}%)`);
  console.log('\nDetailed Results:');

  syncResults.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const info = result.success ? 'SUCCESS' : `${result.status || 'ERROR'}`;
    console.log(`${status} ${result.name || 'Unknown'}: ${info}`);
  });

  dbResults.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const info = result.success ? 'SUCCESS' : `${result.status || 'ERROR'}`;
    console.log(`${status} ${result.name}: ${info}`);
  });

  console.log('\n📝 Notes:');
  console.log('- 404 errors are expected for APIs not implemented by backend');
  console.log('- 401 errors indicate authentication issues');
  console.log('- 500 errors indicate server-side problems');
  console.log('- Network errors indicate connectivity issues');

  return { successful, total, results: allResults };
};

// Main test function
const runAllTests = async () => {
  console.log('🎯 Running Complete API Test Suite...');
  console.log('====================================');

  const syncResults = await testAllSyncAPIs();
  const dbResults = await testDatabaseAPIs();
  await testServiceMethods();

  const report = generateReport(syncResults, dbResults);

  console.log('\n🏁 All tests completed!');
  console.log('Copy the results above to document your findings.');

  return report;
};

// Auto-run tests
runAllTests();

// Also expose individual test functions for manual testing
window.testSyncAPI = testSyncAPI;
window.testAllSyncAPIs = testAllSyncAPIs;
window.testDatabaseAPIs = testDatabaseAPIs;
window.runAllTests = runAllTests;

console.log('\n💡 Individual test functions are now available:');
console.log('- testSyncAPI(endpoint, name, body)');
console.log('- testAllSyncAPIs()');
console.log('- testDatabaseAPIs()');
console.log('- runAllTests()');