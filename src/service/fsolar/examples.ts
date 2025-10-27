/**
 * Fsolar API Usage Examples
 *
 * This file demonstrates how to use all Fsolar services
 * These are example functions that can be used as reference
 */

import {
  fsolarAuthService,
  fsolarDeviceService,
  fsolarTemplateService,
  fsolarTaskService,
  fsolarMonitorService,
  fsolarRecordService,
  toFsolarDate,
  getLastNDaysRange,
  TIME_DIMENSION,
  ALARM_LEVEL,
} from './index';

// ============================================
// 1. Authentication Examples
// ============================================

/**
 * Check if Fsolar is authenticated
 */
export async function checkAuthenticationExample() {
  try {
    const status = await fsolarAuthService.getAuthStatus();
    console.log('Authenticated:', status.authenticated);
    console.log('Token expires:', status.tokenExpiry);
    console.log('Time until expiry:', status.timeUntilTokenExpiry);
    return status;
  } catch (error) {
    console.error('Failed to check auth status:', error);
    throw error;
  }
}

/**
 * Manual login (usually not needed, backend handles automatically)
 */
export async function loginExample() {
  try {
    const tokens = await fsolarAuthService.login();
    console.log('Logged in successfully');
    return tokens;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

// ============================================
// 2. Device Management Examples
// ============================================

/**
 * Get list of devices with pagination
 */
export async function getDevicesExample() {
  try {
    const devices = await fsolarDeviceService.getDeviceList({
      pageNum: 1,
      pageSize: 20,
    });
    console.log(`Found ${devices.total} devices`);
    console.log('Devices:', devices.dataList);
    return devices;
  } catch (error) {
    console.error('Failed to get devices:', error);
    throw error;
  }
}

/**
 * Get all devices (auto-pagination)
 */
export async function getAllDevicesExample() {
  try {
    const devices = await fsolarDeviceService.getAllDevices();
    console.log(`Total devices: ${devices.length}`);
    return devices;
  } catch (error) {
    console.error('Failed to get all devices:', error);
    throw error;
  }
}

/**
 * Get device basic information
 */
export async function getDeviceInfoExample(deviceSn: string) {
  try {
    const device = await fsolarDeviceService.getDeviceBasicInfo(deviceSn);
    console.log('Device info:', device);
    return device;
  } catch (error) {
    console.error('Failed to get device info:', error);
    throw error;
  }
}

/**
 * Get device energy data
 */
export async function getDeviceEnergyExample(deviceSn: string) {
  try {
    const today = toFsolarDate(new Date());
    const energyData = await fsolarDeviceService.getDeviceEnergy({
      deviceSn,
      date: today,
      timeDimension: TIME_DIMENSION.DAY,
    });
    console.log('Energy data:', energyData);
    return energyData;
  } catch (error) {
    console.error('Failed to get energy data:', error);
    throw error;
  }
}

/**
 * Get device events/alarms
 */
export async function getDeviceEventsExample(deviceSn: string) {
  try {
    const { start, end } = getLastNDaysRange(7);
    const events = await fsolarDeviceService.getDeviceEvents(deviceSn, {
      pageNum: 1,
      pageSize: 20,
      startTime: start,
      endTime: end,
      alarmLevel: ALARM_LEVEL.CRITICAL,
    });
    console.log('Device events:', events);
    return events;
  } catch (error) {
    console.error('Failed to get device events:', error);
    throw error;
  }
}

/**
 * Add new devices
 */
export async function addDevicesExample() {
  try {
    const result = await fsolarDeviceService.addDevices({
      deviceSaveInfoList: [
        {
          deviceSn: 'TEST001',
          deviceType: 'Inverter',
          deviceName: 'Test Inverter 1',
        },
      ],
    });
    console.log('Add devices result:', result);
    return result;
  } catch (error) {
    console.error('Failed to add devices:', error);
    throw error;
  }
}

/**
 * Delete devices
 */
export async function deleteDevicesExample(deviceSns: string[]) {
  try {
    const result = await fsolarDeviceService.deleteDevices(deviceSns);
    console.log('Delete result:', result);
    return result;
  } catch (error) {
    console.error('Failed to delete devices:', error);
    throw error;
  }
}

// ============================================
// 3. Economic Strategy Template Examples
// ============================================

/**
 * List templates
 */
export async function listTemplatesExample() {
  try {
    const templates = await fsolarTemplateService.listTemplates({
      pageNum: 1,
      pageSize: 20,
    });
    console.log('Templates:', templates);
    return templates;
  } catch (error) {
    console.error('Failed to list templates:', error);
    throw error;
  }
}

/**
 * Create new template
 */
export async function createTemplateExample() {
  try {
    const template = await fsolarTemplateService.addTemplate({
      templateName: 'Morning Peak Strategy',
      strategy1: fsolarTemplateService.createActiveSlot('06:00', '09:00', 1, 5000),
      strategy2: fsolarTemplateService.createActiveSlot('12:00', '14:00', 2, 3000),
      strategy3: fsolarTemplateService.createEmptySlot(),
      strategy4: fsolarTemplateService.createEmptySlot(),
    });
    console.log('Created template:', template);
    return template;
  } catch (error) {
    console.error('Failed to create template:', error);
    throw error;
  }
}

/**
 * Get template details
 */
export async function getTemplateExample(templateId: number) {
  try {
    const template = await fsolarTemplateService.getTemplate(templateId);
    console.log('Template details:', template);
    return template;
  } catch (error) {
    console.error('Failed to get template:', error);
    throw error;
  }
}

/**
 * Update template
 */
export async function updateTemplateExample(templateId: number) {
  try {
    const updated = await fsolarTemplateService.updateTemplate(templateId, {
      templateName: 'Updated Morning Peak Strategy',
      strategy1: fsolarTemplateService.createActiveSlot('07:00', '10:00', 1, 6000),
      strategy2: fsolarTemplateService.createEmptySlot(),
      strategy3: fsolarTemplateService.createEmptySlot(),
      strategy4: fsolarTemplateService.createEmptySlot(),
    });
    console.log('Updated template:', updated);
    return updated;
  } catch (error) {
    console.error('Failed to update template:', error);
    throw error;
  }
}

/**
 * Delete template
 */
export async function deleteTemplateExample(templateId: number) {
  try {
    await fsolarTemplateService.deleteTemplate(templateId);
    console.log('Template deleted');
  } catch (error) {
    console.error('Failed to delete template:', error);
    throw error;
  }
}

// ============================================
// 4. Economic Task Examples
// ============================================

/**
 * List tasks
 */
export async function listTasksExample() {
  try {
    const tasks = await fsolarTaskService.listTasks({
      pageNum: 1,
      pageSize: 20,
    });
    console.log('Tasks:', tasks);
    return tasks;
  } catch (error) {
    console.error('Failed to list tasks:', error);
    throw error;
  }
}

/**
 * Create new task
 */
export async function createTaskExample(templateId: number, deviceIds: number[]) {
  try {
    const task = await fsolarTaskService.addTask({
      taskName: 'Evening Peak Task',
      templateId,
      taskType: 'device',
      deviceIdList: deviceIds,
    });
    console.log('Created task:', task);
    return task;
  } catch (error) {
    console.error('Failed to create task:', error);
    throw error;
  }
}

/**
 * Get task details (devices)
 */
export async function getTaskDetailsExample(taskId: number) {
  try {
    const devices = await fsolarTaskService.getTaskDetail(taskId);
    console.log('Task devices:', devices);
    return devices;
  } catch (error) {
    console.error('Failed to get task details:', error);
    throw error;
  }
}

/**
 * Run task
 */
export async function runTaskExample(taskId: number) {
  try {
    const result = await fsolarTaskService.runTaskNormal(taskId);
    console.log('Task started:', result);
    console.log('Run task record ID:', result.runTaskRecordId);
    return result;
  } catch (error) {
    console.error('Failed to run task:', error);
    throw error;
  }
}

// ============================================
// 5. Task Monitoring Examples
// ============================================

/**
 * Monitor task execution with callback-based API
 */
export async function monitorTaskWithCallbacksExample(
  taskId: number,
  runTaskRecordId: number
) {
  const monitor = fsolarMonitorService.createMonitor(runTaskRecordId, taskId);

  monitor.start(
    // onUpdate - called every 5 seconds while task is running
    (status) => {
      const progress = fsolarMonitorService.getProgressPercentage(status);
      const summary = fsolarMonitorService.getTaskSummary(status);
      const timeLeft = fsolarMonitorService.formatRemainingTime(status);

      console.log(`Progress: ${progress}%`);
      console.log(`Success: ${summary.success}, Failed: ${summary.failed}`);
      console.log(`Time remaining: ${timeLeft}`);
    },
    // onComplete - called when task finishes
    (status) => {
      const summary = fsolarMonitorService.getTaskSummary(status);
      console.log('Task completed!');
      console.log(`Final results: ${summary.success} successful, ${summary.failed} failed`);
      console.log(`Success rate: ${summary.successRate}%`);
    },
    // onError - called if monitoring fails
    (error) => {
      console.error('Monitoring failed:', error);
    }
  );

  // Return monitor instance so caller can stop it if needed
  return monitor;
}

/**
 * Monitor task execution with promise-based API
 */
export async function monitorTaskWithPromiseExample(
  taskId: number,
  runTaskRecordId: number
) {
  try {
    const finalStatus = await fsolarMonitorService.monitorTaskUntilComplete(
      runTaskRecordId,
      taskId,
      {
        onUpdate: (status) => {
          const progress = fsolarMonitorService.getProgressPercentage(status);
          console.log(`Progress: ${progress}%`);
        },
      }
    );

    const summary = fsolarMonitorService.getTaskSummary(finalStatus);
    console.log('Task completed successfully!');
    console.log('Summary:', summary);
    return finalStatus;
  } catch (error) {
    console.error('Task monitoring failed:', error);
    throw error;
  }
}

/**
 * Run task and monitor until completion (complete workflow)
 */
export async function runAndMonitorTaskExample(taskId: number) {
  try {
    // 1. Start the task
    console.log('Starting task...');
    const runResult = await fsolarTaskService.runTaskNormal(taskId);
    console.log(`Task started with record ID: ${runResult.runTaskRecordId}`);

    // 2. Monitor until completion
    console.log('Monitoring task execution...');
    const finalStatus = await fsolarMonitorService.monitorTaskUntilComplete(
      parseInt(runResult.runTaskRecordId),
      taskId,
      {
        onUpdate: (status) => {
          const progress = fsolarMonitorService.getProgressPercentage(status);
          const timeLeft = fsolarMonitorService.formatRemainingTime(status);
          console.log(`Progress: ${progress}% | Time left: ${timeLeft}`);
        },
      }
    );

    // 3. Display final results
    const summary = fsolarMonitorService.getTaskSummary(finalStatus);
    console.log('\n=== Task Completed ===');
    console.log(`Total devices: ${summary.total}`);
    console.log(`Successful: ${summary.success}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Success rate: ${summary.successRate}%`);

    if (summary.failed > 0) {
      const failedDevices = fsolarMonitorService.getFailedDevices(finalStatus);
      console.log('Failed devices:', failedDevices);
    }

    return finalStatus;
  } catch (error) {
    console.error('Task execution failed:', error);
    throw error;
  }
}

// ============================================
// 6. Task Run Records Examples
// ============================================

/**
 * List run records
 */
export async function listRunRecordsExample() {
  try {
    const records = await fsolarRecordService.listRunRecords({
      pageNum: 1,
      pageSize: 20,
    });
    console.log('Run records:', records);
    return records;
  } catch (error) {
    console.error('Failed to list run records:', error);
    throw error;
  }
}

/**
 * Get run record details
 */
export async function getRunRecordDetailsExample(recordId: number) {
  try {
    const detail = await fsolarRecordService.getRunRecordDetail(recordId);
    const summary = fsolarRecordService.getDetailedSummary(detail);

    console.log('Run record detail:', detail);
    console.log('Summary:', summary);

    if (summary.devices.failed.length > 0) {
      console.log('Failed devices:', summary.devices.failed);
    }

    return detail;
  } catch (error) {
    console.error('Failed to get run record details:', error);
    throw error;
  }
}

/**
 * Get completed run records
 */
export async function getCompletedRecordsExample() {
  try {
    const records = await fsolarRecordService.getCompletedRunRecords(1, 20);
    console.log('Completed records:', records);
    return records;
  } catch (error) {
    console.error('Failed to get completed records:', error);
    throw error;
  }
}

/**
 * Get failed run records
 */
export async function getFailedRecordsExample() {
  try {
    const records = await fsolarRecordService.getFailedRunRecords(1, 20);
    console.log('Failed records:', records);
    return records;
  } catch (error) {
    console.error('Failed to get failed records:', error);
    throw error;
  }
}

/**
 * Export run records to CSV
 */
export async function exportRecordsToCSVExample() {
  try {
    const records = await fsolarRecordService.getAllRunRecords();
    const csv = fsolarRecordService.exportToCSV(records);
    console.log('CSV export ready');
    return csv;
  } catch (error) {
    console.error('Failed to export records:', error);
    throw error;
  }
}

// ============================================
// 7. Complete Workflow Examples
// ============================================

/**
 * Complete workflow: Create template, create task, run and monitor
 */
export async function completeWorkflowExample(deviceIds: number[]) {
  try {
    // 1. Create a strategy template
    console.log('Step 1: Creating strategy template...');
    const template = await fsolarTemplateService.addTemplate({
      templateName: 'Auto Test Strategy',
      strategy1: fsolarTemplateService.createActiveSlot('08:00', '12:00', 1, 5000),
      strategy2: fsolarTemplateService.createEmptySlot(),
      strategy3: fsolarTemplateService.createEmptySlot(),
      strategy4: fsolarTemplateService.createEmptySlot(),
    });
    console.log(`✓ Template created: ${template.templateName} (ID: ${template.id})`);

    // 2. Create a task using the template
    console.log('\nStep 2: Creating task...');
    const task = await fsolarTaskService.addTask({
      taskName: 'Auto Test Task',
      templateId: parseInt(template.id),
      taskType: 'device',
      deviceIdList: deviceIds,
    });
    console.log(`✓ Task created: ${task.taskName} (ID: ${task.id})`);

    // 3. Run the task
    console.log('\nStep 3: Running task...');
    const runResult = await fsolarTaskService.runTaskNormal(parseInt(task.id));
    console.log(`✓ Task started (Record ID: ${runResult.runTaskRecordId})`);

    // 4. Monitor execution
    console.log('\nStep 4: Monitoring execution...');
    const finalStatus = await fsolarMonitorService.monitorTaskUntilComplete(
      parseInt(runResult.runTaskRecordId),
      parseInt(task.id),
      {
        onUpdate: (status) => {
          const progress = fsolarMonitorService.getProgressPercentage(status);
          console.log(`  Progress: ${progress}%`);
        },
      }
    );

    // 5. Show final results
    const summary = fsolarMonitorService.getTaskSummary(finalStatus);
    console.log('\n=== Workflow Completed ===');
    console.log(`Template: ${template.templateName}`);
    console.log(`Task: ${task.taskName}`);
    console.log(`Results: ${summary.success}/${summary.total} successful (${summary.successRate}%)`);

    return {
      template,
      task,
      runResult,
      finalStatus,
      summary,
    };
  } catch (error) {
    console.error('Workflow failed:', error);
    throw error;
  }
}
