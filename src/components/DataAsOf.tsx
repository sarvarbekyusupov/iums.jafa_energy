import React from 'react';
import { Tag, Tooltip, Typography } from 'antd';
import { ClockCircleOutlined, DatabaseOutlined, WarningOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

export type DataFreshness = 'fresh' | 'stale' | 'dead' | 'unknown';

/** Minutes after which stored data is considered stale / dead. Mirrors SYNC_STALE_MINUTES / SYNC_DEAD_MINUTES on the backend. */
export const STALE_AFTER_MINUTES = 30;
export const DEAD_AFTER_MINUTES = 24 * 60;

export interface DataAsOfProps {
  /** Newest data point we hold (ISO string or Date). null/undefined = nothing stored yet. */
  timestamp?: string | Date | null;
  /** Prefix label, default "Data as of". */
  label?: string;
  /** Backend-computed status; when omitted it is derived from the timestamp age. */
  status?: DataFreshness;
  /** Show only the relative age (compact form for table headers / cards). */
  compact?: boolean;
  style?: React.CSSProperties;
}

export function freshnessOf(timestamp?: string | Date | null): DataFreshness {
  if (!timestamp) return 'unknown';
  const t = dayjs(timestamp);
  if (!t.isValid()) return 'unknown';
  const ageMinutes = dayjs().diff(t, 'minute');
  if (ageMinutes <= STALE_AFTER_MINUTES) return 'fresh';
  if (ageMinutes <= DEAD_AFTER_MINUTES) return 'stale';
  return 'dead';
}

export function relativeAge(timestamp?: string | Date | null): string {
  if (!timestamp) return 'no stored data yet';
  const t = dayjs(timestamp);
  if (!t.isValid()) return 'unknown time';
  const minutes = Math.max(0, dayjs().diff(t, 'minute'));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  return `${days} d ago`;
}

const COLORS: Record<DataFreshness, string> = {
  fresh: 'green',
  stale: 'gold',
  dead: 'red',
  unknown: 'default',
};

/**
 * "Data as of <time>" badge for pages that render stored (database) data.
 * Green when the newest row is recent, gold when the sync is behind, red when
 * we have not received anything for a day, grey when the table is empty.
 */
const DataAsOf: React.FC<DataAsOfProps> = ({ timestamp, label = 'Data as of', status, compact = false, style }) => {
  const freshness = status ?? freshnessOf(timestamp);
  const t = timestamp ? dayjs(timestamp) : null;
  const absolute = t && t.isValid() ? t.format('YYYY-MM-DD HH:mm') : null;
  const age = relativeAge(timestamp);
  const icon = freshness === 'fresh' ? <DatabaseOutlined /> : freshness === 'unknown' ? <ClockCircleOutlined /> : <WarningOutlined />;

  const tooltip =
    freshness === 'unknown'
      ? 'Nothing has been synced into the database yet.'
      : freshness === 'fresh'
        ? `Stored data is current (newest row ${absolute}).`
        : freshness === 'stale'
          ? `Sync is behind: newest stored row is from ${absolute}. The vendor API may be unreachable; showing the last known data.`
          : `No new data for more than a day (newest stored row ${absolute}). Check the vendor connection.`;

  return (
    <Tooltip title={tooltip}>
      <Tag icon={icon} color={COLORS[freshness]} style={{ margin: 0, ...style }}>
        {compact ? (
          age
        ) : (
          <>
            {label}: {absolute ?? '—'}
            {absolute && (
              <Text type="secondary" style={{ marginLeft: 6, fontSize: 12 }}>
                ({age})
              </Text>
            )}
            {!absolute && <span style={{ marginLeft: 6 }}>{age}</span>}
          </>
        )}
      </Tag>
    </Tooltip>
  );
};

export default DataAsOf;
