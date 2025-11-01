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
  Badge,
  Divider,
} from 'antd';
import {
  ThunderboltOutlined,
  DashboardOutlined,
  FireOutlined,
  ReloadOutlined,
  CloudOutlined,
  SunOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  ArrowRightOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ThunderboltFilled,
} from '@ant-design/icons';
import { fsolarDeviceService } from '../../../service/fsolar';
import type { Device } from '../../../types/fsolar';

const { Title, Text } = Typography;

interface DeviceMetrics {
  deviceSn: string;
  dataTimeStr: string;
  timeZone: string;
  pvPower: string;
  pvTotalPower: string;
  acTotalOutActPower: string;
  acTtlInpower: string;
  meterPower: string;
  emsPower: string;
  emsSoc: string;
  emsVoltage: string;
  emsCurrent: string;
  acRInVolt: string;
  acROutVolt: string;
  acRInCurr: string;
  acROutCurr: string;
  acRInFreq: string;
  pvVolt: string;
  pvInCurr: string;
  pv2Volt: string;
  pv2InCurr: string;
  tempMax: string;
  devTempMax: string;
  ePvToday: string;
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
      const result: any = await fsolarDeviceService.getBatchDeviceHistory({
        deviceSnList: deviceSn,
        startTime: Math.floor(Date.now() / 1000),
        endTime: Math.floor(Date.now() / 1000),
        timeZone: 0,
        queryType: 0,
      });

      if (result && result.data && result.data.length > 0) {
        setMetrics(result.data[0] as DeviceMetrics);
      }
    } catch (error: any) {
      message.error('Failed to fetch device metrics');
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

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (selectedDevice) {
        fetchMetrics(selectedDevice);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedDevice, autoRefresh]);

  if (!metrics) {
    return (
      <div>
        <Title level={2}>Fsolar Real-time Monitoring</Title>
        <Card loading={loading}>
          <Text type="secondary">Loading device metrics...</Text>
        </Card>
      </div>
    );
  }

  const soc = parseFloat(metrics.emsSoc || '0');
  const temp = parseFloat(metrics.tempMax || '0');
  const devTemp = parseFloat(metrics.devTempMax || '0');
  const pvPower = parseFloat(metrics.pvTotalPower || '0');
  const batteryPower = parseFloat(metrics.emsPower || '0');
  const gridPower = parseFloat(metrics.acTtlInpower || '0');
  const loadPower = parseFloat(metrics.acTotalOutActPower || '0');

  const getBatteryColor = (soc: number) => {
    if (soc > 70) return '#52c41a';
    if (soc > 30) return '#faad14';
    return '#ff4d4f';
  };

  const getTemperatureColor = (temp: number) => {
    if (temp > 70) return '#ff4d4f';
    if (temp > 50) return '#faad14';
    return '#52c41a';
  };

  const getSystemStatus = () => {
    const issues = [];
    if (soc < 20) issues.push('Low battery');
    if (temp > 70 || devTemp > 70) issues.push('High temperature');
    if (parseFloat(metrics.acRInFreq || '0') < 49 || parseFloat(metrics.acRInFreq || '0') > 51) {
      issues.push('Grid frequency abnormal');
    }

    if (issues.length === 0) {
      return { status: 'success', text: 'All Systems Normal', icon: <CheckCircleOutlined /> };
    }
    return { status: 'warning', text: `${issues.length} Issue(s)`, icon: <WarningOutlined />, issues };
  };

  const systemStatus = getSystemStatus();

  return (
    <div>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <DashboardOutlined /> Real-time Monitoring
          </Title>
        </Col>
        <Col>
          <Badge status={systemStatus.status as any} text={systemStatus.text} />
        </Col>
      </Row>

      {/* Controls */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            style={{ width: 300 }}
            value={selectedDevice}
            onChange={setSelectedDevice}
            placeholder="Select device"
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
            Auto: {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Text type="secondary">
            {metrics.dataTimeStr} ({metrics.timeZone})
          </Text>
        </Space>
      </Card>

      {/* System Alert */}
      {systemStatus.status === 'warning' && systemStatus.issues && (
        <Alert
          message="System Alert"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {systemStatus.issues.map((issue, idx) => (
                <li key={idx}>{issue}</li>
              ))}
            </ul>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Energy Flow Diagram */}
      <Card title={<><ArrowRightOutlined /> Energy Flow Overview</>} style={{ marginBottom: 16 }}>
        <Row gutter={[24, 24]} align="middle">
          {/* PV */}
          <Col span={6}>
            <Card
              size="small"
              style={{
                textAlign: 'center',
                background: pvPower > 0 ? '#fffbe6' : '#f5f5f5',
                border: pvPower > 0 ? '2px solid #faad14' : '1px solid #d9d9d9',
              }}
            >
              <SunOutlined style={{ fontSize: 32, color: pvPower > 0 ? '#faad14' : '#999' }} />
              <div style={{ marginTop: 8 }}>
                <Text strong>Solar PV</Text>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                  {pvPower.toFixed(1)} W
                </div>
              </div>
            </Card>
          </Col>

          {/* Arrow */}
          <Col span={2} style={{ textAlign: 'center' }}>
            <ArrowRightOutlined
              style={{ fontSize: 32, color: pvPower > 0 ? '#faad14' : '#d9d9d9' }}
            />
          </Col>

          {/* Battery */}
          <Col span={6}>
            <Card
              size="small"
              style={{
                textAlign: 'center',
                background: getBatteryColor(soc) + '20',
                border: `2px solid ${getBatteryColor(soc)}`,
              }}
            >
              <ThunderboltFilled style={{ fontSize: 32, color: getBatteryColor(soc) }} />
              <div style={{ marginTop: 8 }}>
                <Text strong>Battery</Text>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: getBatteryColor(soc) }}>
                  {soc.toFixed(0)}%
                </div>
                <div style={{ fontSize: 12 }}>
                  {batteryPower > 0 ? <ArrowUpOutlined /> : batteryPower < 0 ? <ArrowDownOutlined /> : ''}{' '}
                  {Math.abs(batteryPower).toFixed(1)} W
                </div>
              </div>
            </Card>
          </Col>

          {/* Arrow */}
          <Col span={2} style={{ textAlign: 'center' }}>
            <ArrowRightOutlined
              style={{ fontSize: 32, color: loadPower > 0 ? '#52c41a' : '#d9d9d9' }}
            />
          </Col>

          {/* Load */}
          <Col span={6}>
            <Card
              size="small"
              style={{
                textAlign: 'center',
                background: loadPower > 0 ? '#f6ffed' : '#f5f5f5',
                border: loadPower > 0 ? '2px solid #52c41a' : '1px solid #d9d9d9',
              }}
            >
              <HomeOutlined style={{ fontSize: 32, color: loadPower > 0 ? '#52c41a' : '#999' }} />
              <div style={{ marginTop: 8 }}>
                <Text strong>Load</Text>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                  {loadPower.toFixed(1)} W
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* Grid Connection */}
        <Row justify="center">
          <Col span={8}>
            <Card
              size="small"
              style={{
                textAlign: 'center',
                background: gridPower !== 0 ? '#e6f7ff' : '#f5f5f5',
                border: gridPower !== 0 ? '2px solid #1890ff' : '1px solid #d9d9d9',
              }}
            >
              <CloudOutlined style={{ fontSize: 28, color: gridPower !== 0 ? '#1890ff' : '#999' }} />
              <div style={{ marginTop: 8 }}>
                <Text strong>Grid</Text>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>
                  {gridPower > 0 ? '← ' : gridPower < 0 ? '→ ' : ''}
                  {Math.abs(gridPower).toFixed(1)} W
                </div>
                <div style={{ fontSize: 12 }}>
                  {gridPower > 0 ? 'Importing' : gridPower < 0 ? 'Exporting' : 'Idle'}
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Key Metrics Row */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Today's Solar Energy"
              value={parseFloat(metrics.ePvToday || '0')}
              precision={2}
              suffix="kWh"
              prefix={<SunOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Battery Voltage"
              value={parseFloat(metrics.emsVoltage || '0')}
              precision={1}
              suffix="V"
              prefix={<ThunderboltFilled />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Battery Current"
              value={parseFloat(metrics.emsCurrent || '0')}
              precision={1}
              suffix="A"
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="System Temperature"
              value={temp}
              precision={1}
              suffix="°C"
              prefix={<FireOutlined />}
              valueStyle={{ color: getTemperatureColor(temp) }}
            />
          </Card>
        </Col>
      </Row>

      {/* Detailed Grid Status */}
      <Card title={<><CloudOutlined /> Grid Details</>} style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Card size="small" title="Input (From Grid)" type="inner">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic title="Voltage" value={metrics.acRInVolt} suffix="V" />
                </Col>
                <Col span={8}>
                  <Statistic title="Current" value={metrics.acRInCurr} suffix="A" />
                </Col>
                <Col span={8}>
                  <Statistic title="Frequency" value={metrics.acRInFreq} suffix="Hz" />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="Output (To Load)" type="inner">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Voltage" value={metrics.acROutVolt} suffix="V" />
                </Col>
                <Col span={12}>
                  <Statistic title="Current" value={metrics.acROutCurr} suffix="A" />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* PV Strings */}
      <Card title={<><SunOutlined /> PV Strings Performance</>} style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Card size="small" title="String 1" type="inner">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic title="Voltage" value={metrics.pvVolt} suffix="V" />
                </Col>
                <Col span={8}>
                  <Statistic title="Current" value={metrics.pvInCurr} suffix="A" />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Power"
                    value={(
                      parseFloat(metrics.pvVolt || '0') * parseFloat(metrics.pvInCurr || '0')
                    ).toFixed(1)}
                    suffix="W"
                  />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="String 2" type="inner">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic title="Voltage" value={metrics.pv2Volt} suffix="V" />
                </Col>
                <Col span={8}>
                  <Statistic title="Current" value={metrics.pv2InCurr} suffix="A" />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Power"
                    value={(
                      parseFloat(metrics.pv2Volt || '0') * parseFloat(metrics.pv2InCurr || '0')
                    ).toFixed(1)}
                    suffix="W"
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* System Info */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="System Status">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Work Mode: </Text>
                <Tag color="blue" style={{ fontSize: 14 }}>
                  {metrics.workMode}
                </Tag>
              </div>
              <div>
                <Text strong>Device Temperature: </Text>
                <Text style={{ color: getTemperatureColor(devTemp), fontSize: 16, fontWeight: 'bold' }}>
                  {devTemp.toFixed(1)}°C
                </Text>
              </div>
              <div>
                <Text strong>Battery SOC: </Text>
                <Progress
                  percent={soc}
                  strokeColor={getBatteryColor(soc)}
                  status={soc > 30 ? 'active' : 'exception'}
                />
              </div>
            </Space>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Quick Stats">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Meter Power">{metrics.meterPower} W</Descriptions.Item>
              <Descriptions.Item label="PV Power">{metrics.pvPower} W</Descriptions.Item>
              <Descriptions.Item label="Device SN">{metrics.deviceSn}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RealTimeMonitoring;
