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
  Tooltip,
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
};

const EnergyAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [energyRecords, setEnergyRecords] = useState<EnergyRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [timeDimension, setTimeDimension] = useState<'day' | 'month' | 'year'>('day');

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

      // Call API directly with correct parameter names
      const response: any = await fsolarDeviceService.getDeviceEnergy({
        deviceSn: selectedDevice,
        timeDimension: timeDimension,
        dateStr: dateStr,
      } as any);

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

  return (
    <div>
      <Title level={2}>
        <ThunderboltOutlined /> Energy Analytics & Balance
      </Title>

      {/* Controls */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            style={{ width: 250 }}
            placeholder="Select device"
            value={selectedDevice}
            onChange={setSelectedDevice}
            loading={loading}
          >
            {devices.map((device) => (
              <Select.Option key={device.deviceSn} value={device.deviceSn}>
                {device.deviceName || device.deviceSn}
              </Select.Option>
            ))}
          </Select>

          <Radio.Group
            value={timeDimension}
            onChange={(e) => setTimeDimension(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="day">
              <LineChartOutlined /> Daily
            </Radio.Button>
            <Radio.Button value="month">
              <BarChartOutlined /> Monthly
            </Radio.Button>
            <Radio.Button value="year">
              <BarChartOutlined /> Yearly
            </Radio.Button>
          </Radio.Group>

          <DatePicker
            value={selectedDate}
            onChange={(date) => date && setSelectedDate(date)}
            picker={timeDimension === 'year' ? 'year' : timeDimension === 'month' ? 'month' : 'date'}
          />

          <Button icon={<ReloadOutlined />} onClick={fetchEnergyData} loading={loading}>
            Refresh
          </Button>

          <Text type="secondary">Records: {energyRecords.length}</Text>
        </Space>
      </Card>

      <Spin spinning={loading}>
        {totals ? (
          <>
            {/* Summary Statistics */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Grid Input"
                    value={totals.gridInput}
                    precision={2}
                    suffix="kWh"
                    prefix={<CloudServerOutlined />}
                    valueStyle={{ color: COLORS.gridInput }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Grid Export"
                    value={totals.feedOutput}
                    precision={2}
                    suffix="kWh"
                    prefix={<ThunderboltOutlined />}
                    valueStyle={{ color: COLORS.feedOutput }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Battery Charged"
                    value={totals.batCharEnergy}
                    precision={2}
                    suffix="kWh"
                    prefix={<ThunderboltOutlined />}
                    valueStyle={{ color: COLORS.battery }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Total Load"
                    value={totals.totalLoad}
                    precision={2}
                    suffix="kWh"
                    prefix={<HomeOutlined />}
                    valueStyle={{ color: COLORS.load }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Second row of stats */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Battery Discharged"
                    value={totals.batDisEnergy}
                    precision={2}
                    suffix="kWh"
                    valueStyle={{ color: COLORS.battery }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Backup Load"
                    value={totals.offGridEnergy}
                    precision={2}
                    suffix="kWh"
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Generation"
                    value={totals.generateEnergy}
                    precision={2}
                    suffix="kWh"
                    prefix={<SunOutlined />}
                    valueStyle={{ color: COLORS.pv }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Net Grid Energy"
                    value={totals.gridInput - totals.feedOutput}
                    precision={2}
                    suffix="kWh"
                    valueStyle={{
                      color: totals.gridInput - totals.feedOutput > 0 ? COLORS.gridInput : COLORS.feedOutput,
                    }}
                  />
                  <Progress
                    percent={
                      totals.gridInput + totals.feedOutput > 0
                        ? ((totals.feedOutput / (totals.gridInput + totals.feedOutput)) * 100)
                        : 0
                    }
                    size="small"
                    format={(percent) => `${percent?.toFixed(0)}% export`}
                  />
                </Card>
              </Col>
            </Row>

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
                      {/* Energy Flow Chart */}
                      <Card title="Energy Flow Over Time" style={{ marginBottom: 16 }}>
                        <ResponsiveContainer width="100%" height={350}>
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                            <YAxis label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Grid Input" stroke={COLORS.gridInput} strokeWidth={2} />
                            <Line type="monotone" dataKey="Grid Export" stroke={COLORS.feedOutput} strokeWidth={2} />
                            <Line type="monotone" dataKey="Load Consumption" stroke={COLORS.load} strokeWidth={2} />
                            <Line type="monotone" dataKey="Generation" stroke={COLORS.pv} strokeWidth={2} />
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
                                <Tooltip />
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
                                <Tooltip />
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
                              <Tooltip />
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
