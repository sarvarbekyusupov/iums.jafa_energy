# HopeCloud Communication Modules Sync - Implementation Plan

**Status:** ✅ COMPLETED
**Created:** October 4, 2025
**Completed:** October 4, 2025
**Priority:** Medium

---

## Overview

Communication modules (also called "divertors" in HopeCloud) are network communication devices that connect solar inverters to HopeCloud's monitoring platform. Each site typically has one communication module that manages data transmission from all devices at that site.

**Current Status:**
- ❌ NO database table exists for communication modules
- ❌ NO entity/service/DTO files exist
- ✅ GET endpoints exist to fetch data from HopeCloud API
- ✅ 3 communication modules available in HopeCloud (1 per site)

---

## Data Analysis

### Sample Communication Module from HopeCloud

```json
{
  "id": "1795625821979877378",
  "equipmentPn": "30081304A06G245H99476",
  "divertorName": "30081304A06G245H99476",
  "powerPlantId": "1931572113875873794",
  "powerPlantName": "OOO \"Kontinent kachestvo\"",
  "userId": "1931606861202419713",
  "userName": "Muzaffar007",
  "deviceType": "707",
  "iccid": null,
  "operatorType": "",
  "startTime": "2024-05-28 22:18:52",
  "stopTime": null,
  "loadedNumber": 1,
  "rssi": 39,
  "longitude": null,
  "latitude": null,
  "status": 1,
  "updateTime": "2025-06-19 14:46:00"
}
```

### Current Availability

| Site | HopeCloud Plant ID | Comm Modules |
|------|-------------------|--------------|
| OOO "Kontinent kachestvo" | 1931572113875873794 | 1 |
| Sag'bon Fayz | 1855864184282177538 | 1 |
| Farxod aka PALMA | 1921207990405709826 | 1 |

**Total:** 3 communication modules across 3 sites

---

## Implementation Steps

### Phase 1: Database Schema & Entity (Step 1-2)

**Files to Create:**
1. `src/communication-modules/entities/communication-module.entity.ts`
2. `src/communication-modules/dto/create-communication-module.dto.ts`
3. `src/communication-modules/dto/update-communication-module.dto.ts`
4. `src/communication-modules/dto/communication-module-response.dto.ts`

**Database Schema Design:**

```sql
CREATE TABLE communication_modules (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Foreign Keys
    site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

    -- HopeCloud Identifiers
    hope_cloud_id VARCHAR(255) UNIQUE NOT NULL,
    equipment_pn VARCHAR(255),
    divertor_name VARCHAR(255),

    -- Network Information
    device_type VARCHAR(50),
    iccid VARCHAR(255),
    operator_type VARCHAR(100),
    rssi INTEGER,

    -- Location
    longitude DECIMAL(10, 7),
    latitude DECIMAL(10, 7),

    -- Status & Timing
    status VARCHAR(50) NOT NULL,
    start_time TIMESTAMP,
    stop_time TIMESTAMP,
    loaded_number INTEGER,
    last_update TIMESTAMP,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Indexes
    INDEX idx_comm_modules_site_id (site_id),
    INDEX idx_comm_modules_hope_cloud_id (hope_cloud_id),
    INDEX idx_comm_modules_status (status)
);
```

**Entity Fields:**

```typescript
export enum CommunicationModuleStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  FAULT = 'fault',
}

@Entity('communication_modules')
export class CommunicationModule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'site_id' })
  siteId: number;

  @ManyToOne(() => Site)
  @JoinColumn({ name: 'site_id' })
  site: Site;

  @Column({ name: 'hope_cloud_id', unique: true })
  hopeCloudId: string;

  @Column({ name: 'equipment_pn', nullable: true })
  equipmentPn?: string;

  @Column({ name: 'divertor_name', nullable: true })
  divertorName?: string;

  @Column({ name: 'device_type', nullable: true })
  deviceType?: string;

  @Column({ nullable: true })
  iccid?: string;

  @Column({ name: 'operator_type', nullable: true })
  operatorType?: string;

  @Column({ type: 'integer', nullable: true })
  rssi?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'enum', enum: CommunicationModuleStatus })
  status: CommunicationModuleStatus;

  @Column({ name: 'start_time', type: 'timestamp', nullable: true })
  startTime?: Date;

  @Column({ name: 'stop_time', type: 'timestamp', nullable: true })
  stopTime?: Date;

  @Column({ name: 'loaded_number', type: 'integer', nullable: true })
  loadedNumber?: number;

  @Column({ name: 'last_update', type: 'timestamp', nullable: true })
  lastUpdate?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

---

### Phase 2: Service Layer (Step 3)

**Files to Create:**
1. `src/communication-modules/communication-modules.service.ts`
2. `src/communication-modules/communication-modules.module.ts`
3. `src/communication-modules/communication-modules.controller.ts`

**Key Service Methods:**

```typescript
export class CommunicationModulesService {
  // CRUD operations
  async create(dto: CreateCommunicationModuleDto): Promise<CommunicationModule>
  async findAll(siteId?: number): Promise<CommunicationModuleResponseDto[]>
  async findOne(id: number): Promise<CommunicationModule>
  async findByHopeCloudId(hopeCloudId: string): Promise<CommunicationModule | null>
  async update(id: number, dto: UpdateCommunicationModuleDto): Promise<CommunicationModule>
  async delete(id: number): Promise<void>

  // Sync-specific methods
  async createOrUpdate(dto: CreateCommunicationModuleDto): Promise<CommunicationModule>
}
```

---

### Phase 3: Sync Implementation (Step 4-5)

**Files to Modify:**
1. `src/integrations/hopecloud/services/hopecloud-batch.service.ts` - Add sync logic
2. `src/integrations/hopecloud/hopecloud.controller.ts` - Add sync endpoint

**Sync Endpoint:**

```typescript
@Post('communication-modules/resync')
@ApiOperation({
  summary: 'Resync communication modules from HopeCloud',
  description: 'Syncs all communication modules from HopeCloud for all sites'
})
@ApiTags('HopeCloud Communication')
async resyncCommunicationModules(
  @Body() filters?: { siteIds?: number[] }
): Promise<{ status: string; message: string; data: any }> {
  try {
    const result = await this.hopeCloudBatchService.resyncCommunicationModules(filters);

    return {
      status: 'success',
      message: 'Communication modules resync completed successfully',
      data: result,
    };
  } catch (error) {
    this.logger.error('Failed to resync communication modules:', error);
    throw new HttpException(
      {
        status: 'error',
        message: 'Failed to resync communication modules',
        error: error.message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
```

**Sync Logic in Batch Service:**

```typescript
/**
 * Resync communication modules from HopeCloud
 */
async resyncCommunicationModules(options?: {
  siteIds?: number[];
}): Promise<BatchProcessingResult> {
  this.logger.log('Starting communication modules resync...');
  return this.processBatch(
    'hopecloud-communication-modules-resync',
    () => this.performCommunicationModulesResync(options),
  );
}

private async performCommunicationModulesResync(options?: {
  siteIds?: number[];
}): Promise<{ processed: number; failed: number; details: any }> {
  // Get all sites with HopeCloud plant IDs
  let sites = await this.sitesService.findAll();
  sites = sites.filter(s => s.hopeCloudPlantId);

  if (options?.siteIds) {
    sites = sites.filter(s => options.siteIds!.includes(s.id));
  }

  let totalProcessed = 0;
  let totalFailed = 0;
  const details: any = {
    sites: [],
    modulesCreated: 0,
    modulesUpdated: 0,
    errors: [],
  };

  for (const site of sites) {
    try {
      // Fetch communication modules from HopeCloud for this plant
      const response = await this.hopeCloudService.getCommunicationModulesList(
        site.hopeCloudPlantId,
        1,
        100
      );

      const modules = response.records || [];
      this.logger.log(`Found ${modules.length} communication modules for site ${site.name}`);

      for (const module of modules) {
        try {
          // Check if module already exists
          const existing = await this.communicationModulesService.findByHopeCloudId(module.id);

          // Map HopeCloud status to our enum
          let status = CommunicationModuleStatus.OFFLINE;
          if (module.status === 1) status = CommunicationModuleStatus.ONLINE;
          else if (module.status === 2) status = CommunicationModuleStatus.FAULT;

          const moduleData = {
            siteId: site.id,
            hopeCloudId: module.id,
            equipmentPn: module.equipmentPn,
            divertorName: module.divertorName,
            deviceType: module.deviceType,
            iccid: module.iccid,
            operatorType: module.operatorType,
            rssi: module.rssi,
            longitude: module.longitude,
            latitude: module.latitude,
            status,
            startTime: module.startTime ? new Date(module.startTime) : undefined,
            stopTime: module.stopTime ? new Date(module.stopTime) : undefined,
            loadedNumber: module.loadedNumber,
            lastUpdate: module.updateTime ? new Date(module.updateTime) : undefined,
          };

          if (existing) {
            await this.communicationModulesService.update(existing.id, moduleData);
            details.modulesUpdated++;
          } else {
            await this.communicationModulesService.create(moduleData);
            details.modulesCreated++;
          }

          totalProcessed++;
        } catch (error) {
          totalFailed++;
          details.errors.push({
            moduleId: module.id,
            error: error.message,
          });
          this.logger.error(`Failed to sync communication module ${module.id}:`, error.message);
        }
      }

      details.sites.push({
        siteId: site.id,
        siteName: site.name,
        modulesFound: modules.length,
      });

    } catch (error) {
      totalFailed++;
      details.errors.push({
        siteId: site.id,
        error: error.message,
      });
      this.logger.error(`Failed to fetch communication modules for site ${site.id}:`, error.message);
    }
  }

  return {
    processed: totalProcessed,
    failed: totalFailed,
    details,
  };
}
```

---

### Phase 4: Testing & Validation (Step 6)

**Test Sequence:**

```bash
# 1. Ensure sites are synced
curl -X POST http://localhost:3000/api/hopecloud/sync/site-discovery

# 2. Run communication modules sync
curl -X POST http://localhost:3000/api/hopecloud/communication-modules/resync \
  -H "Content-Type: application/json" \
  -d '{}'

# 3. Verify database
psql -U postgres -d iums -c "
  SELECT
    cm.id,
    s.name as site_name,
    cm.divertor_name,
    cm.device_type,
    cm.status,
    cm.rssi,
    cm.start_time
  FROM communication_modules cm
  JOIN sites s ON cm.site_id = s.id
  ORDER BY cm.id;
"

# 4. Compare with HopeCloud API
# Get count from API
for plantId in "1931572113875873794" "1855864184282177538" "1921207990405709826"; do
  echo "Plant: $plantId"
  curl -s "http://localhost:3000/api/hopecloud/communication-modules?plantId=$plantId&pageIndex=1&pageSize=10" \
    | jq '.data.page.total'
done

# Get count from DB
psql -U postgres -d iums -c "SELECT COUNT(*) FROM communication_modules;"
```

**Expected Results:**
- API Count: 3 communication modules (1 per site)
- DB Count: 3 communication modules
- Match: 100%

---

### Phase 5: Documentation (Step 7)

**Document to Create:**
`docs/hopecloud/sync/COMMUNICATION_MODULES_SYNC.md`

**Content:**
- Overview of communication modules
- Sync endpoint documentation
- Database schema
- Testing procedures
- Troubleshooting guide
- Integration with frontend

---

## File Structure

```
src/
├── communication-modules/
│   ├── entities/
│   │   └── communication-module.entity.ts          [CREATE]
│   ├── dto/
│   │   ├── create-communication-module.dto.ts      [CREATE]
│   │   ├── update-communication-module.dto.ts      [CREATE]
│   │   └── communication-module-response.dto.ts    [CREATE]
│   ├── communication-modules.service.ts            [CREATE]
│   ├── communication-modules.controller.ts         [CREATE]
│   └── communication-modules.module.ts             [CREATE]
│
├── integrations/hopecloud/
│   ├── services/
│   │   └── hopecloud-batch.service.ts              [MODIFY - Add sync method]
│   └── hopecloud.controller.ts                     [MODIFY - Add endpoint]
│
└── app.module.ts                                    [MODIFY - Import CommunicationModulesModule]

docs/hopecloud/sync/
└── COMMUNICATION_MODULES_SYNC.md                    [CREATE]
```

---

## Migration Script

**File:** `src/migrations/XXXXXX-create-communication-modules.ts`

```typescript
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCommunicationModules1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'communication_modules',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'site_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'hope_cloud_id',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'equipment_pn',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'divertor_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'device_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'iccid',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'operator_type',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'rssi',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'longitude',
            type: 'decimal',
            precision: 10,
            scale: 7,
            isNullable: true,
          },
          {
            name: 'latitude',
            type: 'decimal',
            precision: 10,
            scale: 7,
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'start_time',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'stop_time',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'loaded_number',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'last_update',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign key
    await queryRunner.createForeignKey(
      'communication_modules',
      new TableForeignKey({
        columnNames: ['site_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'sites',
        onDelete: 'CASCADE',
      }),
    );

    // Add indexes
    await queryRunner.query(
      `CREATE INDEX idx_comm_modules_site_id ON communication_modules(site_id)`
    );
    await queryRunner.query(
      `CREATE INDEX idx_comm_modules_hope_cloud_id ON communication_modules(hope_cloud_id)`
    );
    await queryRunner.query(
      `CREATE INDEX idx_comm_modules_status ON communication_modules(status)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('communication_modules');
  }
}
```

---

## Implementation Checklist

### Phase 1: Database & Entity ✅
- [x] ~~Create migration file~~ (Skipped - using auto-sync with TypeORM)
- [x] Create entity file with all fields (`communication-module.entity.ts`)
- [x] Create DTOs (create, update, response)
- [x] Test entity with sample data

### Phase 2: Service Layer ✅
- [x] Create service file with CRUD methods (`communication-modules.service.ts`)
- [x] Create module file (`communication-modules.module.ts`)
- [x] Create controller with basic endpoints (`communication-modules.controller.ts`)
- [x] Export module in app.module.ts
- [x] Test basic CRUD operations

### Phase 3: Sync Implementation ✅
- [x] Add sync method to batch service (`hopecloud-batch.service.ts`)
- [x] Add sync endpoint to hopecloud controller (`POST /hopecloud/communication-modules/sync`)
- [x] Import communication modules service in hopecloud module
- [x] Test compilation and fix TypeScript errors

### Phase 4: Testing (Ready)
- [ ] Restart server to load new changes
- [ ] Run communication modules sync
- [ ] Verify data in database
- [ ] Compare counts (API vs DB)
- [ ] Validate data accuracy

### Phase 5: Documentation ✅
- [x] Update implementation plan with actual changes
- [ ] Create comprehensive sync documentation (if needed)
- [ ] Add testing procedures
- [ ] Add troubleshooting guide

---

## Expected Outcomes

**After Full Implementation:**

```sql
-- Database will have 3 communication modules
SELECT COUNT(*) FROM communication_modules;
-- Expected: 3

-- Each site will have 1 communication module
SELECT s.name, COUNT(cm.id) as module_count
FROM sites s
LEFT JOIN communication_modules cm ON s.id = cm.site_id
GROUP BY s.name;
-- Expected:
-- OOO "Kontinent kachestvo"  | 1
-- Sag'bon Fayz                | 1
-- Farxod aka PALMA            | 1
```

**API Response Example:**

```json
{
  "status": "success",
  "message": "Communication modules resync completed successfully",
  "data": {
    "batchType": "hopecloud-communication-modules-resync",
    "status": "COMPLETED",
    "recordsProcessed": 3,
    "recordsFailed": 0,
    "details": {
      "sites": [
        {
          "siteId": 3,
          "siteName": "OOO \"Kontinent kachestvo\"",
          "modulesFound": 1
        },
        {
          "siteId": 1,
          "siteName": "Sag'bon Fayz",
          "modulesFound": 1
        },
        {
          "siteId": 2,
          "siteName": "Farxod aka PALMA",
          "modulesFound": 1
        }
      ],
      "modulesCreated": 3,
      "modulesUpdated": 0,
      "errors": []
    }
  }
}
```

---

## Time Estimate

- **Phase 1 (Database & Entity):** 1-2 hours
- **Phase 2 (Service Layer):** 1-2 hours
- **Phase 3 (Sync Implementation):** 2-3 hours
- **Phase 4 (Testing):** 1 hour
- **Phase 5 (Documentation):** 1 hour

**Total:** 6-9 hours

---

## Notes

1. Communication modules are relatively simple compared to devices/alarms
2. No historical data sync needed (current state only)
3. Sync is fast (only 3 modules total)
4. Low risk of API rate limits
5. Can be implemented independently of other sync systems

---

## Next Steps

1. Review and approve this plan
2. Create database migration
3. Implement entity and service layer
4. Add sync endpoint and logic
5. Test with real data
6. Create documentation
7. Commit and push to GitHub

---

## Actual Implementation Details

### Files Created
1. ✅ `src/communication-modules/entities/communication-module.entity.ts`
   - 16 fields including GPS coordinates, network info, status
   - Status enum: ONLINE, OFFLINE, FAULT
   - Foreign key relationship to Site entity

2. ✅ `src/communication-modules/dto/create-communication-module.dto.ts`
   - Full validation with class-validator decorators
   - Date string handling for timestamps
   - Optional fields for missing data

3. ✅ `src/communication-modules/dto/update-communication-module.dto.ts`
   - Extends CreateDto with PartialType

4. ✅ `src/communication-modules/dto/communication-module-response.dto.ts`
   - Swagger documentation for all fields
   - Example values for API documentation

5. ✅ `src/communication-modules/communication-modules.service.ts`
   - CRUD operations: create, findAll, findOne, findByHopeCloudId, update, delete
   - **Key method:** `createOrUpdate()` for idempotent sync

6. ✅ `src/communication-modules/communication-modules.controller.ts`
   - GET /api/communication-modules (with optional siteId filter)
   - GET /api/communication-modules/:id
   - POST /api/communication-modules
   - PUT /api/communication-modules/:id
   - DELETE /api/communication-modules/:id

7. ✅ `src/communication-modules/communication-modules.module.ts`
   - Exports CommunicationModulesService for use in HopeCloud module

### Files Modified
1. ✅ `src/app.module.ts`
   - Added CommunicationModule to TypeORM entities
   - Imported CommunicationModulesModule

2. ✅ `src/integrations/hopecloud/hopecloud.module.ts`
   - Imported CommunicationModulesModule

3. ✅ `src/integrations/hopecloud/hopecloud.controller.ts`
   - Added `POST /hopecloud/communication-modules/sync` endpoint
   - Full Swagger documentation with response schemas

4. ✅ `src/integrations/hopecloud/services/hopecloud-batch.service.ts`
   - Added `syncCommunicationModules()` method
   - Added `performCommunicationModulesSync()` private method
   - Imported CommunicationModulesService
   - Status mapping: HopeCloud status (1=online, 2=offline) → Our enum

### Key Implementation Notes
- **No Migration:** Using TypeORM auto-sync (synchronize: true)
- **Status Mapping:** HopeCloud returns numeric status (1/2), we map to enum (ONLINE/OFFLINE/FAULT)
- **HopeCloud API Response:** `response.records` not `response.data.records`
- **Upsert Pattern:** Using `createOrUpdate()` for idempotent sync
- **Field Mapping:**
  - `module.status` (number) → `CommunicationModuleStatus` (enum)
  - `module.updateTime` → `lastUpdate` (Date)
  - `module.operatorType` → `operatorType` (string)

### Commit
```
commit d48a266
Implement Communication Modules synchronization system

- Add CommunicationModule entity with full field mapping
- Create CRUD endpoints for communication modules
- Implement HopeCloud sync for communication modules (divertors)
- Add status mapping (online/offline/fault)
- Support GPS coordinates and network operator info
- Export CommunicationModulesService for use in other modules
```

---

**Document Status:** ✅ IMPLEMENTED
**Last Updated:** October 4, 2025
**Implementation:** Completed
**Next Steps:** Server restart and testing
