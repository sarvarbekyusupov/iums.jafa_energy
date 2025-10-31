import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  Space,
  Button,
  Typography,
  DatePicker,
  Table,
  Spin,
  message,
  Statistic,
  Empty,
} from 'antd';
import {
  ReloadOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { fsolarDeviceService } from '../../../service/fsolar';
import type { Device } from '../../../types/fsolar';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text } = Typography;

interface HistoryRecord {
  deviceSn: string;
  dataTimeStr: string;
  deviceDataTime: string;
  timeZone: string;
  acRInVolt: string;
  acRInCurr: string;
  acRInFreq: string;
  acTtlInpower: string;
  acROutVolt: string;
  acROutCurr: string;
  acROutFreq: string;
  acTotalOutActPower: string;
  acTotalOutAppaPower: string;
  emsSoc: string;
  emsVoltage: string;
  emsCurrent: string;
  emsPower: string;
  pvVolt: string;
  pvInCurr: string;
  pvPower: string;
  pv2Volt: string;
  pv2InCurr: string;
  pv2Power: string;
  pvTotalPower: string;
  meterPower: string;
  ctPower: string | null;
  ePvToday: string;
  tempMax: string;
  devTempMax: string;
  workMode: string;
}

const HistoricalData: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  });

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

  // Fetch history data
  const fetchHistoryData = async (page: number = 1) => {
    if (!selectedDevice) return;

    try {
      setLoading(true);
      const dateStr = selectedDate.format('YYYY-MM-DD HH:mm:ss');
      const response: any = await fsolarDeviceService.getDeviceHistory(
        selectedDevice,
        { dateStr, pageNum: page, pageSize: pagination.pageSize } as any
      );

      setHistoryData(response.dataList || []);
      setPagination({
        current: parseInt(response.currentPage),
        pageSize: parseInt(response.pageSize),
        total: parseInt(response.total),
      });
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to fetch historical data');
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchHistoryData(1);
    }
  }, [selectedDevice, selectedDate]);

  const handleTableChange = (newPagination: any) => {
    fetchHistoryData(newPagination.current);
  };

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (historyData.length === 0) return null;

    const avgSoc = historyData.reduce((sum, r) => sum + parseFloat(r.emsSoc || '0'), 0) / historyData.length;
    const maxPvPower = Math.max(...historyData.map(r => parseFloat(r.pvTotalPower || '0')));
    const avgGridInput = historyData.reduce((sum, r) => sum + parseFloat(r.acTtlInpower || '0'), 0) / historyData.length;
    const avgOutput = historyData.reduce((sum, r) => sum + parseFloat(r.acTotalOutActPower || '0'), 0) / historyData.length;

    return { avgSoc, maxPvPower, avgGridInput, avgOutput };
  }, [historyData]);


  const columns = [
    {
      title: 'Time',
      dataIndex: 'dataTimeStr',
      key: 'time',
      fixed: 'left' as const,
      width: 100,
    },
    {
      title: 'Battery SOC (%)',
      dataIndex: 'emsSoc',
      key: 'emsSoc',
      width: 120,
      render: (val: string) => <Text strong>{val}%</Text>,
    },
    {
      title: 'Battery Voltage (V)',
      dataIndex: 'emsVoltage',
      key: 'emsVoltage',
      width: 140,
    },
    {
      title: 'Battery Current (A)',
      dataIndex: 'emsCurrent',
      key: 'emsCurrent',
      width: 140,
    },
    {
      title: 'Battery Power (W)',
      dataIndex: 'emsPower',
      key: 'emsPower',
      width: 130,
    },
    {
      title: 'Grid Input (W)',
      dataIndex: 'acTtlInpower',
      key: 'acTtlInpower',
      width: 120,
    },
    {
      title: 'Grid Voltage (V)',
      dataIndex: 'acRInVolt',
      key: 'acRInVolt',
      width: 130,
    },
    {
      title: 'Output Power (W)',
      dataIndex: 'acTotalOutActPower',
      key: 'acTotalOutActPower',
      width: 140,
    },
    {
      title: 'PV Total (W)',
      dataIndex: 'pvTotalPower',
      key: 'pvTotalPower',
      width: 110,
    },
    {
      title: 'PV1 Power (W)',
      dataIndex: 'pvPower',
      key: 'pvPower',
      width: 120,
    },
    {
      title: 'PV2 Power (W)',
      dataIndex: 'pv2Power',
      key: 'pv2Power',
      width: 120,
    },
    {
      title: 'Temperature (°C)',
      dataIndex: 'tempMax',
      key: 'tempMax',
      width: 140,
    },
    {
      title: 'Work Mode',
      dataIndex: 'workMode',
      key: 'workMode',
      width: 100,
    },
  ];

  const handleExport = () => {
    const csvContent = [
      columns.map(col => col.title).join(','),
      ...historyData.map(record =>
        columns.map(col => (record as any)[col.dataIndex]).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fsolar-history-${selectedDevice}-${selectedDate.format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Title level={2}>
        <ClockCircleOutlined /> Historical Data & Trends
      </Title>

      {/* Controls */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            style={{ width: 300 }}
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
          <DatePicker
            value={selectedDate}
            onChange={(date) => date && setSelectedDate(date)}
            format="YYYY-MM-DD"
          />
          <Button icon={<ReloadOutlined />} onClick={() => fetchHistoryData(1)} loading={loading}>
            Refresh
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
            disabled={historyData.length === 0}
          >
            Export CSV
          </Button>
          <Text type="secondary">
            Data Interval: 5 minutes | Total: {pagination.total} records
          </Text>
        </Space>
      </Card>

      {/* Statistics */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Average Battery SOC"
                value={stats.avgSoc.toFixed(1)}
                suffix="%"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Peak PV Power"
                value={stats.maxPvPower.toFixed(0)}
                suffix="W"
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Avg Grid Input"
                value={stats.avgGridInput.toFixed(0)}
                suffix="W"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Avg Output Power"
                value={stats.avgOutput.toFixed(0)}
                suffix="W"
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Spin spinning={loading}>
        {historyData.length > 0 ? (
          <>
            {/* Data Table */}
            <Card title="Detailed Records">
              <Table
                columns={columns}
                dataSource={historyData}
                rowKey={(record) => `${record.deviceDataTime}-${record.dataTimeStr}`}
                pagination={{
                  ...pagination,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `Total ${total} records`,
                  pageSizeOptions: ['10', '20', '50', '100'],
                }}
                onChange={handleTableChange}
                scroll={{ x: 1800 }}
                size="small"
              />
            </Card>
          </>
        ) : (
          <Card>
            <Empty
              description={
                <span>
                  No historical data available for selected date.
                  <br />
                  Try selecting a different date or device.
                </span>
              }
            />
          </Card>
        )}
      </Spin>
    </div>
  );
};

export default HistoricalData;
