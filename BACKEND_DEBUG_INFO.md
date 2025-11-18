# Backend API Debugging Info

## Error Summary
- **HopeCloud**: 502 Bad Gateway - Service down/unreachable
- **SolisCloud**: 400 Bad Request - Request format issue
- **FSolar**: Working (or needs testing)

---

## SolisCloud 400 Error - Need Backend Team to Check

### Request Being Sent

**Endpoint**: `POST http://3.121.174.54:3000/api/soliscloud/stations/detail-list`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "pageNo": 1,
  "pageSize": 1000
}
```

### What Frontend Expects

**Response Format**:
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "station-id",
        "stationName": "Station Name",
        "stationCode": "CODE123",
        "type": 1,
        "state": 1,
        "capacity": 100,
        "eToday": 123.45,
        "eTotal": 50000.00,
        "pac": 75.5
      }
    ],
    "total": 10,
    "size": 1000,
    "current": 1
  }
}
```

---

## Questions for Backend Team

1. **What error message is backend returning?**
   - Check backend server logs for the 400 error
   - What validation is failing?
   - Is the request body format correct?

2. **Are these endpoints actually implemented?**
   - POST `/api/soliscloud/stations/detail-list`
   - POST `/api/soliscloud/inverters/list`
   - POST `/api/soliscloud/alarms/list`

3. **What is the expected request format?**
   - Should it be `pageNo` or `page_no`?
   - Should it be `pageSize` or `page_size`?
   - Are there other required fields?

4. **Why is HopeCloud returning 502?**
   - Is the HopeCloud backend service running?
   - Check: `http://3.121.174.54:3000/api/hopecloud/health`

---

## Frontend Code Location

**Unified Solar Service**: `src/service/unified-solar.service.ts`
- Line 124: SolisCloud stations request
- Line 140: SolisCloud inverters request

**SolisCloud Service**: `src/service/soliscloud.service.ts`
- Line 277: `getStationDetailList()` method

---

## Testing Endpoints

Use this curl command to test:

```bash
# Test SolisCloud stations endpoint
curl -X POST http://3.121.174.54:3000/api/soliscloud/stations/detail-list \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"pageNo": 1, "pageSize": 10}'

# Test HopeCloud health
curl -X GET http://3.121.174.54:3000/api/hopecloud/health
```

---

## Next Steps

1. Backend team checks server logs for 400 error details
2. Backend team confirms correct request format
3. Backend team fixes/restarts HopeCloud service (502 error)
4. Frontend team updates request format if needed
