import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Select,
  DatePicker,
  Typography,
  Row,
  Col,
  Statistic,
  Alert,
  Badge,
  message,
  Empty,
} from 'antd';
import {
  ReloadOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { fsolarDeviceService } from '../../../service/fsolar';
import type { Device } from '../../../types/fsolar';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface DeviceEvent {
  deviceSn: string;
  warringName: string;
  warringType: string;
  warnCode: string;
  dataTimeStr: string;
  timeZone: string;
  state?: string;
}

const DeviceAlarms: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [events, setEvents] = useState<DeviceEvent[]>([]);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(7, 'days'),
    dayjs(),
  ]);
  const [stateFilter, setStateFilter] = useState<string | undefined>(undefined);

  // Fetch devices
  const fetchDevices = async () => {
    try {
      const result = await fsolarDeviceService.getAllDevices();
      setDevices(result);
      if (result.length > 0 && !selectedDevice) {
        setSelectedDevice(result[0].deviceSn);
      }
    } catch (error) {
      console.error('Failed to fetch devices', error);
    }
  };

  // Fetch device events
  const fetchEvents = async () => {
    if (!selectedDevice) return;

    try {
      setLoading(true);
      // Format dates as 'YYYY-MM-DD HH:mm:ss' strings, not milliseconds
      const startTime = dateRange[0].format('YYYY-MM-DD HH:mm:ss');
      const endTime = dateRange[1].format('YYYY-MM-DD HH:mm:ss');

      const params: any = {
        startTime,
        endTime,
      };

      if (stateFilter !== undefined) {
        params.state = stateFilter;
      }

      const result: any = await fsolarDeviceService.getDeviceEvents(
        selectedDevice,
        params
      );

      setEvents(result || []);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to fetch device events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchEvents();
    }
  }, [selectedDevice, dateRange, stateFilter]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const warnings = events.filter((e) => e.warringType === 'W').length;
    const faults = events.filter((e) => e.warringType === 'F').length;
    const uniqueCodes = new Set(events.map((e) => e.warnCode)).size;

    return { warnings, faults, total: events.length, uniqueCodes };
  }, [events]);

  const columns: ColumnsType<DeviceEvent> = [
    {
      title: 'Time',
      dataIndex: 'dataTimeStr',
      key: 'dataTimeStr',
      width: 180,
      sorter: (a, b) => new Date(a.dataTimeStr).getTime() - new Date(b.dataTimeStr).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Type',
      dataIndex: 'warringType',
      key: 'warringType',
      width: 100,
      render: (type: string) => {
        if (type === 'W') {
          return <Tag icon={<WarningOutlined />} color="warning">Warning</Tag>;
        } else if (type === 'F') {
          return <Tag icon={<ExclamationCircleOutlined />} color="error">Fault</Tag>;
        }
        return <Tag>{type}</Tag>;
      },
      filters: [
        { text: 'Warning', value: 'W' },
        { text: 'Fault', value: 'F' },
      ],
      onFilter: (value, record) => record.warringType === value,
    },
    {
      title: 'Code',
      dataIndex: 'warnCode',
      key: 'warnCode',
      width: 100,
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'Alarm Name',
      dataIndex: 'warringName',
      key: 'warringName',
      render: (name: string, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.timeZone}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Device SN',
      dataIndex: 'deviceSn',
      key: 'deviceSn',
      width: 180,
      render: (sn: string) => <Text copyable>{sn}</Text>,
    },
  ];

  // Get alarm description
  const getAlarmDescription = (code: string): string => {
    const descriptions: Record<string, string> = {
      '3': 'PV string 1 voltage below threshold',
      '4': 'PV string 2 voltage below threshold',
      '42': 'Communication failure with meter',
    };
    return descriptions[code] || 'Check device manual for details';
  };

  // Group events by alarm name
  const groupedAlarms = React.useMemo(() => {
    const groups: Record<string, DeviceEvent[]> = {};
    events.forEach((event) => {
      if (!groups[event.warringName]) {
        groups[event.warringName] = [];
      }
      groups[event.warringName].push(event);
    });
    return groups;
  }, [events]);

  return (
    <div>
      <Title level={2}>
        <WarningOutlined /> Device Alarms & Events
      </Title>

      {/* Controls */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            style={{ width: 250 }}
            placeholder="Select device"
            value={selectedDevice}
            onChange={setSelectedDevice}
          >
            {devices.map((device) => (
              <Select.Option key={device.deviceSn} value={device.deviceSn}>
                {device.deviceName || device.deviceSn}
              </Select.Option>
            ))}
          </Select>

          <RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange(dates as [Dayjs, Dayjs])}
            showTime
            format="YYYY-MM-DD HH:mm"
            disabledDate={(current) => {
              if (!dateRange[0]) return false;
              const diffDays = Math.abs(current.diff(dateRange[0], 'days'));
              return diffDays > 7;
            }}
          />

          <Select
            style={{ width: 150 }}
            placeholder="All States"
            allowClear
            value={stateFilter}
            onChange={setStateFilter}
          >
            <Select.Option value="0">Unprocessed</Select.Option>
            <Select.Option value="1">Processed</Select.Option>
            <Select.Option value="2">Expired</Select.Option>
            <Select.Option value="3">In Progress</Select.Option>
          </Select>

          <Button icon={<ReloadOutlined />} onClick={fetchEvents} loading={loading}>
            Refresh
          </Button>
        </Space>
        <Alert
          message="Query range limited to 7 days maximum"
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card>
            <Statistic
              title="Total Events"
              value={stats.total}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card>
            <Statistic
              title="Warnings"
              value={stats.warnings}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card>
            <Statistic
              title="Faults"
              value={stats.faults}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card>
            <Statistic
              title="Unique Alarm Types"
              value={stats.uniqueCodes}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Active Alarms Summary */}
      {Object.keys(groupedAlarms).length > 0 && (
        <Card
          title={
            <Space wrap>
              <Badge count={Object.keys(groupedAlarms).length} showZero>
                <WarningOutlined style={{ fontSize: 20 }} />
              </Badge>
              <Text strong style={{ fontSize: 16 }}>Active Alarm Types</Text>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 16]}>
            {Object.entries(groupedAlarms).map(([alarmName, alarmEvents]) => {
              const latestEvent = alarmEvents[0];
              return (
                <Col xs={24} sm={12} md={12} lg={8} xl={6} key={alarmName}>
                  <Card size="small" hoverable>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Space>
                        <Tag color={latestEvent.warringType === 'F' ? 'error' : 'warning'}>
                          Code {latestEvent.warnCode}
                        </Tag>
                        <Badge count={alarmEvents.length} />
                      </Space>
                      <Text strong>{alarmName}</Text>
                      <Text type="secondary" style={{ fontSize: 12, wordBreak: 'break-word' }}>
                        {getAlarmDescription(latestEvent.warnCode)}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Latest: {latestEvent.dataTimeStr}
                      </Text>
                    </Space>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Card>
      )}

      {/* Events Table */}
      <Card title="Event Timeline">
        {events.length > 0 ? (
          <Table
            columns={columns}
            dataSource={events}
            rowKey={(record) => `${record.deviceSn}-${record.dataTimeStr}-${record.warnCode}`}
            loading={loading}
            pagination={{
              pageSize: 20,
              showTotal: (total) => `Total ${total} events`,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            scroll={{ x: 1000 }}
          />
        ) : (
          <Empty
            description={
              <span>
                No alarms or events found for the selected period.
                <br />
                {stats.total === 0 && <Text type="success">Device is operating normally! ✓</Text>}
              </span>
            }
          />
        )}
      </Card>
    </div>
  );
};

export default DeviceAlarms;
