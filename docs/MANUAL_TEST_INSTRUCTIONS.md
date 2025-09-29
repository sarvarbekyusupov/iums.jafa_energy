# Manual Testing Instructions - Quick Start

## ✅ APIs Added to Codebase
I've successfully added all missing sync APIs:
- `triggerYearlySync()`
- `triggerAlarmSync()`
- `triggerHistoricalSync(config)`
- `triggerEquipmentSync()`

## 🚀 Quick Manual Test (2 minutes)

### Step 1: Open Application
1. Go to: `http://localhost:5175/admin/hopecloud`
2. Login if needed

### Step 2: Open Developer Console
1. Press `F12`
2. Go to `Console` tab

### Step 3: Run Test Script
1. Copy the entire content from `docs/browser-test-script.js`
2. Paste it into the console
3. Press `Enter`

### Step 4: Watch Results
The script will automatically test:
- ✅ **9 Sync APIs** (5 existing + 4 newly added)
- ✅ **2 Database APIs** (Site KPIs + Device Alarms)
- ✅ **Service Methods** (if available)

## Expected Results

### What Should Work:
- Original sync APIs (realtime, daily, monthly, sites, devices)
- Database APIs (site-kpis, device-alarms)

### What Will Return 404 (Expected):
- New sync APIs (yearly, alarms, historical, equipment) - Backend not implemented yet

## Sample Output:
```
🚀 Starting HopeCloud Sync API Tests...

✅ Realtime Sync - SUCCESS: {status: "success", ...}
⚠️ Yearly Sync - HTTP 404: {message: "Not Found"}
✅ Site KPIs - SUCCESS: [...]

📋 TEST RESULTS SUMMARY
Success Rate: 7/11 (63.6%)
```

## Quick Individual Tests:
After running the main script, you can test individual APIs:
```javascript
// Test specific API
testSyncAPI('/api/hopecloud/sync/yearly', 'Yearly Sync');

// Test with config
testSyncAPI('/api/hopecloud/sync/historical', 'Historical Sync', {
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});
```

## What This Confirms:
1. ✅ Frontend code correctly calls sync APIs
2. ✅ API URLs are properly configured
3. ✅ Missing APIs return expected 404s
4. ✅ Database APIs are functional
5. ✅ Error handling works correctly

## Next Steps After Testing:
1. Document which APIs returned 404 (need backend implementation)
2. Report any unexpected errors
3. Confirm working APIs for future UI integration