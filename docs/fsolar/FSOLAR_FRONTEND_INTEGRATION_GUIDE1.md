# Fsolar Frontend Integration Guide

## Overview

This document provides complete information for integrating the Fsolar API with your frontend application. All 29 endpoints are available through our NestJS backend proxy at `http://localhost:3000/api/api/fsolar`.

## Table of Contents

1. [Authentication Flow](#authentication-flow)
2. [API Base URL](#api-base-url)
3. [Response Format](#response-format)
4. [Error Handling](#error-handling)
5. [API Endpoints](#api-endpoints)
   - [Authentication & Utilities](#1-authentication--utilities-5-endpoints)
   - [Device Management](#2-device-management-10-endpoints)
   - [Economic Strategy Templates](#3-economic-strategy-templates-5-endpoints)
   - [Economic Mode Tasks](#4-economic-mode-tasks-6-endpoints)
   - [Task Runtime Monitoring](#5-task-runtime-monitoring-1-endpoint)
   - [Task Run Records](#6-task-run-records-2-endpoints)
6. [Common Use Cases](#common-use-cases)
7. [Best Practices](#best-practices)

---

## Authentication Flow

The Fsolar API uses **Bearer Token Authentication**. The backend handles all token management automatically, including:
- Initial login
- Token refresh (automatic when expired)
- Token storage

### Authentication Lifecycle

```
1. First API Call → Backend auto-login → Returns data
2. Subsequent Calls → Uses cached token → Returns data
3. Token Expired → Auto-refresh → Returns data
4. Logout (optional) → Clears tokens
```

**Important:** Frontend does NOT need to manage tokens manually. All endpoints automatically handle authentication.

---

## API Base URL

```
Base URL: http://localhost:3000/api/api/fsolar
```

For production, update to your production domain:
```
Production: https://your-domain.com/api/api/fsolar
```

---

## Response Format

### Success Response

All successful responses follow this format:

```json
{
  "status": "success",
  "data": {
    // Response data here
  }
}
```

### Error Response

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication failed)
- `404` - Not Found
- `500` - Internal Server Error

---

## Error Handling

### Common Error Messages from Fsolar API

| Error Message | Meaning | Action |
|--------------|---------|--------|
| `Server busy` | Fsolar API is temporarily overloaded | Retry after a few seconds |
| `Token expired` | Authentication token expired | Backend auto-refreshes, retry request |
| `Insufficient permissions` | Account lacks permission for this operation | Check account permissions |
| `Device does not exist` | Device SN not found | Verify device SN is correct |
| `User is not authorized to operate the device` | No permission for this device | Check device ownership |

### Error Handling Example Pattern

```javascript
try {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    // Handle error
    if (data.message === 'Server busy') {
      // Retry logic
      setTimeout(() => retryRequest(), 3000);
    } else {
      // Show error to user
      showError(data.message);
    }
  } else {
    // Handle success
    return data.data;
  }
} catch (error) {
  // Network error
  showError('Network error. Please check your connection.');
}
```

---

## API Endpoints

---

## 1. Authentication & Utilities (5 Endpoints)

### 1.1 Login

**Note:** This is handled automatically by backend. Only use if you need to manually trigger login.

**Endpoint:** `POST /auth/login`

**Description:** Authenticate with Fsolar API and obtain tokens.

**Request:** No body required (credentials are configured on backend)

**Response:**
```json
{
  "status": "success",
  "data": {
    "token": "Bearer_eyJhbGc...",
    "tokenExpireTime": "1763042812000",
    "refreshToken": "Bearer_eyJhbGc...",
    "refTokenExpireTime": "1765633636462"
  }
}
```

**Frontend Usage:**
```
Method: POST
URL: /api/api/fsolar/auth/login
Headers: Content-Type: application/json
Body: (none)
```

---

### 1.2 Check Authentication Status

**Endpoint:** `GET /auth/status`

**Description:** Check if backend is authenticated with Fsolar API.

**Request:** No parameters

**Response:**
```json
{
  "status": "success",
  "data": {
    "authenticated": true,
    "tokenExpiry": "2025-11-13T14:06:52.000Z",
    "refreshTokenExpiry": "2025-12-13T13:47:16.462Z",
    "timeUntilTokenExpiry": "17d 3h 0m",
    "timeUntilRefreshExpiry": "47d 2h 40m"
  }
}
```

**Frontend Usage:**
```
Method: GET
URL: /api/api/fsolar/auth/status
```

**Use Case:** Display authentication status in admin panel or debug console.

---

### 1.3 Refresh Token

**Note:** This is handled automatically by backend. Only use if you need to manually refresh.

**Endpoint:** `POST /auth/refresh`

**Description:** Refresh the access token using refresh token.

**Request:** No body required

**Response:**
```json
{
  "status": "success",
  "data": {
    "token": "Bearer_eyJhbGc...",
    "tokenExpireTime": "1763042812000"
  }
}
```

**Frontend Usage:**
```
Method: POST
URL: /api/api/fsolar/auth/refresh
```

---

### 1.4 Logout

**Endpoint:** `POST /auth/logout`

**Description:** Logout from Fsolar API and clear cached tokens.

**Request:** No body required

**Response:**
```json
{
  "status": "success",
  "data": {}
}
```

**Frontend Usage:**
```
Method: POST
URL: /api/api/fsolar/auth/logout
```

**Use Case:** Call when user logs out of your application or when switching accounts.

---

### 1.5 Encrypt Password

**Endpoint:** `POST /utils/encrypt-password`

**Description:** Encrypt a password using Fsolar's RSA encryption.

**Request:**
```json
{
  "password": "myPassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "encryptedPassword": "encrypted_string_here..."
  }
}
```

**Frontend Usage:**
```
Method: POST
URL: /api/api/fsolar/utils/encrypt-password
Headers: Content-Type: application/json
Body: {"password": "string"}
```

**Use Case:** Utility endpoint for testing or if you need to encrypt passwords for other purposes.

---

## 2. Device Management (10 Endpoints)

### 2.1 Get Device List

**Endpoint:** `GET /devices/list`

**Description:** Retrieve paginated list of devices.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pageNum` | number | Yes | Page number (starts from 1) |
| `pageSize` | number | Yes | Items per page (max 1000) |
| `deviceSn` | string | No | Filter by device serial number |
| `deviceType` | string | No | Filter by device type |

**Response:**
```json
{
  "status": "success",
  "data": {
    "dataList": [
      {
        "id": "123456",
        "deviceSn": "DEV001",
        "deviceType": "Inverter",
        "deviceName": "Solar Inverter 1",
        "status": "online",
        // ... more device fields
      }
    ],
    "total": "10",
    "totalPage": "2",
    "currentPage": "1",
    "pageSize": "5"
  }
}
```

**Frontend Usage:**
```
Method: GET
URL: /api/api/fsolar/devices/list?pageNum=1&pageSize=20
```

**Use Case:** Display devices in a table/grid with pagination.

---

### 2.2 Query Device Energy Data

**Endpoint:** `GET /device/energy`

**Description:** Query energy production/consumption data for a device.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `deviceSn` | string | Yes | Device serial number |
| `date` | string | Yes | Date in YYYYMMDD format |
| `timeDimension` | number | Yes | Time dimension: 1=day, 2=month, 3=year |

**Response:**
```json
{
  "status": "success",
  "data": {
    "deviceSn": "DEV001",
    "date": "20250127",
    "energyData": [
      {
        "timestamp": "2025-01-27T08:00:00Z",
        "production": 1500,
        "consumption": 800
      }
    ]
  }
}
```

**Frontend Usage:**
```
Method: GET
URL: /api/api/fsolar/device/energy?deviceSn=DEV001&date=20250127&timeDimension=1
```

**Use Case:** Display energy charts/graphs for a specific device.

---

### 2.3 Get Device Basic Info

**Endpoint:** `GET /device/basic/:deviceSn`

**Description:** Get basic information about a device.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `deviceSn` | string | Yes | Device serial number |

**Response:**
```json
{
  "status": "success",
  "data": {
    "deviceSn": "DEV001",
    "deviceType": "Inverter",
    "deviceName": "Solar Inverter 1",
    "model": "SI-5000",
    "manufacturer": "Fsolar",
    "installDate": "2024-01-15",
    "status": "online"
    // ... more fields
  }
}
```

**Frontend Usage:**
```
Method: GET
URL: /api/api/fsolar/device/basic/DEV001
```

**Use Case:** Display device details page.

---

### 2.4 Get Device Historical Data

**Endpoint:** `GET /device/history/:deviceSn`

**Description:** Query historical data for a specific device.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `deviceSn` | string | Yes | Device serial number |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `dateStr` | string | Yes | Date in YYYYMMDD format |
| `dataItemIds` | string | Yes | Comma-separated data item IDs |

**Response:**
```json
{
  "status": "success",
  "data": {
    "deviceSn": "DEV001",
    "historicalData": [
      {
        "dataItemId": 1,
        "timestamp": "2025-01-27T10:00:00Z",
        "value": 2500
      }
    ]
  }
}
```

**Frontend Usage:**
```
Method: GET
URL: /api/api/fsolar/device/history/DEV001?dateStr=20250127&dataItemIds=1,2,3
```

**Use Case:** Display historical trends for device metrics.

---

### 2.5 Batch Query Device Historical Data

**Endpoint:** `GET /devices/history`

**Description:** Query historical data for multiple devices at once.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `deviceSnList` | string | Yes | Comma-separated device SNs |
| `dateStr` | string | Yes | Date in YYYYMMDD format |
| `dataItemIds` | string | Yes | Comma-separated data item IDs |
| `queryType` | number | Yes | Query type: 1=hourly, 2=daily |

**Response:**
```json
{
  "status": "success",
  "data": {
    "devices": [
      {
        "deviceSn": "DEV001",
        "data": [/* historical data */]
      },
      {
        "deviceSn": "DEV002",
        "data": [/* historical data */]
      }
    ]
  }
}
```

**Frontend Usage:**
```
Method: GET
URL: /api/api/fsolar/devices/history?deviceSnList=DEV001,DEV002&dateStr=20250127&dataItemIds=1,2&queryType=1
```

**Use Case:** Display comparison charts for multiple devices.

---

### 2.6 Query Device Events/Alarms

**Endpoint:** `GET /device/events/:deviceSn`

**Description:** Retrieve events and alarms for a device.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `deviceSn` | string | Yes | Device serial number |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pageNum` | number | Yes | Page number (starts from 1) |
| `pageSize` | number | Yes | Items per page (max 1000) |
| `startTime` | number | Yes | Start timestamp (milliseconds) |
| `endTime` | number | Yes | End timestamp (milliseconds) |
| `alarmLevel` | number | No | Alarm level: 1=critical, 2=major, 3=minor, 4=warning |

**Note:** Query range cannot exceed 7 days.

**Response:**
```json
{
  "status": "success",
  "data": {
    "dataList": [
      {
        "eventId": "12345",
        "deviceSn": "DEV001",
        "eventType": "alarm",
        "alarmLevel": 2,
        "message": "High temperature detected",
        "timestamp": 1706356800000,
        "status": "active"
      }
    ],
    "total": "5",
    "totalPage": "1",
    "currentPage": "1",
    "pageSize": "10"
  }
}
```

**Frontend Usage:**
```
Method: GET
URL: /api/api/fsolar/device/events/DEV001?pageNum=1&pageSize=20&startTime=1706270400000&endTime=1706356800000
```

**Use Case:** Display device alerts/events timeline.

---

### 2.7 Add Devices

**Endpoint:** `POST /devices/add`

**Description:** Add new devices to the system.

**Request Body:**
```json
{
  "deviceSaveInfoList": [
    {
      "deviceSn": "DEV003",
      "deviceType": "Inverter",
      "deviceName": "New Solar Inverter"
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "successCount": 1,
    "failCount": 0,
    "details": [
      {
        "deviceSn": "DEV003",
        "status": "success"
      }
    ]
  }
}
```

**Frontend Usage:**
```
Method: POST
URL: /api/api/fsolar/devices/add
Headers: Content-Type: application/json
Body: {"deviceSaveInfoList": [...]}
```

**Use Case:** Add devices form/wizard.

---

### 2.8 Delete Devices

**Endpoint:** `POST /devices/delete`

**Description:** Delete devices from the system.

**Request Body:**
```json
{
  "deviceSns": ["DEV003", "DEV004"]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "successCount": 2,
    "failCount": 0
  }
}
```

**Frontend Usage:**
```
Method: POST
URL: /api/api/fsolar/devices/delete
Headers: Content-Type: application/json
Body: {"deviceSns": ["DEV003"]}
```

**Use Case:** Bulk delete devices with confirmation dialog.

---

### 2.9 Get Device Settings

**Endpoint:** `GET /device/setting/:deviceSn`

**Description:** Query device configuration settings.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `deviceSn` | string | Yes | Device serial number |

**Response:**
```json
{
  "status": "success",
  "data": {
    "deviceSn": "DEV001",
    "settings": [
      {
        "settingId": 1,
        "settingName": "Max Power Output",
        "value": "5000",
        "unit": "W"
      }
    ]
  }
}
```

**Frontend Usage:**
```
Method: GET
URL: /api/api/fsolar/device/setting/DEV001
```

**Use Case:** Display device configuration panel.

---

### 2.10 Set Device Settings

**Endpoint:** `POST /device/setting`

**Description:** Update device configuration settings.

**Request Body:**
```json
{
  "deviceSn": "DEV001",
  "settingsContent": [
    {
      "settingId": 1,
      "value": "4500"
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "commandId": "CMD123456",
    "status": "pending"
  }
}
```

**Frontend Usage:**
```
Method: POST
URL: /api/api/fsolar/device/setting
Headers: Content-Type: application/json
Body: {"deviceSn": "...", "settingsContent": [...]}
```

**Use Case:** Device settings configuration form.

---

## 3. Economic Strategy Templates (5 Endpoints)

### 3.1 List Strategy Templates

**Endpoint:** `POST /eco-strategy-templates/list`

**Description:** Get paginated list of economic strategy templates.

**Request Body:**
```json
{
  "pageNum": 1,
  "pageSize": 20,
  "templateName": "Optional filter"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "dataList": [
      {
        "id": "123",
        "templateName": "Peak Hour Strategy",
        "createTime": 1706270400000,
        "modifyTime": 1706356800000
      }
    ],
    "total": "5",
    "totalPage": "1",
    "currentPage": "1",
    "pageSize": "20"
  }
}
```

**Frontend Usage:**
```
Method: POST
URL: /api/api/fsolar/eco-strategy-templates/list
Headers: Content-Type: application/json
Body: {"pageNum": 1, "pageSize": 20}
```

**Use Case:** Display templates in a table/list with pagination.

---

### 3.2 Add Strategy Template

**Endpoint:** `POST /eco-strategy-template`

**Description:** Create a new economic strategy template.

**Request Body:**
```json
{
  "templateName": "Morning Peak Strategy",
  "strategy1": {
    "type": 1,
    "startTime": "06:00",
    "endTime": "09:00",
    "mode": 1,
    "power": 5000
  },
  "strategy2": {
    "type": 0
  },
  "strategy3": {
    "type": 0
  },
  "strategy4": {
    "type": 0
  }
}
```

**Note:** All 4 strategy slots (strategy1-4) must be provided. Use `type: 0` for empty slots.

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "124",
    "templateName": "Morning Peak Strategy"
  }
}
```

**Frontend Usage:**
```
Method: POST
URL: /api/api/fsolar/eco-strategy-template
Headers: Content-Type: application/json
Body: {"templateName": "...", "strategy1": {...}, ...}
```

**Use Case:** Template creation form with up to 4 time-based rules.

---

### 3.3 Get Template Details

**Endpoint:** `GET /eco-strategy-template/:id`

**Description:** Retrieve detailed information about a template.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Template ID |

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "123",
    "templateName": "Peak Hour Strategy",
    "strategy1": {
      "type": 1,
      "startTime": "06:00",
      "endTime": "09:00",
      "mode": 1,
      "power": 5000
    },
    "strategy2": { "type": 0 },
    "strategy3": { "type": 0 },
    "strategy4": { "type": 0 },
    "createTime": 1706270400000,
    "modifyTime": 1706356800000
  }
}
```

**Frontend Usage:**
```
Method: GET
URL: /api/api/fsolar/eco-strategy-template/123
```

**Use Case:** View/edit template details page.

---

### 3.4 Update Strategy Template

**Endpoint:** `PUT /eco-strategy-template/:id`

**Description:** Update an existing strategy template.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Template ID |

**Request Body:**
```json
{
  "templateName": "Updated Morning Peak Strategy",
  "strategy1": {
    "type": 1,
    "startTime": "07:00",
    "endTime": "10:00",
    "mode": 1,
    "power": 6000
  },
  "strategy2": { "type": 0 },
  "strategy3": { "type": 0 },
  "strategy4": { "type": 0 }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "123",
    "templateName": "Updated Morning Peak Strategy"
  }
}
```

**Frontend Usage:**
```
Method: PUT
URL: /api/api/fsolar/eco-strategy-template/123
Headers: Content-Type: application/json
Body: {"templateName": "...", "strategy1": {...}, ...}
```

**Use Case:** Template edit form.

---

### 3.5 Delete Strategy Template

**Endpoint:** `DELETE /eco-strategy-template/:id`

**Description:** Delete a strategy template.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Template ID |

**Response:**
```json
{
  "status": "success",
  "data": {}
}
```

**Frontend Usage:**
```
Method: DELETE
URL: /api/api/fsolar/eco-strategy-template/123
```

**Use Case:** Delete button with confirmation dialog.

---

## 4. Economic Mode Tasks (6 Endpoints)

### 4.1 List Economic Tasks

**Endpoint:** `POST /eco-tasks/list`

**Description:** Get paginated list of economic mode tasks.

**Request Body:**
```json
{
  "pageNum": 1,
  "pageSize": 20,
  "taskName": "Optional filter",
  "taskStatus": 1
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "dataList": [
      {
        "id": "11187408221173216",
        "taskName": "Test Task",
        "templateId": "123",
        "taskType": "device",
        "createTime": 1761454204000,
        "modifyTime": 1761454204000
      }
    ],
    "total": "1",
    "totalPage": "1",
    "currentPage": "1",
    "pageSize": "20"
  }
}
```

**Frontend Usage:**
```
Method: POST
URL: /api/api/fsolar/eco-tasks/list
Headers: Content-Type: application/json
Body: {"pageNum": 1, "pageSize": 20}
```

**Use Case:** Display tasks in a table with filters and pagination.

---

### 4.2 Add Economic Task

**Endpoint:** `POST /eco-task`

**Description:** Create a new economic mode task.

**Request Body:**
```json
{
  "taskName": "Evening Peak Task",
  "templateId": 123,
  "taskType": "device",
  "deviceIdList": [20505004821130001, 20505004821130002]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "11187408221173217",
    "taskName": "Evening Peak Task"
  }
}
```

**Frontend Usage:**
```
Method: POST
URL: /api/api/fsolar/eco-task
Headers: Content-Type: application/json
Body: {"taskName": "...", "templateId": 123, "deviceIdList": [...]}
```

**Use Case:** Task creation form with device selection.

---

### 4.3 Update Economic Task

**Endpoint:** `PUT /eco-task/:id`

**Description:** Update an existing economic task.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Task ID |

**Request Body:**
```json
{
  "taskName": "Updated Evening Peak Task",
  "templateId": 124,
  "taskType": "device",
  "deviceIdList": [20505004821130001]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "11187408221173217",
    "taskName": "Updated Evening Peak Task"
  }
}
```

**Frontend Usage:**
```
Method: PUT
URL: /api/api/fsolar/eco-task/11187408221173217
Headers: Content-Type: application/json
Body: {"taskName": "...", "templateId": 124, ...}
```

**Use Case:** Task edit form.

---

### 4.4 Delete Economic Task

**Endpoint:** `DELETE /eco-task/:id`

**Description:** Delete an economic mode task.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Task ID |

**Response:**
```json
{
  "status": "success",
  "data": {}
}
```

**Frontend Usage:**
```
Method: DELETE
URL: /api/api/fsolar/eco-task/11187408221173217
```

**Use Case:** Delete button with confirmation.

---

### 4.5 Run Economic Task

**Endpoint:** `POST /eco-task/run`

**Description:** Execute an economic mode task to apply settings to devices.

**Request Body:**
```json
{
  "taskId": 11187408221173216,
  "runType": 0
}
```

**Parameters:**
- `runType`: 0 = normal operation, 1 = failed resend
- `runTaskRecordId`: Required only when `runType` = 1

**Response:**
```json
{
  "status": "success",
  "data": {
    "runTaskRecordId": "11190986901690848",
    "taskStatus": 0,
    "remainTime": 120,
    "successCount": 0,
    "failCount": 0
  }
}
```

**Note:** Task execution completes within 2 minutes. Use the `runTaskRecordId` to monitor progress.

**Frontend Usage:**
```
Method: POST
URL: /api/api/fsolar/eco-task/run
Headers: Content-Type: application/json
Body: {"taskId": 11187408221173216, "runType": 0}
```

**Use Case:** "Run Task" button with progress indicator.

---

### 4.6 Query Task Details

**Endpoint:** `POST /eco-task/detail`

**Description:** Get device details associated with a task.

**Request Body:**
```json
{
  "taskId": 11187408221173216
}
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "11187408221992416",
      "taskId": "11187408221173216",
      "deviceId": "20505004821130001",
      "deviceSn": "DEV001"
    }
  ]
}
```

**Frontend Usage:**
```
Method: POST
URL: /api/api/fsolar/eco-task/detail
Headers: Content-Type: application/json
Body: {"taskId": 11187408221173216}
```

**Use Case:** Display devices associated with a task.

---

## 5. Task Runtime Monitoring (1 Endpoint)

### 5.1 Query Task Runtime Details

**Endpoint:** `POST /eco-task/running-detail`

**Description:** Monitor real-time execution status of a running task.

**Request Body:**
```json
{
  "taskId": 11187408221173216,
  "runTaskRecordId": 11190986901690848
}
```

**Parameters:**
- `taskId`: Optional, can be used alone to check latest run
- `runTaskRecordId`: Required to view completed result

**Response:**
```json
{
  "status": "success",
  "data": {
    "taskStatus": 0,
    "successCount": 5,
    "failCount": 1,
    "remainTime": 45,
    "detailListVOList": [
      {
        "deviceSn": "DEV001",
        "commandId": 12345,
        "commandStatus": 1,
        "alias": "Solar Inverter 1"
      }
    ]
  }
}
```

**Status Codes:**
- `taskStatus`: 0 = Running, 1 = Done
- `commandStatus`: 2 = Waiting for reply, 1 = Success, 0 = Failed/Timeout

**Frontend Usage:**
```
Method: POST
URL: /api/api/fsolar/eco-task/running-detail
Headers: Content-Type: application/json
Body: {"taskId": ..., "runTaskRecordId": ...}
```

**Use Case:** Real-time task execution progress with device-by-device status.

**Implementation Pattern:**
```javascript
// Poll every 5 seconds while task is running
async function monitorTaskExecution(taskId, runTaskRecordId) {
  const interval = setInterval(async () => {
    const status = await fetchRuntimeDetails(taskId, runTaskRecordId);

    if (status.data.taskStatus === 1) {
      // Task completed
      clearInterval(interval);
      showCompletionMessage(status);
    } else {
      // Update progress UI
      updateProgressBar(status.data.successCount, status.data.failCount);
      updateRemainTime(status.data.remainTime);
    }
  }, 5000);
}
```

---

## 6. Task Run Records (2 Endpoints)

### 6.1 List Task Run Records

**Endpoint:** `POST /eco-task/run-record/list`

**Description:** Get paginated list of task execution history.

**Request Body:**
```json
{
  "pageNum": 1,
  "pageSize": 20,
  "taskId": 11187408221173216,
  "taskStatus": 1,
  "runType": 0
}
```

**Optional Filters:**
- `taskId`: Filter by specific task
- `taskName`: Filter by task name
- `taskStatus`: Filter by status (0=running, 1=done)
- `runType`: Filter by run type (0=normal, 1=resend)

**Response:**
```json
{
  "status": "success",
  "data": {
    "dataList": [
      {
        "id": "11190986901690848",
        "taskId": "11187408221173216",
        "taskName": "Test Task",
        "templateId": "123",
        "taskType": "device",
        "runType": 0,
        "taskStatus": 1,
        "successCount": 5,
        "failCount": 1,
        "createTime": 1761454651000,
        "modifyTime": 1761454651000
      }
    ],
    "total": "2",
    "totalPage": "1",
    "currentPage": "1",
    "pageSize": "20"
  }
}
```

**Frontend Usage:**
```
Method: POST
URL: /api/api/fsolar/eco-task/run-record/list
Headers: Content-Type: application/json
Body: {"pageNum": 1, "pageSize": 20}
```

**Use Case:** Task execution history table with filters.

---

### 6.2 Get Run Record Details

**Endpoint:** `POST /eco-task/run-record/detail`

**Description:** Get detailed information about a specific task execution.

**Request Body:**
```json
{
  "id": 11190986901690848
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "11187408221173216",
    "runTaskRecordId": "11190986901690848",
    "taskName": "Test Task",
    "taskStatus": 1,
    "successCount": "5",
    "failCount": "1",
    "createTime": 1761454651000,
    "detailListVOList": [
      {
        "id": "123",
        "deviceId": "20505004821130001",
        "deviceSn": "DEV001",
        "alias": "Solar Inverter 1",
        "commandId": 12345,
        "commandStatus": 1
      }
    ]
  }
}
```

**Frontend Usage:**
```
Method: POST
URL: /api/api/fsolar/eco-task/run-record/detail
Headers: Content-Type: application/json
Body: {"id": 11190986901690848}
```

**Use Case:** View detailed execution results with per-device status.

---

## Common Use Cases

### Use Case 1: Dashboard - Overview

**Goal:** Display system overview with key metrics

**APIs to use:**
1. `GET /auth/status` - Show authentication status
2. `GET /devices/list?pageNum=1&pageSize=10` - Show recent devices
3. `POST /eco-tasks/list` - Show recent tasks
4. `POST /eco-task/run-record/list` - Show recent executions

**Implementation Flow:**
```
1. Load page
2. Fetch all 4 endpoints in parallel
3. Display:
   - Auth status indicator
   - Device count
   - Active tasks count
   - Recent execution history
```

---

### Use Case 2: Device Management

**Goal:** Manage devices with CRUD operations

**APIs to use:**
1. `GET /devices/list` - List all devices with pagination
2. `GET /device/basic/:deviceSn` - View device details
3. `POST /devices/add` - Add new devices
4. `POST /devices/delete` - Remove devices
5. `GET /device/energy` - View device energy data
6. `GET /device/events/:deviceSn` - View device alerts

**Implementation Flow:**
```
Device List Page:
├── Fetch devices list
├── Display in table/grid
├── Implement search/filter
└── Pagination controls

Device Details Page:
├── Fetch device basic info
├── Fetch device energy data
├── Fetch device events
├── Display charts and metrics
└── Edit/Delete actions
```

---

### Use Case 3: Economic Strategy Management

**Goal:** Create and manage economic strategies

**APIs to use:**
1. `POST /eco-strategy-templates/list` - List templates
2. `POST /eco-strategy-template` - Create template
3. `GET /eco-strategy-template/:id` - View template
4. `PUT /eco-strategy-template/:id` - Update template
5. `DELETE /eco-strategy-template/:id` - Delete template

**Implementation Flow:**
```
Template List Page:
├── Fetch templates list
├── Display in cards/table
└── Create/Edit/Delete actions

Template Form:
├── Define up to 4 time-based rules
├── Each rule: startTime, endTime, mode, power
├── Validate time ranges don't overlap
├── Submit to create/update API
```

---

### Use Case 4: Task Execution & Monitoring

**Goal:** Execute tasks and monitor real-time progress

**APIs to use:**
1. `POST /eco-tasks/list` - List available tasks
2. `POST /eco-task/run` - Start task execution
3. `POST /eco-task/running-detail` - Monitor progress
4. `POST /eco-task/run-record/list` - View history
5. `POST /eco-task/run-record/detail` - View execution details

**Implementation Flow:**
```
Task Execution:
1. User clicks "Run Task" button
2. Call POST /eco-task/run
3. Get runTaskRecordId from response
4. Start polling every 5 seconds:
   └── Call POST /eco-task/running-detail
   └── Update progress bar
   └── Show device-by-device status
   └── Stop when taskStatus === 1
5. Show completion notification
6. Refresh run records list

Progress Display:
├── Overall progress: successCount / (successCount + failCount)
├── Remaining time countdown
├── Device list with status icons
└── Real-time updates every 5 seconds
```

---

### Use Case 5: Historical Analysis

**Goal:** Analyze device performance over time

**APIs to use:**
1. `GET /device/energy` - Daily/monthly/yearly energy
2. `GET /device/history/:deviceSn` - Historical metrics
3. `GET /devices/history` - Compare multiple devices
4. `GET /device/events/:deviceSn` - Event timeline

**Implementation Flow:**
```
Analytics Dashboard:
├── Date range selector
├── Device selector (single or multiple)
├── Metric selector (energy, power, etc.)
└── Chart display

Fetch Data:
├── Single device: GET /device/energy
├── Multiple devices: GET /devices/history
├── Render charts (line, bar, area)
└── Show comparison overlays
```

---

## Best Practices

### 1. Error Handling

**Always handle errors gracefully:**

```javascript
// Recommended pattern
async function callFsolarAPI(url, options) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      // API returned error
      handleAPIError(data.message, data.statusCode);
      return null;
    }

    return data.data; // Return the data object
  } catch (error) {
    // Network error
    handleNetworkError(error);
    return null;
  }
}

function handleAPIError(message, statusCode) {
  if (message === 'Server busy') {
    // Show retry button
    showNotification('Fsolar server is busy. Please try again in a moment.', 'warning');
  } else if (statusCode === 401) {
    // Authentication issue
    showNotification('Authentication failed. Please contact administrator.', 'error');
  } else {
    // Generic error
    showNotification(message, 'error');
  }
}
```

---

### 2. Loading States

**Show loading indicators for better UX:**

```javascript
async function loadDevices() {
  setLoading(true);

  try {
    const devices = await fetchDeviceList(1, 20);
    setDevices(devices);
  } catch (error) {
    showError(error);
  } finally {
    setLoading(false);
  }
}
```

---

### 3. Pagination

**Implement efficient pagination:**

```javascript
// State management
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(20);
const [totalPages, setTotalPages] = useState(1);

// Fetch function
async function fetchPage(page) {
  const response = await fetch(
    `/api/api/fsolar/devices/list?pageNum=${page}&pageSize=${pageSize}`
  );
  const data = await response.json();

  setDevices(data.data.dataList);
  setTotalPages(parseInt(data.data.totalPage));
  setCurrentPage(page);
}

// Pagination controls
<Pagination
  current={currentPage}
  total={totalPages}
  onChange={fetchPage}
/>
```

---

### 4. Real-time Updates

**For task monitoring, implement smart polling:**

```javascript
class TaskMonitor {
  constructor(taskId, runTaskRecordId) {
    this.taskId = taskId;
    this.runTaskRecordId = runTaskRecordId;
    this.interval = null;
    this.pollCount = 0;
    this.maxPolls = 30; // 2.5 minutes with 5-second intervals
  }

  start(onUpdate, onComplete, onError) {
    this.interval = setInterval(async () => {
      try {
        const status = await this.checkStatus();

        if (status.taskStatus === 1) {
          // Task completed
          this.stop();
          onComplete(status);
        } else {
          // Task still running
          onUpdate(status);
          this.pollCount++;

          if (this.pollCount >= this.maxPolls) {
            // Timeout - task taking too long
            this.stop();
            onError('Task monitoring timeout');
          }
        }
      } catch (error) {
        this.stop();
        onError(error);
      }
    }, 5000); // Poll every 5 seconds
  }

  async checkStatus() {
    const response = await fetch('/api/api/fsolar/eco-task/running-detail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId: this.taskId,
        runTaskRecordId: this.runTaskRecordId
      })
    });

    const data = await response.json();
    return data.data;
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

// Usage
const monitor = new TaskMonitor(taskId, runRecordId);
monitor.start(
  (status) => updateProgressUI(status),
  (status) => showCompletionMessage(status),
  (error) => showErrorMessage(error)
);
```

---

### 5. Caching

**Cache data to reduce API calls:**

```javascript
// Simple cache implementation
class APICache {
  constructor(ttl = 60000) { // 1 minute default
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

// Usage
const deviceCache = new APICache(300000); // 5 minutes

async function getDeviceInfo(deviceSn) {
  const cacheKey = `device_${deviceSn}`;
  const cached = deviceCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const device = await fetchDeviceInfo(deviceSn);
  deviceCache.set(cacheKey, device);
  return device;
}
```

---

### 6. Batch Operations

**Minimize API calls by batching when possible:**

```javascript
// Instead of calling device/energy for each device
// Use devices/history to get multiple devices at once

async function getMultipleDeviceData(deviceSns, date) {
  // ❌ Bad: Multiple calls
  // const promises = deviceSns.map(sn => getDeviceEnergy(sn, date));
  // const results = await Promise.all(promises);

  // ✅ Good: Single batch call
  const deviceSnList = deviceSns.join(',');
  const response = await fetch(
    `/api/api/fsolar/devices/history?deviceSnList=${deviceSnList}&dateStr=${date}&dataItemIds=1,2,3&queryType=1`
  );
  return response.json();
}
```

---

### 7. Date Formatting

**Fsolar API uses specific date formats:**

```javascript
// Helper functions for date formatting
function toFsolarDate(date) {
  // Format: YYYYMMDD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function toFsolarTimestamp(date) {
  // Format: milliseconds since epoch
  return date.getTime();
}

function fromFsolarTimestamp(timestamp) {
  return new Date(parseInt(timestamp));
}

// Usage
const today = new Date();
const dateStr = toFsolarDate(today); // "20250127"
const startTime = toFsolarTimestamp(new Date(today.setHours(0, 0, 0, 0)));
const endTime = toFsolarTimestamp(new Date(today.setHours(23, 59, 59, 999)));
```

---

### 8. Permission Handling

**Some operations require specific permissions:**

```javascript
async function deleteTemplate(templateId) {
  try {
    const response = await fetch(
      `/api/api/fsolar/eco-strategy-template/${templateId}`,
      { method: 'DELETE' }
    );

    const data = await response.json();

    if (!response.ok) {
      if (data.message.includes('not authorized')) {
        showNotification(
          'You do not have permission to delete this template.',
          'error'
        );
        return;
      }
      throw new Error(data.message);
    }

    showNotification('Template deleted successfully', 'success');
  } catch (error) {
    showNotification('Failed to delete template', 'error');
  }
}
```

---

### 9. Validation Before API Calls

**Validate data before making API calls:**

```javascript
function validateDeviceSn(deviceSn) {
  if (!deviceSn || deviceSn.trim() === '') {
    throw new Error('Device SN is required');
  }
  return deviceSn.trim();
}

function validateDateRange(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffDays = (end - start) / (1000 * 60 * 60 * 24);

  if (diffDays > 7) {
    throw new Error('Date range cannot exceed 7 days');
  }

  if (start > end) {
    throw new Error('Start time must be before end time');
  }
}

function validatePagination(pageNum, pageSize) {
  if (pageNum < 1) {
    throw new Error('Page number must be at least 1');
  }
  if (pageSize < 1 || pageSize > 1000) {
    throw new Error('Page size must be between 1 and 1000');
  }
}

// Usage
async function fetchDeviceEvents(deviceSn, startTime, endTime, pageNum, pageSize) {
  try {
    validateDeviceSn(deviceSn);
    validateDateRange(startTime, endTime);
    validatePagination(pageNum, pageSize);

    // Make API call
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    showValidationError(error.message);
    return null;
  }
}
```

---

### 10. Component Architecture Recommendations

**Organize your frontend code:**

```
src/
├── services/
│   └── fsolar/
│       ├── auth.service.js          # Authentication APIs
│       ├── device.service.js        # Device management APIs
│       ├── template.service.js      # Template APIs
│       ├── task.service.js          # Task APIs
│       └── record.service.js        # Run record APIs
│
├── hooks/
│   ├── useFsolarAuth.js            # Auth status hook
│   ├── useDeviceList.js            # Device list with pagination
│   ├── useTaskMonitor.js           # Real-time task monitoring
│   └── useRunRecords.js            # Run records with filters
│
├── components/
│   ├── DeviceList/
│   ├── DeviceDetails/
│   ├── TemplateForm/
│   ├── TaskExecutor/
│   └── RunRecordTable/
│
└── utils/
    ├── fsolarDate.js               # Date formatting helpers
    ├── fsolarCache.js              # Caching utility
    └── fsolarErrors.js             # Error handling helpers
```

---

## Summary

### Quick Reference

| Feature | Endpoints | Key Use Cases |
|---------|-----------|---------------|
| **Authentication** | 5 endpoints | System status, manual auth control |
| **Devices** | 10 endpoints | Device CRUD, monitoring, configuration |
| **Templates** | 5 endpoints | Strategy management (time-based rules) |
| **Tasks** | 6 endpoints | Task CRUD, execution, device association |
| **Monitoring** | 1 endpoint | Real-time task execution tracking |
| **Records** | 2 endpoints | Execution history and analysis |

### Integration Checklist

- [ ] Set up API base URL configuration
- [ ] Implement error handling utilities
- [ ] Create service layer for API calls
- [ ] Implement loading states
- [ ] Add input validation
- [ ] Set up caching strategy
- [ ] Implement real-time monitoring for task execution
- [ ] Add pagination for list endpoints
- [ ] Handle date formatting correctly
- [ ] Test all CRUD operations
- [ ] Implement permission-based UI controls
- [ ] Add retry logic for "Server busy" errors
- [ ] Create reusable components for common patterns
- [ ] Add unit tests for service layer
- [ ] Document frontend API usage

### Support

For backend issues or questions:
- Check server logs at `/tmp/nest-server.log`
- Verify authentication status: `GET /api/api/fsolar/auth/status`
- Test endpoint directly with curl/Postman before debugging frontend

For Fsolar API specific questions:
- Refer to official Fsolar API documentation
- Contact Fsolar support for account/permission issues

---

**Document Version:** 1.0
**Last Updated:** January 27, 2025
**API Version:** All 29 endpoints
**Backend:** NestJS @ http://localhost:3000
