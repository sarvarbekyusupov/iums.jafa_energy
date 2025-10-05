# Separate Date Ranges for Each Tab - Technical Documentation

## Problem Statement

Previously, all three tabs (Daily, Monthly, Yearly) shared a single `statsDateRange` state variable. This caused a bug where:
1. User opens Daily tab → sees last 30 days ✅
2. User switches to Monthly tab → component sets range to last 6 months
3. User switches back to Daily tab → Daily now shows last 6 months ❌ (WRONG!)

The issue was that changing tabs would overwrite the date range for all tabs.

## Solution

Implemented **separate, independent date range states** for each tab:
- `dailyDateRange` - for Daily tab
- `monthlyDateRange` - for Monthly tab  
- `yearlyDateRange` - for Yearly tab

## Technical Implementation

### 1. State Variables (Lines 37-54)

```typescript
// Separate date ranges for each tab
const [dailyDateRange, setDailyDateRange] = useState(() => {
  const endDate = dayjs();
  const startDate = endDate.subtract(30, 'days');
  return { startDate, endDate };
});

const [monthlyDateRange, setMonthlyDateRange] = useState(() => {
  const endDate = dayjs();
  const startDate = endDate.subtract(6, 'months');
  return { startDate, endDate };
});

const [yearlyDateRange, setYearlyDateRange] = useState(() => {
  const endDate = dayjs();
  const startDate = endDate.subtract(5, 'years');
  return { startDate, endDate };
});
```

**Key Points:**
- Each state initialized with its own default range
- Initialization happens only once (lazy initialization)
- Each tab maintains its own independent state

### 2. Helper Functions (Lines 56-83)

```typescript
// Helper to get current tab's date range
const getCurrentDateRange = () => {
  switch (activeTab) {
    case 'daily':
      return dailyDateRange;
    case 'monthly':
      return monthlyDateRange;
    case 'yearly':
      return yearlyDateRange;
    default:
      return dailyDateRange;
  }
};

// Helper to set current tab's date range
const setCurrentDateRange = (newRange: { startDate: dayjs.Dayjs; endDate: dayjs.Dayjs }) => {
  switch (activeTab) {
    case 'daily':
      setDailyDateRange(newRange);
      break;
    case 'monthly':
      setMonthlyDateRange(newRange);
      break;
    case 'yearly':
      setYearlyDateRange(newRange);
      break;
  }
};
```

**Purpose:**
- `getCurrentDateRange()` - Returns the active tab's date range
- `setCurrentDateRange()` - Updates only the active tab's date range

### 3. Data Fetching (Lines 141-143)

```typescript
const fetchStatsData = async () => {
  // ...
  const currentRange = getCurrentDateRange();
  const startDate = currentRange.startDate.format('YYYY-MM-DD');
  const endDate = currentRange.endDate.format('YYYY-MM-DD');
  // ...
}
```

**Changed:** Now uses `getCurrentDateRange()` to get the correct range for the active tab.

### 4. Date Picker Integration (Lines 404-413)

```typescript
<DatePicker.RangePicker
  value={[getCurrentDateRange().startDate, getCurrentDateRange().endDate]}
  onChange={(dates) => {
    if (dates && dates[0] && dates[1]) {
      setCurrentDateRange({
        startDate: dates[0],
        endDate: dates[1],
      });
    }
  }}
  // ...
/>
```

**Changed:** 
- `value` now reads from current tab's range
- `onChange` now updates only current tab's range

### 5. useEffect Dependencies (Lines 272-274)

```typescript
useEffect(() => {
  fetchStatsData();
}, [activeTab, dailyDateRange, monthlyDateRange, yearlyDateRange, stationId]);
```

**Changed:** Now watches all three date ranges, so data fetches when any range changes.

## Default Date Ranges

| Tab | Default Range | Example |
|-----|---------------|---------|
| **Daily** | Last 30 days | 2025-09-04 → 2025-10-04 |
| **Monthly** | Last 6 months | 2025-04 → 2025-10 |
| **Yearly** | Last 5 years | 2020 → 2025 |

## User Experience Flow

### Scenario 1: Tab Switching
```
1. User opens modal → Daily tab shows (Sep 4 - Oct 4)
2. User clicks Monthly → Monthly shows (Apr - Oct)
3. User clicks back to Daily → Daily STILL shows (Sep 4 - Oct 4) ✅
```

### Scenario 2: Custom Date Selection
```
1. User on Daily tab → Changes to (Sep 1 - Sep 30)
2. User switches to Monthly → Shows default (Apr - Oct)
3. User changes Monthly to (Jan - Oct)
4. User switches back to Daily → Shows (Sep 1 - Sep 30) ✅
   User switches back to Monthly → Shows (Jan - Oct) ✅
```

## Benefits

✅ **Independent State** - Each tab maintains its own date range
✅ **No Cross-Contamination** - Changing one tab doesn't affect others
✅ **Persistent Selection** - User's date choice persists when switching tabs
✅ **Better UX** - Intuitive behavior matching user expectations

## Files Modified

- **src/components/SyncedSiteHistory.tsx**
  - Lines 37-83: New state variables and helper functions
  - Lines 141-143: Updated data fetching to use current range
  - Lines 184-186: Updated monthly zero-filling
  - Lines 221-222: Updated yearly zero-filling
  - Lines 272-274: Updated useEffect dependencies
  - Lines 404-413: Updated DatePicker integration

## Testing Checklist

- [x] Open Daily tab → sees last 30 days
- [x] Switch to Monthly → sees last 6 months
- [x] Switch back to Daily → still sees last 30 days (not 6 months!)
- [x] Change Daily date range → switch tabs → come back → custom range preserved
- [x] Change Monthly date range → switch tabs → come back → custom range preserved
- [x] All three tabs can have different date ranges simultaneously

## Code Quality

- **Clean Architecture** - Helper functions encapsulate state logic
- **Type Safety** - All functions properly typed with TypeScript
- **Maintainable** - Easy to add more tabs or change default ranges
- **No Breaking Changes** - Same API, just better state management

## Performance Impact

**Minimal** - Only three additional state variables, no performance degradation.

## Migration Notes

No migration needed - this is a bug fix, not a breaking change.

---

**Author:** Claude  
**Date:** October 4, 2025  
**Status:** ✅ Implemented and Tested
