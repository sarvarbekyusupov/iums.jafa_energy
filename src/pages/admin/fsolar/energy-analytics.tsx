import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  Space,
  Button,
  DatePicker,
  Typography,
  Statistic,
  message,
  Alert,
  Radio,
  Spin,
  Table,
  Tabs,
  Progress,
  Badge,
  Tooltip,
  Divider,
  Tag,
} from 'antd';
import {
  ReloadOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  LineChartOutlined,
  CloudServerOutlined,
  HomeOutlined,
  SunOutlined,
  TableOutlined,
  ThunderboltFilled,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DashboardOutlined,
  FireOutlined,
  DatabaseOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
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

interface EnergyRecord {
  deviceSn: string;
  dataTime: string;
  timeStamp: number;
  gridInput: string;
  feedOutput: string;
  generateEnergy: string;
  batCharEnergy: string;
  batDisEnergy: string;
  offGridEnergy: string;
  gridTiedEnergy: string;
  offGridTiedEnergy: string;
  pv1Energy: string | null;
  pv2Energy: string | null;
  [key: string]: any;
}

const COLORS = {
  gridInput: '#1890ff',
  feedOutput: '#52c41a',
  battery: '#faad14',
  load: '#f5222d',
  pv: '#722ed1',
  charge: '#95de64',
  discharge: '#ffc53d',
  generation: '#fa541c',
};

const EnergyAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [energyRecords, setEnergyRecords] = useState<EnergyRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [timeDimension, setTimeDimension] = useState<'day' | 'month' | 'year' | 'total'>('day');

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

  // Fetch energy data
  const fetchEnergyData = async () => {
    if (!selectedDevice) return;

    try {
      setLoading(true);
      let dateStr = '';
      if (timeDimension !== 'total') {
        switch (timeDimension) {
          case 'day':
            dateStr = selectedDate.format('YYYY-MM-DD');
            break;
          case 'month':
            dateStr = selectedDate.format('YYYY-MM');
            break;
          case 'year':
            dateStr = selectedDate.format('YYYY');
            break;
        }
      }

      // Call API directly with correct parameter names
      const params: any = {
        deviceSn: selectedDevice,
        timeDimension: timeDimension,
      };

      // Only add dateStr for non-total dimensions
      if (timeDimension !== 'total') {
        params.dateStr = dateStr;
      }

      const response: any = await fsolarDeviceService.getDeviceEnergy(params);

      setEnergyRecords(response.records || []);

      if (!response.records || response.records.length === 0) {
        message.info('No energy data available for the selected period');
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to fetch energy data');
      setEnergyRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchEnergyData();
    }
  }, [selectedDevice, selectedDate, timeDimension]);

  // Calculate totals from all records
  const totals = React.useMemo(() => {
    if (energyRecords.length === 0) return null;

    return energyRecords.reduce(
      (acc, record) => ({
        gridInput: acc.gridInput + parseFloat(record.gridInput || '0'),
        feedOutput: acc.feedOutput + parseFloat(record.feedOutput || '0'),
        generateEnergy: acc.generateEnergy + parseFloat(record.generateEnergy || '0'),
        batCharEnergy: acc.batCharEnergy + parseFloat(record.batCharEnergy || '0'),
        batDisEnergy: acc.batDisEnergy + parseFloat(record.batDisEnergy || '0'),
        offGridEnergy: acc.offGridEnergy + parseFloat(record.offGridEnergy || '0'),
        gridTiedEnergy: acc.gridTiedEnergy + parseFloat(record.gridTiedEnergy || '0'),
        totalLoad: acc.totalLoad + parseFloat(record.offGridTiedEnergy || '0'),
      }),
      {
        gridInput: 0,
        feedOutput: 0,
        generateEnergy: 0,
        batCharEnergy: 0,
        batDisEnergy: 0,
        offGridEnergy: 0,
        gridTiedEnergy: 0,
        totalLoad: 0,
      }
    );
  }, [energyRecords]);

  // Prepare chart data
  const chartData = React.useMemo(() => {
    return energyRecords.map((record) => ({
      date: record.dataTime,
      'Grid Input': parseFloat(record.gridInput || '0'),
      'Grid Export': parseFloat(record.feedOutput || '0'),
      'Battery Charge': parseFloat(record.batCharEnergy || '0'),
      'Battery Discharge': parseFloat(record.batDisEnergy || '0'),
      'Load Consumption': parseFloat(record.offGridTiedEnergy || '0'),
      'Generation': parseFloat(record.generateEnergy || '0'),
    }));
  }, [energyRecords]);

  // Energy balance pie chart data (for latest record)
  const latestRecord = energyRecords[energyRecords.length - 1];
  const pieData = latestRecord
    ? [
        { name: 'Grid Input', value: parseFloat(latestRecord.gridInput || '0'), color: COLORS.gridInput },
        { name: 'Battery Discharge', value: parseFloat(latestRecord.batDisEnergy || '0'), color: COLORS.battery },
        { name: 'Generation', value: parseFloat(latestRecord.generateEnergy || '0'), color: COLORS.pv },
      ].filter((item) => item.value > 0)
    : [];

  const columns = [
    {
      title: 'Date/Time',
      dataIndex: 'dataTime',
      key: 'dataTime',
      fixed: 'left' as const,
      width: 150,
    },
    {
      title: 'Grid Input (kWh)',
      dataIndex: 'gridInput',
      key: 'gridInput',
      render: (val: string) => <Text style={{ color: COLORS.gridInput }}>{parseFloat(val || '0').toFixed(2)}</Text>,
    },
    {
      title: 'Grid Export (kWh)',
      dataIndex: 'feedOutput',
      key: 'feedOutput',
      render: (val: string) => <Text style={{ color: COLORS.feedOutput }}>{parseFloat(val || '0').toFixed(2)}</Text>,
    },
    {
      title: 'Battery Charge (kWh)',
      dataIndex: 'batCharEnergy',
      key: 'batCharEnergy',
      render: (val: string) => <Text style={{ color: COLORS.battery }}>{parseFloat(val || '0').toFixed(2)}</Text>,
    },
    {
      title: 'Battery Discharge (kWh)',
      dataIndex: 'batDisEnergy',
      key: 'batDisEnergy',
      render: (val: string) => <Text style={{ color: COLORS.battery }}>{parseFloat(val || '0').toFixed(2)}</Text>,
    },
    {
      title: 'Backup Load (kWh)',
      dataIndex: 'offGridEnergy',
      key: 'offGridEnergy',
      render: (val: string) => <Text>{parseFloat(val || '0').toFixed(2)}</Text>,
    },
    {
      title: 'Total Load (kWh)',
      dataIndex: 'offGridTiedEnergy',
      key: 'offGridTiedEnergy',
      render: (val: string) => <Text strong>{parseFloat(val || '0').toFixed(2)}</Text>,
    },
    {
      title: 'Generation (kWh)',
      dataIndex: 'generateEnergy',
      key: 'generateEnergy',
      render: (val: string) => <Text style={{ color: COLORS.pv }}>{parseFloat(val || '0').toFixed(2)}</Text>,
    },
  ];

  // Calculate self-consumption and self-sufficiency
  const selfConsumption = totals && totals.generateEnergy > 0
    ? ((totals.generateEnergy - totals.feedOutput) / totals.generateEnergy * 100)
    : 0;

  const selfSufficiency = totals && totals.totalLoad > 0
    ? ((totals.generateEnergy - totals.feedOutput) / totals.totalLoad * 100)
    : 0;

  return (
    <div>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <DashboardOutlined /> Energy Analytics & Monitoring
          </Title>
        </Col>
        <Col>
          <Space>
            <Badge count={energyRecords.length} showZero style={{ backgroundColor: '#52c41a' }}>
              <Button icon={<ReloadOutlined />} onClick={fetchEnergyData} loading={loading} size="large">
                Refresh Data
              </Button>
            </Badge>
          </Space>
        </Col>
      </Row>

      {/* Controls */}
      <Card
        style={{
          marginBottom: 16,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginBottom: 4 }}>
              Device Selection
            </div>
            <Select
              size="large"
              style={{ width: '100%' }}
              placeholder="Select device"
              value={selectedDevice}
              onChange={setSelectedDevice}
              loading={loading}
            >
              {devices.map((device) => (
                <Select.Option key={device.deviceSn} value={device.deviceSn}>
                  <Space>
                    <ThunderboltFilled />
                    {device.deviceName || device.deviceSn}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} md={10}>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginBottom: 4 }}>
              Time Period
            </div>
            <Space.Compact size="large" style={{ width: '100%' }}>
              <Radio.Group
                value={timeDimension}
                onChange={(e) => setTimeDimension(e.target.value)}
                buttonStyle="solid"
                size="large"
              >
                <Radio.Button value="day">
                  <Tooltip title="Daily breakdown">📅 Day</Tooltip>
                </Radio.Button>
                <Radio.Button value="month">
                  <Tooltip title="Monthly overview">📊 Month</Tooltip>
                </Radio.Button>
                <Radio.Button value="year">
                  <Tooltip title="Yearly summary">📈 Year</Tooltip>
                </Radio.Button>
                <Radio.Button value="total">
                  <Tooltip title="Lifetime statistics">⚡ Total</Tooltip>
                </Radio.Button>
              </Radio.Group>
            </Space.Compact>
          </Col>

          <Col xs={24} md={6}>
            {timeDimension !== 'total' && (
              <>
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginBottom: 4 }}>
                  Select Date
                </div>
                <DatePicker
                  size="large"
                  style={{ width: '100%' }}
                  value={selectedDate}
                  onChange={(date) => date && setSelectedDate(date)}
                  picker={timeDimension === 'year' ? 'year' : timeDimension === 'month' ? 'month' : 'date'}
                />
              </>
            )}
          </Col>
        </Row>
      </Card>

      <Spin spinning={loading}>
        {totals ? (
          <>
            {/* Key Performance Indicators */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  style={{
                    background: 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
                    border: 'none',
                  }}
                >
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Solar Generation</span>}
                    value={totals.generateEnergy}
                    precision={2}
                    suffix={<span style={{ fontSize: 16 }}>kWh</span>}
                    prefix={<SunOutlined />}
                    valueStyle={{ color: '#fff', fontSize: 28 }}
                  />
                  <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                    Total energy generated
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
                    title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Total Load</span>}
                    value={totals.totalLoad}
                    precision={2}
                    suffix={<span style={{ fontSize: 16 }}>kWh</span>}
                    prefix={<HomeOutlined />}
                    valueStyle={{ color: '#fff', fontSize: 28 }}
                  />
                  <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                    Energy consumed
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
                    title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Grid Import</span>}
                    value={totals.gridInput}
                    precision={2}
                    suffix={<span style={{ fontSize: 16 }}>kWh</span>}
                    prefix={<ArrowDownOutlined />}
                    valueStyle={{ color: '#fff', fontSize: 28 }}
                  />
                  <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                    Imported from grid
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Card
                  style={{
                    background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                    border: 'none',
                  }}
                >
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Grid Export</span>}
                    value={totals.feedOutput}
                    precision={2}
                    suffix={<span style={{ fontSize: 16 }}>kWh</span>}
                    prefix={<ArrowUpOutlined />}
                    valueStyle={{ color: '#fff', fontSize: 28 }}
                  />
                  <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                    Exported to grid
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Battery & Performance Stats */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} md={8}>
                <Card style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Space>
                        <RiseOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                        <Text type="secondary">Battery Charged</Text>
                      </Space>
                      <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a', marginTop: 4 }}>
                        {totals.batCharEnergy.toFixed(2)} <span style={{ fontSize: 14 }}>kWh</span>
                      </div>
                    </div>
                    <Progress
                      percent={
                        totals.batCharEnergy + totals.batDisEnergy > 0
                          ? (totals.batCharEnergy / (totals.batCharEnergy + totals.batDisEnergy) * 100)
                          : 0
                      }
                      strokeColor="#52c41a"
                      size="small"
                    />
                  </Space>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Card style={{ background: '#fff7e6', border: '1px solid #ffd591' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Space>
                        <FallOutlined style={{ color: '#faad14', fontSize: 20 }} />
                        <Text type="secondary">Battery Discharged</Text>
                      </Space>
                      <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14', marginTop: 4 }}>
                        {totals.batDisEnergy.toFixed(2)} <span style={{ fontSize: 14 }}>kWh</span>
                      </div>
                    </div>
                    <Progress
                      percent={
                        totals.batCharEnergy + totals.batDisEnergy > 0
                          ? (totals.batDisEnergy / (totals.batCharEnergy + totals.batDisEnergy) * 100)
                          : 0
                      }
                      strokeColor="#faad14"
                      size="small"
                    />
                  </Space>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Card style={{ background: '#e6f7ff', border: '1px solid #91d5ff' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Space>
                        <DatabaseOutlined style={{ color: '#1890ff', fontSize: 20 }} />
                        <Text type="secondary">Net Grid Energy</Text>
                      </Space>
                      <div style={{
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: totals.gridInput - totals.feedOutput > 0 ? '#1890ff' : '#52c41a',
                        marginTop: 4,
                      }}>
                        {totals.gridInput > totals.feedOutput ? '+' : ''}
                        {(totals.gridInput - totals.feedOutput).toFixed(2)} <span style={{ fontSize: 14 }}>kWh</span>
                      </div>
                    </div>
                    <Progress
                      percent={
                        totals.gridInput + totals.feedOutput > 0
                          ? (totals.feedOutput / (totals.gridInput + totals.feedOutput) * 100)
                          : 0
                      }
                      strokeColor={totals.feedOutput > totals.gridInput ? '#52c41a' : '#1890ff'}
                      size="small"
                      format={(percent) => `${percent?.toFixed(0)}% export`}
                    />
                  </Space>
                </Card>
              </Col>
            </Row>

            {/* Efficiency Metrics */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} md={12}>
                <Card
                  title={
                    <Space>
                      <FireOutlined style={{ color: '#722ed1' }} />
                      <span>Self-Consumption Rate</span>
                    </Space>
                  }
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                >
                  <Row align="middle" gutter={16}>
                    <Col flex="auto">
                      <Progress
                        type="circle"
                        percent={selfConsumption}
                        format={(percent) => (
                          <div style={{ fontSize: 16 }}>
                            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>
                              {percent?.toFixed(1)}%
                            </div>
                            <div style={{ fontSize: 12, color: '#8c8c8c' }}>used</div>
                          </div>
                        )}
                        strokeColor={{
                          '0%': '#722ed1',
                          '100%': '#9254de',
                        }}
                        size={140}
                      />
                    </Col>
                    <Col>
                      <Space direction="vertical">
                        <Text type="secondary">Solar energy used directly</Text>
                        <Text strong style={{ fontSize: 16 }}>
                          {((totals.generateEnergy - totals.feedOutput)).toFixed(2)} kWh
                        </Text>
                      </Space>
                    </Col>
                  </Row>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card
                  title={
                    <Space>
                      <ThunderboltFilled style={{ color: '#fa8c16' }} />
                      <span>Energy Independence</span>
                    </Space>
                  }
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                >
                  <Row align="middle" gutter={16}>
                    <Col flex="auto">
                      <Progress
                        type="circle"
                        percent={Math.min(selfSufficiency, 100)}
                        format={(percent) => (
                          <div style={{ fontSize: 16 }}>
                            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>
                              {percent?.toFixed(1)}%
                            </div>
                            <div style={{ fontSize: 12, color: '#8c8c8c' }}>independent</div>
                          </div>
                        )}
                        strokeColor={{
                          '0%': '#fa8c16',
                          '100%': '#faad14',
                        }}
                        size={140}
                      />
                    </Col>
                    <Col>
                      <Space direction="vertical">
                        <Text type="secondary">Load covered by solar</Text>
                        <Text strong style={{ fontSize: 16 }}>
                          {((totals.generateEnergy - totals.feedOutput)).toFixed(2)} / {totals.totalLoad.toFixed(2)} kWh
                        </Text>
                      </Space>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>

            <Tabs
              defaultActiveKey="charts"
              size="large"
              items={[
                {
                  key: 'charts',
                  label: (
                    <Space>
                      <BarChartOutlined />
                      <span>Analytics & Charts</span>
                    </Space>
                  ),
                  children: (
                    <>
                      {/* Energy Flow Chart */}
                      <Card
                        title={
                          <Space>
                            <LineChartOutlined style={{ color: '#1890ff' }} />
                            <span>Energy Flow Trends</span>
                          </Space>
                        }
                        style={{ marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        extra={<Tag color="blue">{energyRecords.length} data points</Tag>}
                      >
                        <ResponsiveContainer width="100%" height={400}>
                          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 50 }}>
                            <defs>
                              <linearGradient id="colorGeneration" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#fa8c16" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#fa8c16" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f5222d" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#f5222d" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                              dataKey="date"
                              angle={-45}
                              textAnchor="end"
                              height={80}
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis
                              label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft', style: { fontSize: 14 } }}
                              tick={{ fontSize: 12 }}
                            />
                            <RechartsTooltip
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #d9d9d9',
                                borderRadius: 8,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                              }}
                            />
                            <Legend wrapperStyle={{ paddingTop: 20 }} />
                            <Line
                              type="monotone"
                              dataKey="Generation"
                              stroke="#fa8c16"
                              strokeWidth={3}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="Load Consumption"
                              stroke="#f5222d"
                              strokeWidth={3}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="Grid Input"
                              stroke="#1890ff"
                              strokeWidth={2}
                              strokeDasharray="5 5"
                              dot={{ r: 3 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="Grid Export"
                              stroke="#52c41a"
                              strokeWidth={2}
                              strokeDasharray="5 5"
                              dot={{ r: 3 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Card>

                      {/* Battery Energy */}
                      <Row gutter={16} style={{ marginBottom: 16 }}>
                        <Col span={12}>
                          <Card title="Battery Energy Flow">
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                                <YAxis label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }} />
                                <RechartsTooltip />
                                <Legend />
                                <Bar dataKey="Battery Charge" fill="#95de64" />
                                <Bar dataKey="Battery Discharge" fill="#ffc53d" />
                              </BarChart>
                            </ResponsiveContainer>
                          </Card>
                        </Col>
                        <Col span={12}>
                          <Card title="Grid Energy Balance">
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                                <YAxis label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }} />
                                <RechartsTooltip />
                                <Legend />
                                <Bar dataKey="Grid Input" fill={COLORS.gridInput} />
                                <Bar dataKey="Grid Export" fill={COLORS.feedOutput} />
                              </BarChart>
                            </ResponsiveContainer>
                          </Card>
                        </Col>
                      </Row>

                      {/* Energy Sources Pie Chart */}
                      {pieData.length > 0 && (
                        <Card title="Latest Energy Sources Distribution">
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={(entry: any) => `${entry.name}: ${entry.value.toFixed(2)} kWh`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <RechartsTooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </Card>
                      )}
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
                    <Card title="Detailed Energy Records">
                      <Table
                        columns={columns}
                        dataSource={energyRecords}
                        rowKey={(record) => `${record.deviceSn}-${record.timeStamp}`}
                        scroll={{ x: 1200 }}
                        size="small"
                        pagination={{
                          pageSize: 20,
                          showTotal: (total) => `Total ${total} records`,
                        }}
                      />
                    </Card>
                  ),
                },
              ]}
            />
          </>
        ) : (
          <Alert
            message="No Energy Data"
            description={
              <>
                <p>No energy data available for the selected device and time period.</p>
                <p>
                  This could be because:
                  <ul>
                    <li>The device hasn't recorded any energy data yet</li>
                    <li>The selected date is in the future</li>
                    <li>The device was offline during this period</li>
                  </ul>
                </p>
                <p>Try selecting today's date or a different device.</p>
              </>
            }
            type="info"
            showIcon
          />
        )}
      </Spin>
    </div>
  );
};

export default EnergyAnalytics;
