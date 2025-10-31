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
} from 'antd';
import {
  ReloadOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { fsolarDeviceService, toFsolarDate, TIME_DIMENSION } from '../../../service/fsolar';
import type { Device } from '../../../types/fsolar';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text } = Typography;

const EnergyAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [energyData, setEnergyData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [timeDimension, setTimeDimension] = useState<1 | 2 | 3>(TIME_DIMENSION.DAY);

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
  const fetchEnergyData = async (deviceSn: string, date: Dayjs, dimension: 1 | 2 | 3) => {
    try {
      setLoading(true);
      const result = await fsolarDeviceService.getDeviceEnergy({
        deviceSn,
        date: toFsolarDate(date.toDate()),
        timeDimension: dimension,
      });
      setEnergyData(result);

      if (!result.energyData || result.energyData.length === 0) {
        message.info('No energy data available for the selected period');
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to fetch energy data');
      setEnergyData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchEnergyData(selectedDevice, selectedDate, timeDimension);
    }
  }, [selectedDevice, selectedDate, timeDimension]);

  const handleRefresh = () => {
    if (selectedDevice) {
      fetchEnergyData(selectedDevice, selectedDate, timeDimension);
    }
  };

  const getTotalProduction = (): number => {
    if (!energyData?.energyData) return 0;
    return energyData.energyData.reduce(
      (sum: number, item: any) => sum + (parseFloat(item.production) || 0),
      0
    );
  };

  const getTotalConsumption = (): number => {
    if (!energyData?.energyData) return 0;
    return energyData.energyData.reduce(
      (sum: number, item: any) => sum + (parseFloat(item.consumption) || 0),
      0
    );
  };

  const getDimensionLabel = (): string => {
    switch (timeDimension) {
      case TIME_DIMENSION.DAY:
        return 'Daily';
      case TIME_DIMENSION.MONTH:
        return 'Monthly';
      case TIME_DIMENSION.YEAR:
        return 'Yearly';
      default:
        return 'Daily';
    }
  };

  return (
    <div>
      <Title level={2}>Energy Analytics</Title>

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
            <Radio.Button value={TIME_DIMENSION.DAY}>
              <LineChartOutlined /> Daily
            </Radio.Button>
            <Radio.Button value={TIME_DIMENSION.MONTH}>
              <BarChartOutlined /> Monthly
            </Radio.Button>
            <Radio.Button value={TIME_DIMENSION.YEAR}>
              <BarChartOutlined /> Yearly
            </Radio.Button>
          </Radio.Group>

          <DatePicker
            value={selectedDate}
            onChange={(date) => date && setSelectedDate(date)}
            picker={timeDimension === TIME_DIMENSION.YEAR ? 'year' : timeDimension === TIME_DIMENSION.MONTH ? 'month' : 'date'}
          />

          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            Refresh
          </Button>
        </Space>
      </Card>

      {/* Summary Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title={`Total Production (${getDimensionLabel()})`}
              value={getTotalProduction()}
              precision={2}
              suffix="kWh"
              prefix={<ThunderboltOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={`Total Consumption (${getDimensionLabel()})`}
              value={getTotalConsumption()}
              precision={2}
              suffix="kWh"
              prefix={<ThunderboltOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Net Energy"
              value={getTotalProduction() - getTotalConsumption()}
              precision={2}
              suffix="kWh"
              prefix={<ThunderboltOutlined />}
              valueStyle={{
                color: getTotalProduction() - getTotalConsumption() >= 0 ? '#52c41a' : '#f5222d',
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Energy Data Display */}
      {energyData && energyData.energyData && energyData.energyData.length > 0 ? (
        <Card title="Energy Details">
          <Alert
            message="Energy Data Available"
            description={`Found ${energyData.energyData.length} data points for ${energyData.deviceSn} on ${energyData.date}`}
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />

          {/* Simple table view */}
          <div style={{ maxHeight: 400, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <th style={{ padding: 12, borderBottom: '1px solid #d9d9d9' }}>Timestamp</th>
                  <th style={{ padding: 12, borderBottom: '1px solid #d9d9d9' }}>Production (kWh)</th>
                  <th style={{ padding: 12, borderBottom: '1px solid #d9d9d9' }}>Consumption (kWh)</th>
                  <th style={{ padding: 12, borderBottom: '1px solid #d9d9d9' }}>Net (kWh)</th>
                </tr>
              </thead>
              <tbody>
                {energyData.energyData.map((item: any, index: number) => {
                  const production = parseFloat(item.production) || 0;
                  const consumption = parseFloat(item.consumption) || 0;
                  const net = production - consumption;

                  return (
                    <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: 12 }}>{item.timestamp}</td>
                      <td style={{ padding: 12, color: '#52c41a' }}>{production.toFixed(2)}</td>
                      <td style={{ padding: 12, color: '#1890ff' }}>{consumption.toFixed(2)}</td>
                      <td style={{ padding: 12, color: net >= 0 ? '#52c41a' : '#f5222d' }}>
                        {net.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
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
                  <li>There was no solar production during this period</li>
                </ul>
              </p>
              <p>Try selecting a different date or device.</p>
            </>
          }
          type="info"
          showIcon
        />
      )}

      <Card style={{ marginTop: 16 }} type="inner">
        <Text type="secondary">
          <strong>Note:</strong> Energy analytics shows production and consumption data.
          Charts and advanced visualizations can be added here using libraries like Recharts or Chart.js.
        </Text>
      </Card>
    </div>
  );
};

export default EnergyAnalytics;
