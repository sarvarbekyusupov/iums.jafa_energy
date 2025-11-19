# SolisCloud API Endpoints Reference

**Base URL:** `http://localhost:3000/api/api/soliscloud/db`

**Total Endpoints:** 25

---

## 📦 Inverter Endpoints

### 1. Get All Inverters
```
GET /inverters?page=1&limit=20&stationId={optional}
```

**Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `stationId` (optional): Filter by station

**Example:**
```bash
curl "http://localhost:3000/api/api/soliscloud/db/inverters?page=1&limit=20"
```

---

### 2. Get Single Inverter
```
GET /inverters/:id
```

**Example:**
```bash
curl "http://localhost:3000/api/api/soliscloud/db/inverters/1308675217949369598"
```

---

### 3. Get Inverter Daily Readings
```
GET /inverters/:id/readings?startDate={YYYY-MM-DD}&endDate={YYYY-MM-DD}&limit=100
```

**Parameters:**
- `startDate` (optional): Start date
- `endDate` (optional): End date
- `limit` (optional): Max results (default: 100)

**Example:**
```bash
curl "http://localhost:3000/api/api/soliscloud/db/inverters/1308675217949369598/readings?startDate=2025-11-01&endDate=2025-11-11"
```

---

### 4. Get Latest Inverter Reading
```
GET /inverters/:id/latest-reading
```

**Example:**
```bash
curl "http://localhost:3000/api/api/soliscloud/db/inverters/1308675217949369598/latest-reading"
```

---

### 5. Get Inverter Monthly Data ✨
```
GET /inverters/:id/months?limit=12
```

**Parameters:**
- `limit` (optional): Number of months (default: 12)

**Example:**
```bash
curl "http://localhost:3000/api/api/soliscloud/db/inverters/1308675217949369598/months?limit=12"
```

---

### 6. Get Inverter Yearly Data ✨
```
GET /inverters/:id/years?limit=10
```

**Parameters:**
- `limit` (optional): Number of years (default: 10)

**Example:**
```bash
curl "http://localhost:3000/api/api/soliscloud/db/inverters/1308675217949369598/years?limit=10"
```

---

### 7. Get All Inverter Monthly Data ✨
```
GET /inverter-months?page=1&limit=20&inverterId={optional}
```

**Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `inverterId` (optional): Filter by inverter

**Example:**
```bash
curl "http://localhost:3000/api/api/soliscloud/db/inverter-months?page=1&limit=20"
```

---

### 8. Get All Inverter Yearly Data ✨
```
GET /inverter-years?page=1&limit=20&inverterId={optional}
```

**Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `inverterId` (optional): Filter by inverter

**Example:**
```bash
curl "http://localhost:3000/api/api/soliscloud/db/inverter-years?page=1&limit=20"
```

---

## 🏭 Station Endpoints

### 9. Get All Stations
```
GET /stations?page=1&limit=20
```

**Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

**Example:**
```bash
curl "http://localhost:3000/api/api/soliscloud/db/stations?page=1&limit=20"
```

---

### 10. Get Single Station
```
GET /stations/:id
```

**Example:**
```bash
curl "http://localhost:3000/api/api/soliscloud/db/stations/1298491919450325500"
```

---

### 11. Get Station Daily Readings
```
GET /stations/:id/readings?startDate={YYYY-MM-DD}&endDate={YYYY-MM-DD}&limit=100
```

**Parameters:**
- `startDate` (optional): Start date
- `endDate` (optional): End date
- `limit` (optional): Max results

**Example:**
```bash
curl "http://localhost:3000/api/api/soliscloud/db/stations/1298491919450325500/readings?startDate=2025-11-01&endDate=2025-11-11"
```

---

### 12. Get Latest Station Reading
```
GET /stations/:id/latest-reading
```

**Example:**
```bash
curl "http://localhost:3000/api/api/soliscloud/db/stations/1298491919450325500/latest-reading"
```

---

### 13. Get Station Monthly Data ✨
```
GET /stations/:id/months?limit=12
```

**Parameters:**
- `limit` (optional): Number of months (default: 12)

**Example:**
```bash
curl "http://localhost:3000/api/api/soliscloud/db/stations/1298491919450325500/months?limit=12"
```

---

### 14. Get Station Yearly Data ✨
```
GET /stations/:id/years?limit=10
```

**Parameters:**
- `limit` (optional): Number of years (default: 10)

**Example:**
```bash
curl "http://localhost:3000/api/api/soliscloud/db/stations/1298491919450325500/years?limit=10"
```

---

### 15. Get All Station Monthly Data ✨
```
GET /station-months?page=1&limit=20&stationId={optional}
```

**Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `stationId` (optional): Filter by station

**Example:**
```bash
curl "http://localhost:3000/api/api/soliscloud/db/station-months?page=1&limit=20"
```

---

### 16. Get All Station Yearly Data ✨
```
GET /station-years?page=1&limit=20&stationId={optional}
```

**Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `stationId` (optional): Filter by station

**Example:**
```bash
curl "http://localhost:3000/api/api/soliscloud/db/station-years?page=1&limit=20"
```

---

## 📡 Collector Endpoints

### 17. Get All Collectors
```
GET /collectors?page=1&limit=20&stationId={optional}
```

**Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `stationId` (optional): Filter by station

**Example:**
```bash
curl "http://localhost:3000/api/api/soliscloud/db/collectors?page=1&limit=20"
```

---

### 18. Get Single Collector
```
GET /collectors/:id
```

**Example:**
```bash
curl "http://localhost:3000/api/api/soliscloud/db/collectors/1306858901391715773"
```

---

## 🚨 Alarm Endpoints

### 19. Get All Alarms
```
GET /alarms?page=1&limit=20&status={optional}&deviceId={optional}&stationId={optional}
```

**Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): active, resolved, acknowledged
- `deviceId` (optional): Filter by device
- `stationId` (optional): Filter by station

**Example:**
```bash
curl "http://localhost:3000/api/api/soliscloud/db/alarms?status=active&limit=50"
```

---

### 20. Get Active Alarms Only
```
GET /alarms/active
```

**Example:**
```bash
curl "http://localhost:3000/api/api/soliscloud/db/alarms/active"
```

---

## 🔄 Sync Management Endpoints

### 21. Get Sync Status
```
GET /sync/status
```

**Example:**
```bash
curl "http://localhost:3000/api/api/soliscloud/db/sync/status"
```

---

### 22. Get Sync History
```
GET /sync/history?page=1&limit=20&syncType={optional}&status={optional}
```

**Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `syncType` (optional): inverters, stations, alarms, etc.
- `status` (optional): success, failed, partial

**Example:**
```bash
curl "http://localhost:3000/api/api/soliscloud/db/sync/history?syncType=inverters&limit=50"
```

---

### 23. Trigger Manual Sync
```
POST /sync/trigger
Content-Type: application/json

{
  "types": ["inverters", "stations", "inverter_months", "inverter_years"],
  "date": "2025-11-12",
  "month": "2025-11",
  "year": "2025"
}
```

**Sync Types:**
- `inverters` - Inverter master data
- `stations` - Station master data
- `inverter_readings` - Daily inverter readings
- `station_readings` - Daily station readings
- `inverter_months` - Monthly inverter data
- `station_months` - Monthly station data
- `inverter_years` - Yearly inverter data
- `station_years` - Yearly station data
- `alarms` - Alarm data
- `collectors` - Collector data
- `full` - Full sync (all data types)

**Example:**
```bash
curl -X POST "http://localhost:3000/api/api/soliscloud/db/sync/trigger" \
  -H "Content-Type: application/json" \
  -d '{"types": ["inverters", "stations"]}'
```

**Example - Sync specific month:**
```bash
curl -X POST "http://localhost:3000/api/api/soliscloud/db/sync/trigger" \
  -H "Content-Type: application/json" \
  -d '{"types": ["inverter_months", "station_months"], "month": "2025-11"}'
```

**Example - Sync specific year:**
```bash
curl -X POST "http://localhost:3000/api/api/soliscloud/db/sync/trigger" \
  -H "Content-Type: application/json" \
  -d '{"types": ["inverter_years", "station_years"], "year": "2025"}'
```

---

## ✅ Validation Endpoints

### 24. Validate Inverter Data
```
GET /validate/inverter/:id
```

Compares database data with real-time API data.

**Example:**
```bash
curl "http://localhost:3000/api/api/soliscloud/db/validate/inverter/1308675217949369598"
```

---

### 25. Validate All Data
```
GET /validate/all
```

Runs complete validation across all synced data.

**Example:**
```bash
curl "http://localhost:3000/api/api/soliscloud/db/validate/all"
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "records": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

### Error Response
```json
{
  "message": "Error description",
  "error": "Error type",
  "statusCode": 500
}
```

---

## 🔍 Quick Reference Table

| Endpoint | Method | Purpose | New |
|----------|--------|---------|-----|
| `/inverters` | GET | List all inverters | |
| `/inverters/:id` | GET | Single inverter | |
| `/inverters/:id/readings` | GET | Daily readings | |
| `/inverters/:id/latest-reading` | GET | Latest reading | |
| `/inverters/:id/months` | GET | Monthly data | ✨ |
| `/inverters/:id/years` | GET | Yearly data | ✨ |
| `/inverter-months` | GET | All monthly data | ✨ |
| `/inverter-years` | GET | All yearly data | ✨ |
| `/stations` | GET | List all stations | |
| `/stations/:id` | GET | Single station | |
| `/stations/:id/readings` | GET | Daily readings | |
| `/stations/:id/latest-reading` | GET | Latest reading | |
| `/stations/:id/months` | GET | Monthly data | ✨ |
| `/stations/:id/years` | GET | Yearly data | ✨ |
| `/station-months` | GET | All monthly data | ✨ |
| `/station-years` | GET | All yearly data | ✨ |
| `/collectors` | GET | List all collectors | |
| `/collectors/:id` | GET | Single collector | |
| `/alarms` | GET | List all alarms | |
| `/alarms/active` | GET | Active alarms only | |
| `/sync/status` | GET | Sync status | |
| `/sync/history` | GET | Sync history | |
| `/sync/trigger` | POST | Trigger sync | |
| `/validate/inverter/:id` | GET | Validate inverter | |
| `/validate/all` | GET | Validate all | |

---

## 🚀 JavaScript Quick Start

```javascript
const BASE_URL = 'http://localhost:3000/api/api/soliscloud/db';

// Fetch inverters
fetch(`${BASE_URL}/inverters`)
  .then(res => res.json())
  .then(data => console.log(data));

// Fetch monthly data
fetch(`${BASE_URL}/inverters/1308675217949369598/months?limit=12`)
  .then(res => res.json())
  .then(data => console.log(data));

// Trigger sync
fetch(`${BASE_URL}/sync/trigger`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ types: ['inverters'] })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 📝 Notes

- ✨ = New endpoints added (8 total)
- All endpoints return JSON
- Pagination defaults: page=1, limit=20
- Timestamps in ISO 8601 format (UTC)
- Energy values in kWh
- Power values in kW
- Currency values with 2 decimal precision

---

**Last Updated:** November 12, 2025
