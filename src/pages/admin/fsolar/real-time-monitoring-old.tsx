import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Typography,
  Select,
  Space,
  Button,
  Alert,
  Descriptions,
  Tag,
  message,
} from 'antd';
import {
  ThunderboltOutlined,
  DashboardOutlined,
  FireOutlined,
  ReloadOutlined,
  CloudOutlined,
  SunOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { fsolarDeviceService } from '../../../service/fsolar';
import type { Device } from '../../../types/fsolar';

const { Title, Text } = Typography;

interface DeviceMetrics {
  deviceSn: string;
  dataTimeStr: string;
  timeZone: string;

  // Power
  pvPower: string;
  pvTotalPower: string;
  acTotalOutActPower: string;
  acTtlInpower: string;
  meterPower: string;
  emsPower: string;

  // Battery
  emsSoc: string;
  emsVoltage: string;
  emsCurrent: string;

  // Grid
  acRInVolt: string;
  acROutVolt: string;
  acRInCurr: string;
  acROutCurr: string;
  acRInFreq: string;

  // PV
  pvVolt: string;
  pvInCurr: string;
  pv2Volt: string;
  pv2InCurr: string;

  // Temperature
  tempMax: string;
  devTempMax: string;

  // Energy
  ePvToday: string;

  // Mode
  workMode: string;
}

const RealTimeMonitoring: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [metrics, setMetrics] = useState<DeviceMetrics | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

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

  // Fetch real-time metrics
  const fetchMetrics = async (deviceSn: string) => {
    try {
      setLoading(true);

      // Use queryType=0 to get latest real-time data
      const result: any = await fsolarDeviceService.getBatchDeviceHistory({
        deviceSnList: deviceSn,
        queryType: 0,
      } as any);

      // The API returns data in dataList array for queryType=0
      if (result.dataList && result.dataList.length > 0) {
        setMetrics(result.dataList[0]);
      }
    } catch (error: any) {
      console.error('Failed to fetch metrics', error);
      message.error('Failed to fetch real-time data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchMetrics(selectedDevice);
    }
  }, [selectedDevice]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (autoRefresh && selectedDevice) {
      const interval = setInterval(() => {
        fetchMetrics(selectedDevice);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedDevice]);

  const getBatteryColor = (soc: number): string => {
    if (soc >= 80) return '#52c41a';
    if (soc >= 50) return '#1890ff';
    if (soc >= 20) return '#faad14';
    return '#f5222d';
  };

  const getTemperatureColor = (temp: number): string => {
    if (temp >= 60) return '#f5222d';
    if (temp >= 50) return '#faad14';
    return '#52c41a';
  };

  if (!metrics) {
    return (
      <div>
        <Title level={2}>Real-time Monitoring</Title>
        <Space style={{ marginBottom: 16 }}>
          <Select
            style={{ width: 300 }}
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
          <Button icon={<ReloadOutlined />} onClick={() => selectedDevice && fetchMetrics(selectedDevice)}>
            Refresh
          </Button>
        </Space>
        <Alert
          message="No Data Available"
          description="Waiting for real-time data from the selected device..."
          type="info"
          showIcon
        />
      </div>
    );
  }

  const soc = parseFloat(metrics.emsSoc || '0');
  const temp = parseFloat(metrics.tempMax || '0');
  const devTemp = parseFloat(metrics.devTempMax || '0');

  return (
    <div>
      <Title level={2}>Real-time Monitoring</Title>

      {/* Device Selector */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Select
            style={{ width: 300 }}
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
          <Button
            icon={<ReloadOutlined />}
            onClick={() => selectedDevice && fetchMetrics(selectedDevice)}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            type={autoRefresh ? 'primary' : 'default'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Text type="secondary">
            Last updated: {metrics.dataTimeStr} ({metrics.timeZone})
          </Text>
        </Space>
      </Card>

      {/* Power Overview */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="PV Power"
              value={parseFloat(metrics.pvTotalPower || '0')}
              precision={1}
              suffix="W"
              prefix={<SunOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="AC Output Power"
              value={parseFloat(metrics.acTotalOutActPower || '0')}
              precision={0}
              suffix="W"
              prefix={<ThunderboltOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="AC Input Power"
              value={parseFloat(metrics.acTtlInpower || '0')}
              precision={0}
              suffix="W"
              prefix={<ArrowDownOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="EMS Power"
              value={parseFloat(metrics.emsPower || '0')}
              precision={0}
              suffix="W"
              prefix={<DashboardOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Battery Status */}
      <Card title={<><ThunderboltOutlined /> Battery Status</>} style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={soc}
                strokeColor={getBatteryColor(soc)}
                format={(percent) => `${percent}%`}
                size={120}
              />
              <div style={{ marginTop: 16 }}>
                <Text strong>State of Charge</Text>
              </div>
            </div>
          </Col>
          <Col span={8}>
            <Statistic
              title="Voltage"
              value={parseFloat(metrics.emsVoltage || '0')}
              precision={1}
              suffix="V"
              valueStyle={{ fontSize: 32 }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Current"
              value={parseFloat(metrics.emsCurrent || '0')}
              precision={1}
              suffix="A"
              valueStyle={{ fontSize: 32 }}
            />
          </Col>
        </Row>
      </Card>

      {/* Grid Status */}
      <Card title={<><CloudOutlined /> Grid Status</>} style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Descriptions title="Input (Grid)" bordered size="small" column={2}>
              <Descriptions.Item label="Voltage">{metrics.acRInVolt} V</Descriptions.Item>
              <Descriptions.Item label="Current">{metrics.acRInCurr} A</Descriptions.Item>
              <Descriptions.Item label="Frequency" span={2}>{metrics.acRInFreq} Hz</Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions title="Output (Load)" bordered size="small" column={2}>
              <Descriptions.Item label="Voltage">{metrics.acROutVolt} V</Descriptions.Item>
              <Descriptions.Item label="Current">{metrics.acROutCurr} A</Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* PV Status */}
      <Card title={<><SunOutlined /> PV Strings</>} style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Descriptions title="PV String 1" bordered size="small">
              <Descriptions.Item label="Voltage">{metrics.pvVolt} V</Descriptions.Item>
              <Descriptions.Item label="Current">{metrics.pvInCurr} A</Descriptions.Item>
              <Descriptions.Item label="Power">
                {(parseFloat(metrics.pvVolt || '0') * parseFloat(metrics.pvInCurr || '0')).toFixed(1)} W
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions title="PV String 2" bordered size="small">
              <Descriptions.Item label="Voltage">{metrics.pv2Volt} V</Descriptions.Item>
              <Descriptions.Item label="Current">{metrics.pv2InCurr} A</Descriptions.Item>
              <Descriptions.Item label="Power">
                {(parseFloat(metrics.pv2Volt || '0') * parseFloat(metrics.pv2InCurr || '0')).toFixed(1)} W
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* Temperature & Energy */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title={<><FireOutlined /> Temperature</>}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Max Temperature"
                  value={temp}
                  precision={1}
                  suffix="°C"
                  valueStyle={{ color: getTemperatureColor(temp) }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Device Max Temp"
                  value={devTemp}
                  precision={1}
                  suffix="°C"
                  valueStyle={{ color: getTemperatureColor(devTemp) }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={12}>
          <Card title={<><ThunderboltOutlined /> Energy & Mode</>}>
            <Statistic
              title="Today's PV Energy"
              value={parseFloat(metrics.ePvToday || '0')}
              precision={2}
              suffix="kWh"
              style={{ marginBottom: 16 }}
            />
            <div>
              <Text strong>Work Mode: </Text>
              <Tag color="blue">{metrics.workMode}</Tag>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RealTimeMonitoring;
