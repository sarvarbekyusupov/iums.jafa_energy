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
  Tabs,
  Badge,
  Divider,
} from 'antd';
import {
  ReloadOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  LineChartOutlined,
  TableOutlined,
  ThunderboltFilled,
  SunOutlined,
  FireOutlined,
  DashboardOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
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
    pageSize: 288, // 24 hours * 12 records per hour (5-min intervals)
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
      const dateStr = selectedDate.format('YYYY-MM-DD') + ' 00:00:00';
      const response: any = await fsolarDeviceService.getDeviceHistory(
        selectedDevice,
        { dateStr, pageNum: page, pageSize: pagination.pageSize } as any
      );

      // Filter to show only data for the selected date (24 hours: 00:00 to 23:59)
      const selectedDateStr = selectedDate.format('YYYY-MM-DD');

      const filteredData = (response.dataList || []).filter((record: HistoryRecord) => {
        // Extract just the date part from deviceDataTime (format: "2025-11-02 02:56:07")
        const recordDateStr = record.deviceDataTime.split(' ')[0];
        return recordDateStr === selectedDateStr;
      });

      setHistoryData(filteredData);
      setPagination({
        current: parseInt(response.currentPage),
        pageSize: parseInt(response.pageSize),
        total: filteredData.length,
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

  // Prepare chart data - aggregate by hour and fill all 24 hours
  const chartData = React.useMemo(() => {
    // Group data by hour
    const hourlyData: { [key: string]: HistoryRecord[] } = {};

    historyData.forEach(record => {
      // Extract hour from time string (format: "HH:MM:SS")
      const hour = record.dataTimeStr.split(':')[0];
      const hourKey = `${hour}:00`;

      if (!hourlyData[hourKey]) {
        hourlyData[hourKey] = [];
      }
      hourlyData[hourKey].push(record);
    });

    // Generate all 24 hours with data or null
    const allHours = [];
    for (let h = 0; h < 24; h++) {
      const hourKey = `${h.toString().padStart(2, '0')}:00`;
      const records = hourlyData[hourKey];

      if (records && records.length > 0) {
        const count = records.length;
        allHours.push({
          time: hourKey,
          'Battery SOC': records.reduce((sum, r) => sum + parseFloat(r.emsSoc || '0'), 0) / count,
          'PV Power': records.reduce((sum, r) => sum + parseFloat(r.pvTotalPower || '0'), 0) / count,
          'Grid Input': records.reduce((sum, r) => sum + parseFloat(r.acTtlInpower || '0'), 0) / count,
          'Output Power': records.reduce((sum, r) => sum + parseFloat(r.acTotalOutActPower || '0'), 0) / count,
          'Battery Power': records.reduce((sum, r) => sum + parseFloat(r.emsPower || '0'), 0) / count,
          'Battery Voltage': records.reduce((sum, r) => sum + parseFloat(r.emsVoltage || '0'), 0) / count,
          'Temperature': records.reduce((sum, r) => sum + parseFloat(r.tempMax || '0'), 0) / count,
          'PV1 Power': records.reduce((sum, r) => sum + parseFloat(r.pvPower || '0'), 0) / count,
          'PV2 Power': records.reduce((sum, r) => sum + parseFloat(r.pv2Power || '0'), 0) / count,
        });
      } else {
        // No data for this hour - add null values
        allHours.push({
          time: hourKey,
          'Battery SOC': null,
          'PV Power': null,
          'Grid Input': null,
          'Output Power': null,
          'Battery Power': null,
          'Battery Voltage': null,
          'Temperature': null,
          'PV1 Power': null,
          'PV2 Power': null,
        });
      }
    }

    return allHours;
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
      {/* Modern Header */}
      <Card
        style={{
          marginBottom: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
        }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space>
              <ClockCircleOutlined style={{ fontSize: 32, color: '#fff' }} />
              <div>
                <Title level={2} style={{ margin: 0, color: '#fff' }}>
                  Historical Data & Trends
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
                  View historical device metrics and performance trends
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Badge count={pagination.total} showZero overflowCount={999999} style={{ backgroundColor: '#52c41a' }} />
          </Col>
        </Row>
      </Card>

      {/* Controls Card with Gradient */}
      <Card
        style={{
          marginBottom: 16,
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          border: 'none',
        }}
      >
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={{ color: '#fff' }}>
                Select Device
              </Text>
              <Select
                style={{ width: '100%' }}
                placeholder="Select device"
                value={selectedDevice}
                onChange={setSelectedDevice}
                size="large"
              >
                {devices.map((device) => (
                  <Select.Option key={device.deviceSn} value={device.deviceSn}>
                    {device.deviceName || device.deviceSn}
                  </Select.Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={{ color: '#fff' }}>
                Select Date
              </Text>
              <DatePicker
                value={selectedDate}
                onChange={(date) => date && setSelectedDate(date)}
                format="YYYY-MM-DD"
                style={{ width: '100%' }}
                size="large"
              />
            </Space>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={{ color: '#fff' }}>
                Actions
              </Text>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => fetchHistoryData(1)}
                  loading={loading}
                  size="large"
                >
                  Refresh
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleExport}
                  disabled={historyData.length === 0}
                  size="large"
                >
                  Export
                </Button>
              </Space>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={{ color: '#fff' }}>
                Data Info
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 16 }}>
                📊 Interval: 5 min
                <br />
                📈 Records: {pagination.total}
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics - Gradient Cards */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                border: 'none',
              }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Average Battery SOC</span>}
                value={stats.avgSoc.toFixed(1)}
                suffix={<span style={{ fontSize: 16 }}>%</span>}
                prefix={<ThunderboltFilled />}
                valueStyle={{ color: '#fff', fontSize: 28 }}
              />
              <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                Mean state of charge
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
                border: 'none',
              }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Peak PV Power</span>}
                value={stats.maxPvPower.toFixed(0)}
                suffix={<span style={{ fontSize: 16 }}>W</span>}
                prefix={<SunOutlined />}
                valueStyle={{ color: '#fff', fontSize: 28 }}
              />
              <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                Maximum solar generation
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                border: 'none',
              }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Avg Grid Input</span>}
                value={stats.avgGridInput.toFixed(0)}
                suffix={<span style={{ fontSize: 16 }}>W</span>}
                prefix={<DashboardOutlined />}
                valueStyle={{ color: '#fff', fontSize: 28 }}
              />
              <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                Average grid import
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #f5222d 0%, #ff4d4f 100%)',
                border: 'none',
              }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Avg Output Power</span>}
                value={stats.avgOutput.toFixed(0)}
                suffix={<span style={{ fontSize: 16 }}>W</span>}
                prefix={<FireOutlined />}
                valueStyle={{ color: '#fff', fontSize: 28 }}
              />
              <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                Average load consumption
              </div>
            </Card>
          </Col>
        </Row>
      )}

      <Spin spinning={loading}>
        {historyData.length > 0 ? (
          <Tabs
            defaultActiveKey="charts"
            items={[
              {
                key: 'charts',
                label: (
                  <span>
                    <LineChartOutlined /> Charts
                  </span>
                ),
                children: (
                  <>
                    {/* Power Flow Chart */}
                    <Card
                      title={
                        <Space>
                          <RiseOutlined style={{ color: '#722ed1' }} />
                          <span>Power Flow Trends</span>
                        </Space>
                      }
                      style={{ marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    >
                      <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 50 }}>
                          <defs>
                            <linearGradient id="colorPV" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#faad14" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#faad14" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorGrid" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="time" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} interval={0} />
                          <YAxis label={{ value: 'Power (W)', angle: -90, position: 'insideLeft', style: { fontSize: 14 } }} />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: '1px solid #d9d9d9',
                              borderRadius: 8,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            }}
                          />
                          <Legend wrapperStyle={{ paddingTop: 20 }} />
                          <Line type="monotone" dataKey="PV Power" stroke="#faad14" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="Grid Input" stroke="#1890ff" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="Output Power" stroke="#cf1322" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="Battery Power" stroke="#52c41a" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>

                    {/* Battery Metrics */}
                    <Row gutter={16} style={{ marginBottom: 16 }}>
                      <Col xs={24} lg={12}>
                        <Card
                          title={
                            <Space>
                              <ThunderboltFilled style={{ color: '#52c41a' }} />
                              <span>Battery State of Charge (SOC)</span>
                            </Space>
                          }
                          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        >
                          <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 50 }}>
                              <defs>
                                <linearGradient id="colorSOC" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#52c41a" stopOpacity={0.1}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis dataKey="time" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} interval={0} />
                              <YAxis domain={[0, 100]} label={{ value: 'SOC (%)', angle: -90, position: 'insideLeft', style: { fontSize: 14 } }} />
                              <RechartsTooltip
                                contentStyle={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                  border: '1px solid #d9d9d9',
                                  borderRadius: 8,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                }}
                              />
                              <Area type="monotone" dataKey="Battery SOC" stroke="#52c41a" strokeWidth={2} fill="url(#colorSOC)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </Card>
                      </Col>
                      <Col xs={24} lg={12}>
                        <Card
                          title={
                            <Space>
                              <ThunderboltFilled style={{ color: '#722ed1' }} />
                              <span>Battery Voltage</span>
                            </Space>
                          }
                          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        >
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 50 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis dataKey="time" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} interval={0} />
                              <YAxis label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft', style: { fontSize: 14 } }} />
                              <RechartsTooltip
                                contentStyle={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                  border: '1px solid #d9d9d9',
                                  borderRadius: 8,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                }}
                              />
                              <Line type="monotone" dataKey="Battery Voltage" stroke="#722ed1" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </Card>
                      </Col>
                    </Row>

                    {/* PV Performance */}
                    <Card
                      title={
                        <Space>
                          <SunOutlined style={{ color: '#fa8c16' }} />
                          <span>PV String Performance Comparison</span>
                        </Space>
                      }
                      style={{ marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    >
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 50 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="time" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} interval={0} />
                          <YAxis label={{ value: 'Power (W)', angle: -90, position: 'insideLeft', style: { fontSize: 14 } }} />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: '1px solid #d9d9d9',
                              borderRadius: 8,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            }}
                          />
                          <Legend wrapperStyle={{ paddingTop: 20 }} />
                          <Bar dataKey="PV1 Power" fill="#ffa940" radius={[8, 8, 0, 0]} />
                          <Bar dataKey="PV2 Power" fill="#ff7a45" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>

                    {/* Temperature Monitoring */}
                    <Card
                      title={
                        <Space>
                          <FireOutlined style={{ color: '#f5222d' }} />
                          <span>Temperature Monitoring</span>
                        </Space>
                      }
                      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    >
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 50 }}>
                          <defs>
                            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f5222d" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#f5222d" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="time" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} interval={0} />
                          <YAxis label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', style: { fontSize: 14 } }} />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: '1px solid #d9d9d9',
                              borderRadius: 8,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            }}
                          />
                          <Line type="monotone" dataKey="Temperature" stroke="#f5222d" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>
                  </>
                ),
              },
              {
                key: 'table',
                label: (
                  <span>
                    <TableOutlined /> Data Table
                  </span>
                ),
                children: (
                  <Card
                    title={
                      <Space>
                        <TableOutlined style={{ color: '#1890ff' }} />
                        <span>Detailed Historical Records</span>
                        <Badge count={pagination.total} showZero overflowCount={999999} style={{ backgroundColor: '#52c41a' }} />
                      </Space>
                    }
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  >
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
                      bordered
                    />
                  </Card>
                ),
              },
            ]}
          />
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
