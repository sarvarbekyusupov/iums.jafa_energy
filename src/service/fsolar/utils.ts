// Fsolar Utility Functions

// ============================================
// Date Formatting
// ============================================

/**
 * Format date to Fsolar date format (YYYYMMDD)
 */
export function toFsolarDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Convert date to Fsolar timestamp (milliseconds)
 */
export function toFsolarTimestamp(date: Date): number {
  return date.getTime();
}

/**
 * Parse Fsolar timestamp to Date
 */
export function fromFsolarTimestamp(timestamp: string | number): Date {
  return new Date(parseInt(timestamp.toString()));
}

/**
 * Get today's date in Fsolar format
 */
export function getTodayFsolarDate(): string {
  return toFsolarDate(new Date());
}

/**
 * Get date range for last N days
 */
export function getLastNDaysRange(days: number): { start: number; end: number } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  return {
    start: toFsolarTimestamp(start),
    end: toFsolarTimestamp(end)
  };
}

// ============================================
// Validation
// ============================================

/**
 * Validate device serial number
 */
export function validateDeviceSn(deviceSn: string): string {
  if (!deviceSn || deviceSn.trim() === '') {
    throw new Error('Device SN is required');
  }
  return deviceSn.trim();
}

/**
 * Validate date range (max 7 days for events)
 */
export function validateDateRange(startTime: number, endTime: number, maxDays: number = 7): void {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays > maxDays) {
    throw new Error(`Date range cannot exceed ${maxDays} days`);
  }

  if (start > end) {
    throw new Error('Start time must be before end time');
  }
}

/**
 * Validate pagination parameters
 */
export function validatePagination(pageNum: number, pageSize: number): void {
  if (pageNum < 1) {
    throw new Error('Page number must be at least 1');
  }
  if (pageSize < 1 || pageSize > 1000) {
    throw new Error('Page size must be between 1 and 1000');
  }
}

/**
 * Validate Fsolar date format (YYYYMMDD)
 */
export function validateFsolarDate(dateStr: string): void {
  const regex = /^\d{8}$/;
  if (!regex.test(dateStr)) {
    throw new Error('Date must be in YYYYMMDD format');
  }

  const month = parseInt(dateStr.substring(4, 6));
  const day = parseInt(dateStr.substring(6, 8));

  if (month < 1 || month > 12) {
    throw new Error('Invalid month in date');
  }
  if (day < 1 || day > 31) {
    throw new Error('Invalid day in date');
  }
}

// ============================================
// Array Helpers
// ============================================

/**
 * Convert array to comma-separated string
 */
export function arrayToCommaString(arr: (string | number)[]): string {
  return arr.join(',');
}

/**
 * Convert comma-separated string to array
 */
export function commaStringToArray(str: string): string[] {
  return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

// ============================================
// Error Messages
// ============================================

export const FSOLAR_ERROR_MESSAGES = {
  SERVER_BUSY: 'Server busy',
  TOKEN_EXPIRED: 'Token expired',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  DEVICE_NOT_EXIST: 'Device does not exist',
  UNAUTHORIZED_DEVICE: 'User is not authorized to operate the device',
} as const;

/**
 * Check if error is a known Fsolar error
 */
export function isFsolarError(message: string): boolean {
  return Object.values(FSOLAR_ERROR_MESSAGES).includes(message as any);
}

/**
 * Get user-friendly error message
 */
export function getFriendlyErrorMessage(message: string): string {
  const errorMap: Record<string, string> = {
    [FSOLAR_ERROR_MESSAGES.SERVER_BUSY]: 'Fsolar server is busy. Please try again in a moment.',
    [FSOLAR_ERROR_MESSAGES.TOKEN_EXPIRED]: 'Session expired. Reconnecting...',
    [FSOLAR_ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS]: 'You do not have permission to perform this action.',
    [FSOLAR_ERROR_MESSAGES.DEVICE_NOT_EXIST]: 'Device not found. Please verify the device serial number.',
    [FSOLAR_ERROR_MESSAGES.UNAUTHORIZED_DEVICE]: 'You do not have access to this device.',
  };

  return errorMap[message] || message;
}

// ============================================
// Cache Implementation
// ============================================

interface CacheItem<T> {
  value: T;
  timestamp: number;
}

export class APICache<T = any> {
  private cache: Map<string, CacheItem<T>>;
  private ttl: number;

  constructor(ttl: number = 60000) { // Default 1 minute
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key: string, value: T): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  size(): number {
    return this.cache.size;
  }
}

// ============================================
// Task Status Helpers
// ============================================

export const TASK_STATUS = {
  RUNNING: 0,
  DONE: 1,
} as const;

export const COMMAND_STATUS = {
  FAILED: 0,
  SUCCESS: 1,
  WAITING: 2,
} as const;

export const RUN_TYPE = {
  NORMAL: 0,
  RESEND: 1,
} as const;

export const TIME_DIMENSION = {
  DAY: 1,
  MONTH: 2,
  YEAR: 3,
} as const;

export const ALARM_LEVEL = {
  CRITICAL: 1,
  MAJOR: 2,
  MINOR: 3,
  WARNING: 4,
} as const;

/**
 * Get task status label
 */
export function getTaskStatusLabel(status: number): string {
  return status === TASK_STATUS.RUNNING ? 'Running' : 'Completed';
}

/**
 * Get command status label
 */
export function getCommandStatusLabel(status: number): string {
  switch (status) {
    case COMMAND_STATUS.FAILED:
      return 'Failed';
    case COMMAND_STATUS.SUCCESS:
      return 'Success';
    case COMMAND_STATUS.WAITING:
      return 'Waiting';
    default:
      return 'Unknown';
  }
}

/**
 * Get alarm level label
 */
export function getAlarmLevelLabel(level: number): string {
  switch (level) {
    case ALARM_LEVEL.CRITICAL:
      return 'Critical';
    case ALARM_LEVEL.MAJOR:
      return 'Major';
    case ALARM_LEVEL.MINOR:
      return 'Minor';
    case ALARM_LEVEL.WARNING:
      return 'Warning';
    default:
      return 'Unknown';
  }
}

// ============================================
// Retry Logic
// ============================================

export interface RetryOptions {
  maxRetries: number;
  retryDelay: number; // milliseconds
  retryOn?: (error: any) => boolean;
}

/**
 * Retry async function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = { maxRetries: 3, retryDelay: 1000 }
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Check if we should retry this error
      if (options.retryOn && !options.retryOn(error)) {
        throw error;
      }

      // Don't wait after the last attempt
      if (attempt < options.maxRetries) {
        const delay = options.retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Check if error should be retried (e.g., server busy)
 */
export function shouldRetryError(error: any): boolean {
  const message = error?.response?.data?.message || error?.message || '';
  return message === FSOLAR_ERROR_MESSAGES.SERVER_BUSY;
}
