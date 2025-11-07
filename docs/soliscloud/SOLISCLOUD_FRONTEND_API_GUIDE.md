# SolisCloud API - Frontend Developer Guide

**Base URL:** `http://localhost:3000/api/api/soliscloud`
**Authentication:** Handled automatically by backend
**All Methods:** POST
**Content-Type:** `application/json`

---

## 📊 API Status Summary

- ✅ **Working APIs:** 28/30 read APIs (93%)
- ❌ **Not Available:** 2 APIs (SolisCloud server doesn't have these endpoints)
- ⚠️ **Use with Caution:** 5 management APIs (modify system data)

---

## 🔋 Section 1: Inverter APIs (9 endpoints)

### 3.1 Get Inverter List ✅
**Purpose:** Get paginated list of all inverters

```typescript
// Request
POST /api/api/soliscloud/inverters/list
{
  "pageNo": 1,              // Page number (starts from 1)
  "pageSize": 20,           // Items per page (max 100)
  "stationId"?: string,     // Optional: Filter by station
  "nmiCode"?: string        // Optional: Filter by NMI code
}

// Response
{
  "success": true,
  "code": "0",
  "msg": "success",
  "data": {
    "inverterStatusVo": {
      "all": 1,             // Total inverters
      "normal": 0,          // Online count
      "offline": 1,         // Offline count
      "fault": 0            // Faulty count
    },
    "page": {
      "total": 1,
      "size": 20,
      "current": 1,
      "pages": 1,
      "records": [
        {
          "id": "1308675217949369598",
          "sn": "1031730249200313",        // Serial number
          "stationName": "RES HUB",
          "state": 2,                      // 1=online, 2=offline, 3=alarm
          "pac": 0,                        // Current power (kW)
          "etoday": 27.8,                  // Today's energy (kWh)
          "etotal": 36.397,                // Total energy (MWh)
          "batteryCapacitySoc": 85         // Battery SOC %
        }
      ]
    }
  }
}
```

**Use Case:** Dashboard inverter list, status monitoring

---

### 3.2 Get Single Inverter Details ✅
**Purpose:** Get comprehensive details for one specific inverter

```typescript
// Request
POST /api/api/soliscloud/inverter/detail
{
  "id"?: string,      // Either ID or SN required
  "sn"?: string       // Inverter serial number
}

// Response
{
  "success": true,
  "code": "0",
  "msg": "success",
  "data": {
    "id": "1308675217949369598",
    "sn": "1031730249200313",
    "stationName": "RES HUB",
    "state": 2,                           // Device state
    "pac": 0,                             // Current power
    "eToday": 0,                          // Daily generation
    "eTotal": 36.397,                     // Total generation
    "inverterTemperature": 36.2,
    "inverterTemperatureUnit": "℃",
    "batteryCapacitySoc": 0,              // Battery %
    "batteryPower": 0,                    // Battery power
    "gridPurchasedTodayEnergy": 4.53,
    "gridSellTodayEnergy": 0,
    // ... 100+ additional parameters
  }
}
```

**Use Case:** Inverter detail page, real-time monitoring

---

### 3.3 Get Multiple Inverters Details ✅
**Purpose:** Get detailed information for multiple inverters at once

```typescript
// Request
POST /api/api/soliscloud/inverters/detail-list
{
  "pageNo": 1,
  "pageSize": 20,
  "stationId"?: string
}

// Response: Same structure as 3.2 but array of records
{
  "success": true,
  "code": "0",
  "data": {
    "records": [/* Array of inverter details */]
  }
}
```

**Use Case:** Bulk inverter monitoring, comparison views

---

### 3.4 Get Inverter Day Data ✅
**Purpose:** Get real-time data for a specific day (5-minute intervals)

```typescript
// Request
POST /api/api/soliscloud/inverter/day
{
  "id"?: string,
  "sn"?: string,
  "time": "2025-01-05"    // Format: yyyy-MM-dd
}

// Response
{
  "success": true,
  "code": "0",
  "data": [
    {
      "dataTimestamp": "1735977600000",
      "timeStr": "05:00:00",
      "pac": 0,                    // Power at this time
      "eToday": 0                  // Cumulative energy
    }
    // ... data points every 5 minutes
  ]
}
```

**Use Case:** Day charts, real-time graphs

---

### 3.5 Get Inverter Month Data ✅
**Purpose:** Get daily data for a specific month

```typescript
// Request
POST /api/api/soliscloud/inverter/month
{
  "id"?: string,
  "sn"?: string,
  "month": "2025-01"      // Format: yyyy-MM
}

// Response
{
  "success": true,
  "code": "0",
  "data": [
    {
      "date": "2025-01-01",
      "energy": 27.8,       // Daily generation (kWh)
      "income": 150.5       // Daily income
    }
    // ... one entry per day
  ]
}
```

**Use Case:** Monthly performance charts

---

### 3.6 Get Inverter Year Data ✅
**Purpose:** Get monthly data for a specific year

```typescript
// Request
POST /api/api/soliscloud/inverter/year
{
  "id"?: string,
  "sn"?: string,
  "year": "2025"          // Format: yyyy
}

// Response
{
  "success": true,
  "code": "0",
  "data": [
    {
      "dateStr": "2025-10",
      "energy": 0,
      "energyStr": "kWh",
      "batteryChargeEnergy": 3,
      "batteryDischargeEnergy": 1,
      "gridPurchasedEnergy": 4.53
    }
    // ... one entry per month
  ]
}
```

**Use Case:** Annual performance overview

---

### 3.7 Get Inverter All Years ❌ **NOT AVAILABLE**
**Status:** SolisCloud API endpoint doesn't exist on their server

---

### 3.8 Get Inverter Warranty Data ❌ **NOT AVAILABLE**
**Status:** SolisCloud API endpoint doesn't exist on their server

---

### 3.9 Get Device Alarm List ✅
**Purpose:** Get all alarms/warnings from devices

```typescript
// Request
POST /api/api/soliscloud/alarms/list
{
  "pageNo": 1,
  "pageSize": 20,
  "stationId"?: string,
  "inverterId"?: string
}

// Response
{
  "success": true,
  "code": "0",
  "data": {
    "records": [
      {
        "id": "-1",
        "stationName": "RES HUB",
        "alarmDeviceSn": "1031730249200313",
        "alarmType": 0,
        "alarmLevel": "2",            // 1=warning, 2=fault, 3=critical
        "alarmCode": "1015",
        "alarmMsg": "NO-Grid",
        "alarmBeginTime": 1761984407000,
        "alarmEndTime": 1762331350408,
        "state": "0",                 // 0=ongoing, 1=resolved
        "advice": "1. If it occurs occasionally..."
      }
    ]
  }
}
```

**Use Case:** Alarm dashboard, notifications

---

## 📡 Section 2: Collector APIs (3 endpoints)

### 3.10 Get Collector List ✅
**Purpose:** Get list of all data collectors

```typescript
// Request
POST /api/api/soliscloud/collectors/list
{
  "pageNo": 1,
  "pageSize": 20,
  "stationId"?: string
}

// Response
{
  "success": true,
  "code": "0",
  "data": {
    "page": {
      "total": 1,
      "records": [
        {
          "id": "1306858901391715773",
          "sn": "7A12451805204D5D",
          "stationName": "RES HUB",
          "state": 2,                  // 1=online, 2=offline
          "model": "WL"
        }
      ]
    }
  }
}
```

**Use Case:** Collector management, connectivity monitoring

---

### 3.11 Get Collector Details ✅
**Purpose:** Get detailed information for a specific collector

```typescript
// Request
POST /api/api/soliscloud/collector/detail
{
  "id"?: string,
  "sn"?: string
}

// Response: Detailed collector info including firmware, connection status
```

---

### 3.12 Get Collector Signal Values ✅
**Purpose:** Get signal strength data for a specific day

```typescript
// Request
POST /api/api/soliscloud/collector/day
{
  "sn": "7A12451805204D5D",
  "time": "2025-01-05",
  "timeZone": 8               // Required: timezone offset
}

// Response
{
  "success": true,
  "code": "0",
  "data": [
    {
      "timeStr": "05:03:07",
      "rssi": 0,                // Signal strength value
      "rssiLevel": 0,           // Signal level (0-5)
      "pec": 0                  // Signal percentage
    }
  ]
}
```

**Use Case:** Network diagnostics, connectivity troubleshooting

---

## ⚡ Section 3: EPM (Energy Power Meter) APIs (4 endpoints)

### 3.13 Get EPM List ✅
**Purpose:** Get list of all EPM devices

```typescript
// Request
POST /api/api/soliscloud/epm/list
{
  "pageNo": 1,
  "pageSize": 20,
  "stationId"?: string
}

// Response
{
  "success": true,
  "code": "0",
  "data": {
    "page": {
      "total": 0,
      "records": []
    }
  }
}
```

---

### 3.14 Get EPM Details ✅
```typescript
POST /api/api/soliscloud/epm/detail
{
  "id"?: string,
  "sn"?: string
}
```

---

### 3.15 Get EPM Day Data ✅
```typescript
POST /api/api/soliscloud/epm/day
{
  "id"?: string,
  "sn"?: string,
  "time": "2025-01-05"
}
```

---

### 3.16 Get EPM Month Data ✅
```typescript
POST /api/api/soliscloud/epm/month
{
  "id"?: string,
  "sn"?: string,
  "month": "2025-01"
}
```

**Use Case:** Energy consumption tracking, grid monitoring

---

## 🌤️ Section 4: Weather Station APIs (2 endpoints)

### 3.19 Get Weather Station List ✅
**Purpose:** Get list of all weather stations

```typescript
// Request
POST /api/api/soliscloud/weather/list
{
  "pageNo": 1,
  "pageSize": 20,
  "stationId"?: string
}

// Response
{
  "success": true,
  "code": "0",
  "data": {
    "page": {
      "total": 0,
      "records": []
    }
  }
}
```

---

### 3.20 Get Weather Station Details ✅
**Purpose:** Get weather data from a specific station

```typescript
// Request
POST /api/api/soliscloud/weather/detail
{
  "sn": string      // Weather station SN
}

// Response: Temperature, humidity, radiation, wind speed, etc.
```

**Use Case:** Environmental monitoring, performance correlation

---

## 🏭 Section 5: Station/Plant APIs (15 endpoints)

### 4.1 Get Station List ✅
**Purpose:** Get all power stations under account

```typescript
// Request
POST /api/api/soliscloud/stations/list
{
  "pageNo": 1,
  "pageSize": 20
}

// Response
{
  "success": true,
  "code": "0",
  "data": {
    "page": {
      "total": 1,
      "records": [
        {
          "id": "1298491919450325500",
          "stationName": "RES HUB",
          "stationCode": "RESHUB001",
          "type": 0,                    // Station type
          "state": 1,                   // 1=normal, 2=alarm
          "capacity": 6,                // Installed capacity (kWp)
          "eToday": 0,                  // Today's generation
          "eTotal": 36.397,             // Total generation
          "pac": 0                      // Current power
        }
      ]
    }
  }
}
```

**Use Case:** Station selection dropdown, overview dashboard

---

### 4.2 Get Station Details ✅
**Purpose:** Get comprehensive details for one station

```typescript
// Request
POST /api/api/soliscloud/station/detail
{
  "id": "1298491919450325500"
}

// Response: Full station information including location, capacity, equipment
```

---

### 4.3 Get Station Detail List ✅
**Purpose:** Get detailed list of multiple stations

```typescript
POST /api/api/soliscloud/stations/detail-list
{
  "pageNo": 1,
  "pageSize": 20
}
```

---

### 4.4 Get Station Day Energy List ✅
**Purpose:** Get daily energy data for multiple stations

```typescript
// Request
POST /api/api/soliscloud/stations/day-list
{
  "time": "2025-01-05",
  "stationIds"?: string,    // Optional: comma-separated IDs
  "pageNo": 1,
  "pageSize": 20
}

// Response
{
  "success": true,
  "code": "0",
  "data": {
    "records": [
      {
        "id": "1298491919450325500",
        "energy": 761.0,
        "energyStr": "kWh",
        "money": 761.0,
        "batteryChargeEnergy": 3,
        "batteryDischargeEnergy": 1,
        "gridPurchasedEnergy": 4.53,
        "gridSellEnergy": 0
      }
    ]
  }
}
```

---

### 4.5 Get Station Month Energy List ✅
```typescript
POST /api/api/soliscloud/stations/month-list
{
  "month": "2025-01",
  "stationIds"?: string,
  "pageNo": 1,
  "pageSize": 20
}
```

---

### 4.6 Get Station Year Energy List ✅
```typescript
POST /api/api/soliscloud/stations/year-list
{
  "stationIds"?: string,
  "pageNo": 1,
  "pageSize": 20
}
```

---

### 4.7 Get Station Day Data ✅
**Purpose:** Get real-time data for single station on specific day

```typescript
POST /api/api/soliscloud/station/day
{
  "id": "1298491919450325500",
  "time": "2025-01-05",
  "timeZone": 8
}
```

---

### 4.8 Get Station Month Data ✅
```typescript
POST /api/api/soliscloud/station/month
{
  "id": "1298491919450325500",
  "month": "2025-01"
}
```

---

### 4.9 Get Station Year Data ✅
```typescript
POST /api/api/soliscloud/station/year
{
  "id": "1298491919450325500",
  "year": "2025"
}
```

---

### 4.10 Get Station All Years Data ✅
```typescript
POST /api/api/soliscloud/station/all-years
{
  "id": "1298491919450325500"
}
```

---

### 4.11 Add New Station ⚠️
**Purpose:** Create a new power station

```typescript
// Request
POST /api/api/soliscloud/station/add
{
  "stationName": string,      // Required
  "type": number,             // Required: Station type
  "capacity": number,         // Required: Installed capacity (kWp)
  "address"?: string
}

// Response
{
  "success": true,
  "code": "0",
  "data": {
    "id": "newly_created_station_id"
  }
}
```

**⚠️ WARNING:** This will create a real station. Use with caution!

---

### 4.12 Update Station ⚠️
**Purpose:** Modify station information

```typescript
POST /api/api/soliscloud/station/update
{
  "id": string,               // Required
  "stationName"?: string,
  "capacity"?: number,
  "address"?: string
}
```

**⚠️ WARNING:** Modifies existing station data

---

### 4.13 Bind Collector to Station ⚠️
**Purpose:** Associate a collector with a station

```typescript
POST /api/api/soliscloud/station/bind-collector
{
  "stationId": string,        // Required
  "collectorSn": string       // Required
}
```

---

### 4.14 Unbind Collector from Station ⚠️
```typescript
POST /api/api/soliscloud/station/unbind-collector
{
  "stationId": string,
  "collectorSn": string
}
```

---

### 4.15 Bind Inverter to Station ⚠️
```typescript
POST /api/api/soliscloud/station/bind-inverter
{
  "stationId": string,
  "inverterSn": string
}
```

---

## 🎯 Common Response Codes

```typescript
{
  "success": boolean,
  "code": string,
  "msg": string,
  "data": any
}
```

| Code | Message | Meaning |
|------|---------|---------|
| `"0"` | `"success"` | ✅ Request successful |
| `"401"` | `"Unauthorized"` | ❌ Invalid API credentials |
| `"403"` | `"Forbidden"` | ❌ Access denied |
| `"404"` | `"Not Found"` | ❌ Endpoint or resource not found |
| `"500"` | `"Internal Server Error"` | ❌ Backend error |

---

## 📝 Best Practices

### 1. Error Handling
```typescript
try {
  const response = await fetch('http://localhost:3000/api/api/soliscloud/inverters/list', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pageNo: 1, pageSize: 20 })
  });

  const data = await response.json();

  if (data.code === "0" && data.success) {
    // Success
    console.log(data.data);
  } else {
    // API error
    console.error(`Error ${data.code}: ${data.msg}`);
  }
} catch (error) {
  // Network error
  console.error('Network error:', error);
}
```

### 2. Pagination
Always use pagination for list endpoints:
- Start with `pageNo: 1`
- Use `pageSize: 20` (max 100)
- Check `data.page.total` for total records
- Calculate total pages: `Math.ceil(total / pageSize)`

### 3. Date Formats
- **Day data:** `"yyyy-MM-dd"` (e.g., `"2025-01-05"`)
- **Month data:** `"yyyy-MM"` (e.g., `"2025-01"`)
- **Year data:** `"yyyy"` (e.g., `"2025"`)

### 4. Identifier Fields
Most endpoints accept either:
- `id`: Database ID (string of numbers)
- `sn`: Serial Number (alphanumeric)

At least one is required.

### 5. Rate Limiting
- SolisCloud limits: **2 requests/second per endpoint**
- Data refresh: Every 5 minutes
- Implement debouncing for frequent requests

---

## 🔍 Sample Use Cases

### Dashboard Overview
```typescript
// 1. Get all stations
const stations = await fetch('/api/api/soliscloud/stations/list', {
  method: 'POST',
  body: JSON.stringify({ pageNo: 1, pageSize: 20 })
});

// 2. Get all inverters for first station
const inverters = await fetch('/api/api/soliscloud/inverters/list', {
  method: 'POST',
  body: JSON.stringify({
    pageNo: 1,
    pageSize: 20,
    stationId: stations.data.page.records[0].id
  })
});

// 3. Get alarms
const alarms = await fetch('/api/api/soliscloud/alarms/list', {
  method: 'POST',
  body: JSON.stringify({ pageNo: 1, pageSize: 20 })
});
```

### Real-time Monitoring Chart
```typescript
// Get today's data for an inverter (5-min intervals)
const dayData = await fetch('/api/api/soliscloud/inverter/day', {
  method: 'POST',
  body: JSON.stringify({
    sn: "1031730249200313",
    time: new Date().toISOString().split('T')[0]  // Today: yyyy-MM-dd
  })
});

// Use dayData.data array for chart
const chartData = dayData.data.map(point => ({
  time: point.timeStr,
  power: point.pac,
  energy: point.eToday
}));
```

### Monthly Performance Report
```typescript
const monthData = await fetch('/api/api/soliscloud/inverter/month', {
  method: 'POST',
  body: JSON.stringify({
    sn: "1031730249200313",
    month: "2025-01"
  })
});

// Calculate totals
const totalEnergy = monthData.data.reduce((sum, day) => sum + day.energy, 0);
const totalIncome = monthData.data.reduce((sum, day) => sum + day.income, 0);
```

---

## 📚 Additional Resources

- **Backend Implementation:** `/src/integrations/soliscloud/`
- **API Progress Doc:** `/docs/soliscloud/SOLISCLOUD_API_IMPLEMENTATION_PROGRESS.md`
- **Official SolisCloud Docs:** `/docs/soliscloud/SolisCloud_Platform_API_Document_V2_0.md`
- **Swagger UI:** `http://localhost:3000/api` (when server running)

---

## ✅ Testing Status

**Last Tested:** 2025-11-05
**Server Status:** ✅ Running
**Working APIs:** 28/30 (93%)
**Test Report:** All read APIs verified with live data

---

**Questions?** Check the Swagger documentation at `http://localhost:3000/api` or review the implementation in `/src/integrations/soliscloud/`
