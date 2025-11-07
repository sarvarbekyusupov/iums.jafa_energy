import React, { useState, useEffect } from 'react';
import {
  Card,
  Select,
  Space,
  Button,
  Typography,
  Descriptions,
  Tabs,
  Alert,
  message,
  Row,
  Col,
  Tag,
  Divider,
  Collapse,
  Form,
  Modal,
  InputNumber,
  Switch,
  Badge,
  Statistic,
  Tooltip,
  Progress,
} from 'antd';
import {
  ReloadOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  EditOutlined,
  SafetyOutlined,
  ThunderboltFilled,
  DashboardOutlined,
  ControlOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  BellOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { fsolarDeviceService } from '../../../service/fsolar';
import type { Device } from '../../../types/fsolar';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const DeviceSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [settings, setSettings] = useState<any>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState<string>('');
  const [form] = Form.useForm();

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

  // Fetch settings
  const fetchSettings = async (deviceSn: string) => {
    try {
      setLoading(true);
      const result = await fsolarDeviceService.getDeviceSettings(deviceSn);
      setSettings(result);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to fetch device settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchSettings(selectedDevice);
    }
  }, [selectedDevice]);

  const handleEdit = (section: string, initialValues: any) => {
    setEditingSection(section);
    form.setFieldsValue(initialValues);
    setEditModalVisible(true);
  };

  const handleSaveSettings = async (values: any) => {
    try {
      setLoading(true);

      const result = await fsolarDeviceService.setDeviceSettings({
        deviceSn: selectedDevice,
        content: values,
      });

      message.success(`Settings updated successfully. Command ID: ${result.id}`);
      setEditModalVisible(false);
      form.resetFields();

      // Refresh settings after a short delay to allow backend to process
      setTimeout(() => fetchSettings(selectedDevice), 2000);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (!settings) {
    return (
      <div>
        <Title level={2}>Device Settings</Title>
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
          <Button icon={<ReloadOutlined />} onClick={() => selectedDevice && fetchSettings(selectedDevice)}>
            Refresh
          </Button>
        </Space>
        <Alert
          message="No Data Available"
          description="Select a device to view its settings"
          type="info"
          showIcon
        />
      </div>
    );
  }

  // Get quick stats
  const getEnabledCount = () => {
    let count = 0;
    if (settings.zeroExportFunction === '1') count++;
    if (settings.remoteOnOffEnable === '1') count++;
    if (settings.buzzerEnable === '1') count++;
    if (settings.highVoltageRideThroughFunctionEnable === '1') count++;
    if (settings.lowVoltageRideThroughFunctionEnable === '1') count++;
    return count;
  };

  const getActiveRulesCount = () => {
    let count = 0;
    for (let i = 1; i <= 10; i++) {
      const rule = settings[`ecoRule${i}`];
      if (rule && rule.ruleMode === '1') count++;
    }
    return count;
  };

  return (
    <div>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <ControlOutlined /> Device Settings & Configuration
          </Title>
        </Col>
      </Row>

      {/* Device Selector & Quick Stats */}
      <Card
        style={{ marginBottom: 16, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
      >
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space size="large">
              <div>
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginBottom: 4 }}>
                  Selected Device
                </div>
                <Select
                  size="large"
                  style={{ width: 350 }}
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
              </div>
              <Divider type="vertical" style={{ borderColor: 'rgba(255,255,255,0.3)', height: 50 }} />
              <div>
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>Device SN</div>
                <div style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 4 }}>
                  {settings.deviceSn}
                </div>
              </div>
            </Space>
          </Col>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => selectedDevice && fetchSettings(selectedDevice)}
              loading={loading}
              size="large"
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Quick Overview Stats */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: '#f0f5ff', border: '1px solid #adc6ff' }}>
            <Statistic
              title="Operation Mode"
              value={settings.operatedMode === '0' ? 'General' : settings.operatedMode === '1' ? 'Backup' : 'Eco Mode'}
              prefix={<DashboardOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ fontSize: 18, color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
            <Statistic
              title="Active Features"
              value={getEnabledCount()}
              suffix="/ 5"
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ fontSize: 18, color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: '#fff7e6', border: '1px solid #ffd591' }}>
            <Statistic
              title="Economic Rules"
              value={getActiveRulesCount()}
              suffix="/ 10"
              prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ fontSize: 18, color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: '#fff1f0', border: '1px solid #ffccc7' }}>
            <Statistic
              title="Grid Standard"
              value={settings.gridStandardCode || 'N/A'}
              prefix={<SafetyOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ fontSize: 18, color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="grid" size="large">
        {/* Grid Settings */}
        <TabPane
          tab={
            <Space>
              <ThunderboltFilled />
              <span>Grid Settings</span>
            </Space>
          }
          key="grid"
        >
          <Card
            title={
              <Space>
                <ControlOutlined />
                <span>Grid Configuration</span>
              </Space>
            }
            extra={
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() =>
                  handleEdit('grid', {
                    acOutputRatedVoltage: settings.acOutputRatedVoltage,
                    onGridPowerLimit: settings.onGridPowerLimit,
                    powerFactor: settings.powerFactor,
                  })
                }
              >
                Edit Settings
              </Button>
            }
            style={{ marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <div style={{ padding: 16, background: '#f0f5ff', borderRadius: 8, border: '1px solid #d6e4ff' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>AC Output Voltage</Text>
                  <div style={{ marginTop: 8, fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                    {settings.acOutputRatedVoltage} <span style={{ fontSize: 14 }}>V</span>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div style={{ padding: 16, background: '#f0f5ff', borderRadius: 8, border: '1px solid #d6e4ff' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>AC Output Frequency</Text>
                  <div style={{ marginTop: 8, fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                    {settings.acOutputRatedFrequency} <span style={{ fontSize: 14 }}>Hz</span>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div style={{ padding: 16, background: '#f0f5ff', borderRadius: 8, border: '1px solid #d6e4ff' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Grid Standard</Text>
                  <div style={{ marginTop: 8, fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                    {settings.gridStandardCode}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div style={{ padding: 16, background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Power Limit</Text>
                  <div style={{ marginTop: 8 }}>
                    <Progress
                      type="dashboard"
                      percent={parseInt(settings.onGridPowerLimit || '0')}
                      size={80}
                      strokeColor="#52c41a"
                    />
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div style={{ padding: 16, background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Power Slope</Text>
                  <div style={{ marginTop: 8, fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                    {settings.onGridPowerSlope}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div style={{ padding: 16, background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Power Factor</Text>
                  <div style={{ marginTop: 8, fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                    {settings.powerFactor}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          <Card
            title={
              <Space>
                <SafetyOutlined />
                <span>Voltage Protection Settings</span>
              </Space>
            }
            style={{ marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card
                  size="small"
                  title={
                    <Space>
                      <WarningOutlined style={{ color: '#ff4d4f' }} />
                      <Text strong>Stage 1 Over-Voltage</Text>
                    </Space>
                  }
                  style={{ background: '#fff1f0', border: '1px solid #ffccc7' }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="Trip Value"
                        value={settings.overVoltageStage1TripValue}
                        suffix="V"
                        valueStyle={{ color: '#ff4d4f', fontSize: 20 }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Trip Time"
                        value={settings.overVoltageStage1TripTime}
                        suffix="s"
                        valueStyle={{ color: '#ff4d4f', fontSize: 20 }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card
                  size="small"
                  title={
                    <Space>
                      <WarningOutlined style={{ color: '#ff4d4f' }} />
                      <Text strong>Stage 2 Over-Voltage</Text>
                    </Space>
                  }
                  style={{ background: '#fff1f0', border: '1px solid #ffccc7' }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="Trip Value"
                        value={settings.overVoltageStage2TripValue}
                        suffix="V"
                        valueStyle={{ color: '#ff4d4f', fontSize: 20 }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Trip Time"
                        value={settings.overVoltageStage2TripTime}
                        suffix="s"
                        valueStyle={{ color: '#ff4d4f', fontSize: 20 }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card
                  size="small"
                  title={
                    <Space>
                      <WarningOutlined style={{ color: '#faad14' }} />
                      <Text strong>Stage 1 Under-Voltage</Text>
                    </Space>
                  }
                  style={{ background: '#fffbe6', border: '1px solid #ffe58f' }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="Trip Value"
                        value={settings.underVoltageStage1TripValue}
                        suffix="V"
                        valueStyle={{ color: '#faad14', fontSize: 20 }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Trip Time"
                        value={settings.underVoltageStage1TripTime}
                        suffix="s"
                        valueStyle={{ color: '#faad14', fontSize: 20 }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card
                  size="small"
                  title={
                    <Space>
                      <WarningOutlined style={{ color: '#faad14' }} />
                      <Text strong>Stage 2 Under-Voltage</Text>
                    </Space>
                  }
                  style={{ background: '#fffbe6', border: '1px solid #ffe58f' }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="Trip Value"
                        value={settings.underVoltageStage2TripValue}
                        suffix="V"
                        valueStyle={{ color: '#faad14', fontSize: 20 }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Trip Time"
                        value={settings.underVoltageStage2TripTime}
                        suffix="s"
                        valueStyle={{ color: '#faad14', fontSize: 20 }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Card>

          <Divider />

          <Card title="Frequency Protection Settings">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Stage 1 Over-Frequency</Text>
                <Descriptions bordered column={1} size="small" style={{ marginTop: 8 }}>
                  <Descriptions.Item label="Trip Value">
                    {settings.overFrequencyStage1TripValue} Hz
                  </Descriptions.Item>
                  <Descriptions.Item label="Trip Time">
                    {settings.overFrequencyStage1TripTime} s
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Text strong>Stage 2 Over-Frequency</Text>
                <Descriptions bordered column={1} size="small" style={{ marginTop: 8 }}>
                  <Descriptions.Item label="Trip Value">
                    {settings.overFrequencyStage2TripValue} Hz
                  </Descriptions.Item>
                  <Descriptions.Item label="Trip Time">
                    {settings.overFrequencyStage2TripTime} s
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Text strong>Stage 1 Under-Frequency</Text>
                <Descriptions bordered column={1} size="small" style={{ marginTop: 8 }}>
                  <Descriptions.Item label="Trip Value">
                    {settings.underFrequencyStage1TripValue} Hz
                  </Descriptions.Item>
                  <Descriptions.Item label="Trip Time">
                    {settings.underFrequencyStage1TripTime} s
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Text strong>Stage 2 Under-Frequency</Text>
                <Descriptions bordered column={1} size="small" style={{ marginTop: 8 }}>
                  <Descriptions.Item label="Trip Value">
                    {settings.underFrequencyStage2TripValue} Hz
                  </Descriptions.Item>
                  <Descriptions.Item label="Trip Time">
                    {settings.underFrequencyStage2TripTime} s
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </Card>

          <Divider />

          <Card
            title="Zero Export"
            extra={
              <Button
                icon={<EditOutlined />}
                onClick={() =>
                  handleEdit('zeroExport', {
                    zeroExportFunction: settings.zeroExportFunction,
                    zeroExportAdjustmentPower: settings.zeroExportAdjustmentPower,
                  })
                }
              >
                Edit
              </Button>
            }
          >
            <Descriptions bordered>
              <Descriptions.Item label="Zero Export Function">
                <Tag color={settings.zeroExportFunction === '1' ? 'green' : 'red'}>
                  {settings.zeroExportFunction === '1' ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Zero Export Adjustment Power">
                {settings.zeroExportAdjustmentPower} W
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Divider />

          <Card title="Voltage Ride Through (VRT) Settings">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card size="small" title="High Voltage Ride Through (HVRT)">
                  <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="HVRT Function Enable">
                      <Tag color={settings.highVoltageRideThroughFunctionEnable === '1' ? 'green' : 'red'}>
                        {settings.highVoltageRideThroughFunctionEnable === '1' ? 'Enabled' : 'Disabled'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Crossing Trip Threshold">
                      {settings.highVoltageCrossingTripThreshold} V
                    </Descriptions.Item>
                    <Descriptions.Item label="Start Point Trip Value">
                      {settings.highVoltageStartPointTripValue} V
                    </Descriptions.Item>
                    <Descriptions.Item label="Start Point Trip Time">
                      {settings.highVoltageStartPointTripTime} s
                    </Descriptions.Item>
                    <Descriptions.Item label="End Point Trip Value">
                      {settings.highVoltageEndPointTripValue} V
                    </Descriptions.Item>
                    <Descriptions.Item label="End Point Trip Time">
                      {settings.highVoltageEndPointTripTime} s
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col span={24}>
                <Card size="small" title="Low Voltage Ride Through (LVRT)">
                  <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="LVRT Function Enable">
                      <Tag color={settings.lowVoltageRideThroughFunctionEnable === '1' ? 'green' : 'red'}>
                        {settings.lowVoltageRideThroughFunctionEnable === '1' ? 'Enabled' : 'Disabled'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Crossing Trip Threshold">
                      {settings.lowVoltageCrossingTripThreshold} V
                    </Descriptions.Item>
                    <Descriptions.Item label="Start Point Trip Value">
                      {settings.lowVoltageStartPointTripValue} V
                    </Descriptions.Item>
                    <Descriptions.Item label="Start Point Trip Time">
                      {settings.lowVoltageStartPointTripTime} s
                    </Descriptions.Item>
                    <Descriptions.Item label="End Point Trip Value">
                      {settings.lowVoltageEndPointTripValue} V
                    </Descriptions.Item>
                    <Descriptions.Item label="End Point Trip Time">
                      {settings.lowVoltageEndPointTripTime} s
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </Card>
        </TabPane>

        {/* Battery Settings */}
        <TabPane
          tab={
            <span>
              <ThunderboltOutlined />
              Battery Settings
            </span>
          }
          key="battery"
        >
          <Card
            title="Battery Configuration"
            extra={
              <Button
                icon={<EditOutlined />}
                onClick={() =>
                  handleEdit('battery', {
                    batteryModel: settings.batteryModel,
                    batteryOnGridDischargeDepthSoc: settings.batteryOnGridDischargeDepthSoc,
                    batteryOffGridDischargeDepthSoc: settings.batteryOffGridDischargeDepthSoc,
                    batteryOffGridRecoveryDepthSoc: settings.batteryOffGridRecoveryDepthSoc,
                  })
                }
              >
                Edit
              </Button>
            }
          >
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Battery Model">
                {settings.batteryModel}
              </Descriptions.Item>
              <Descriptions.Item label="On-Grid Discharge Depth (SOC)">
                {settings.batteryOnGridDischargeDepthSoc}%
              </Descriptions.Item>
              <Descriptions.Item label="Off-Grid Discharge Depth (SOC)">
                {settings.batteryOffGridDischargeDepthSoc}%
              </Descriptions.Item>
              <Descriptions.Item label="Off-Grid Recovery Depth (SOC)">
                {settings.batteryOffGridRecoveryDepthSoc}%
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </TabPane>

        {/* Economic Rules */}
        <TabPane
          tab={
            <span>
              <ClockCircleOutlined />
              Economic Rules
            </span>
          }
          key="economic"
        >
          <Card title="Time-based Economic Rules">
            <Collapse accordion>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((ruleNum) => {
                const rule = settings[`ecoRule${ruleNum}`];
                if (!rule) return null;

                return (
                  <Panel
                    header={`Economic Rule ${ruleNum}`}
                    key={ruleNum}
                    extra={
                      rule.ruleMode ? (
                        <Tag color="green">Active</Tag>
                      ) : (
                        <Tag>Inactive</Tag>
                      )
                    }
                  >
                    <Descriptions bordered column={2} size="small">
                      {rule.ruleMode !== null && rule.ruleMode !== undefined && (
                        <Descriptions.Item label="Rule Mode">
                          <Tag color={rule.ruleMode === '1' ? 'green' : 'default'}>
                            {rule.ruleMode === '1' ? 'Charge Enabled' : rule.ruleMode === '0' ? 'Disabled' : rule.ruleMode}
                          </Tag>
                        </Descriptions.Item>
                      )}
                      {rule.startTime && (
                        <Descriptions.Item label="Start Time">
                          {rule.startTime}
                        </Descriptions.Item>
                      )}
                      {rule.stopTime && (
                        <Descriptions.Item label="Stop Time">
                          {rule.stopTime}
                        </Descriptions.Item>
                      )}
                      {rule.startDay && (
                        <Descriptions.Item label="Start Day">
                          {rule.startDay}
                        </Descriptions.Item>
                      )}
                      {rule.stopDay && (
                        <Descriptions.Item label="Stop Day">
                          {rule.stopDay}
                        </Descriptions.Item>
                      )}
                      {rule.soc && (
                        <Descriptions.Item label="SOC Target">
                          {rule.soc}%
                        </Descriptions.Item>
                      )}
                      {rule.power && (
                        <Descriptions.Item label="Power">
                          {rule.power} W
                        </Descriptions.Item>
                      )}
                      {rule.voltage && (
                        <Descriptions.Item label="Voltage">
                          {rule.voltage} V
                        </Descriptions.Item>
                      )}
                      {rule.daysOfEffectiveWeek && (
                        <Descriptions.Item label="Effective Days" span={2}>
                          {Array.isArray(rule.daysOfEffectiveWeek)
                            ? rule.daysOfEffectiveWeek.map((day: string) => (
                                <Tag key={day} color="blue" style={{ marginRight: 4 }}>{day}</Tag>
                              ))
                            : rule.daysOfEffectiveWeek
                          }
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </Panel>
                );
              })}
            </Collapse>
          </Card>
        </TabPane>

        {/* Operation Mode */}
        <TabPane
          tab={
            <span>
              <SettingOutlined />
              Operation
            </span>
          }
          key="operation"
        >
          <Card
            title="Operation Mode & Control"
            extra={
              <Button
                icon={<EditOutlined />}
                onClick={() =>
                  handleEdit('operation', {
                    operatedMode: settings.operatedMode,
                    remoteOnOffEnable: settings.remoteOnOffEnable,
                    remoteOutputOnOffControl: settings.remoteOutputOnOffControl,
                    buzzerEnable: settings.buzzerEnable,
                  })
                }
              >
                Edit
              </Button>
            }
          >
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Operated Mode">
                {settings.operatedMode}
              </Descriptions.Item>
              <Descriptions.Item label="Work Mode">
                {settings.workMode}
              </Descriptions.Item>
              <Descriptions.Item label="Remote On/Off Enable">
                <Tag color={settings.remoteOnOffEnable === '1' ? 'green' : 'red'}>
                  {settings.remoteOnOffEnable === '1' ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Remote Output On/Off Control">
                <Tag color={settings.remoteOutputOnOffControl === '1' ? 'green' : 'red'}>
                  {settings.remoteOutputOnOffControl === '1' ? 'ON' : 'OFF'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Buzzer Enable">
                <Tag color={settings.buzzerEnable === '1' ? 'green' : 'red'}>
                  {settings.buzzerEnable === '1' ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="LCD Backlight Enable">
                <Tag color={settings.lcdBacklightEnable === '1' ? 'green' : 'red'}>
                  {settings.lcdBacklightEnable === '1' ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </TabPane>

        {/* Advanced Settings */}
        <TabPane
          tab={
            <span>
              <SettingOutlined />
              Advanced
            </span>
          }
          key="advanced"
        >
          <Card title="Curve Function Settings">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="FP Curve Function">
                <Tag color={settings.fpCurveFunctionEnable === '1' ? 'green' : 'red'}>
                  {settings.fpCurveFunctionEnable === '1' ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="PF-Power Curve Function">
                <Tag color={settings.pfPowerCurveFunctionEnable === '1' ? 'green' : 'red'}>
                  {settings.pfPowerCurveFunctionEnable === '1' ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="P(U) Curve Function">
                <Tag color={settings.puCurveFunctionEnable === '1' ? 'green' : 'red'}>
                  {settings.puCurveFunctionEnable === '1' ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Q(U) Curve Function">
                <Tag color={settings.quCurveFunctionEnable === '1' ? 'green' : 'red'}>
                  {settings.quCurveFunctionEnable === '1' ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="FP Charge Curve Function">
                <Tag color={settings.fpChargeCurveFunctionEnable === '1' ? 'green' : 'red'}>
                  {settings.fpChargeCurveFunctionEnable === '1' ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Fix Q Percent">
                {settings.fixQPencent}%
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Divider />

          <Card title="Protection & Detection Settings">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Anti-Islanding Detection">
                <Tag color={settings.antiIslandingDetectionEnable === '1' ? 'green' : 'red'}>
                  {settings.antiIslandingDetectionEnable === '1' ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="ISO Detection">
                <Tag color={settings.isoDetectionEnable === '1' ? 'green' : 'red'}>
                  {settings.isoDetectionEnable === '1' ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Grid Waveform Detection Mode">
                {settings.gridWaveformDetectionMode}
              </Descriptions.Item>
              <Descriptions.Item label="Grid Power Unbalance">
                <Tag color={settings.gridPowerUnbalanceEnable === '1' ? 'green' : 'red'}>
                  {settings.gridPowerUnbalanceEnable === '1' ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Overload Protection Reset">
                <Tag color={settings.overLoadProtectionResetEnable === '1' ? 'green' : 'red'}>
                  {settings.overLoadProtectionResetEnable === '1' ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="On-Grid Observation Time">
                {settings.onGridObservationTime} s
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Divider />

          <Card title="GFCI Protection Levels">
            <Descriptions bordered column={3}>
              <Descriptions.Item label="GFCI Level 1">
                <Tag color={settings.gfciLevel1ProtectionEnable === '1' ? 'green' : 'red'}>
                  {settings.gfciLevel1ProtectionEnable === '1' ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="GFCI Level 2">
                <Tag color={settings.gfciLevel2ProtectionEnable === '1' ? 'green' : 'red'}>
                  {settings.gfciLevel2ProtectionEnable === '1' ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="GFCI Level 3">
                <Tag color={settings.gfciLevel3ProtectionEnable === '1' ? 'green' : 'red'}>
                  {settings.gfciLevel3ProtectionEnable === '1' ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Divider />

          <Card title="Logging & Miscellaneous">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Fault Log Function">
                <Tag color={settings.faultLogFunctionEnable === '1' ? 'green' : 'red'}>
                  {settings.faultLogFunctionEnable === '1' ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Event Log Function">
                <Tag color={settings.eventLogFunctionEnable === '1' ? 'green' : 'red'}>
                  {settings.eventLogFunctionEnable === '1' ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="PV Parallel Setting">
                {settings.pvParallelSetting}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </TabPane>
      </Tabs>

      {/* Edit Modal */}
      <Modal
        title={`Edit ${editingSection} Settings`}
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={600}
      >
        <Alert
          message="Warning"
          description="Changing device settings may affect system operation. Please ensure you understand the implications before making changes."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form form={form} layout="vertical" onFinish={handleSaveSettings}>
          {editingSection === 'grid' && (
            <>
              <Form.Item
                label="AC Output Rated Voltage (V)"
                name="acOutputRatedVoltage"
                rules={[{ required: true, message: 'Please enter voltage' }]}
              >
                <InputNumber min={0} max={400} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                label="On-Grid Power Limit (%)"
                name="onGridPowerLimit"
                rules={[{ required: true, message: 'Please enter power limit' }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                label="Power Factor"
                name="powerFactor"
                rules={[{ required: true, message: 'Please enter power factor' }]}
              >
                <InputNumber min={0} max={1} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </>
          )}

          {editingSection === 'battery' && (
            <>
              <Form.Item
                label="Battery Model"
                name="batteryModel"
                rules={[{ required: true, message: 'Please select battery model' }]}
              >
                <Select>
                  <Select.Option value="1">Model 1</Select.Option>
                  <Select.Option value="2">Model 2</Select.Option>
                  <Select.Option value="3">FelicitySolar LPBA</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="On-Grid Discharge Depth SOC (%)"
                name="batteryOnGridDischargeDepthSoc"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                label="Off-Grid Discharge Depth SOC (%)"
                name="batteryOffGridDischargeDepthSoc"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                label="Off-Grid Recovery Depth SOC (%)"
                name="batteryOffGridRecoveryDepthSoc"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </>
          )}

          {editingSection === 'operation' && (
            <>
              <Form.Item
                label="Operated Mode"
                name="operatedMode"
                rules={[{ required: true }]}
              >
                <Select>
                  <Select.Option value="0">General</Select.Option>
                  <Select.Option value="1">Backup</Select.Option>
                  <Select.Option value="2">Eco Mode</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Remote On/Off Enable"
                name="remoteOnOffEnable"
                valuePropName="checked"
                getValueFromEvent={(checked) => checked ? '1' : '0'}
                getValueProps={(value) => ({ checked: value === '1' })}
              >
                <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
              </Form.Item>
              <Form.Item
                label="Remote Output Control"
                name="remoteOutputOnOffControl"
                valuePropName="checked"
                getValueFromEvent={(checked) => checked ? '1' : '0'}
                getValueProps={(value) => ({ checked: value === '1' })}
              >
                <Switch checkedChildren="ON" unCheckedChildren="OFF" />
              </Form.Item>
              <Form.Item
                label="Buzzer Enable"
                name="buzzerEnable"
                valuePropName="checked"
                getValueFromEvent={(checked) => checked ? '1' : '0'}
                getValueProps={(value) => ({ checked: value === '1' })}
              >
                <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
              </Form.Item>
            </>
          )}

          {editingSection === 'zeroExport' && (
            <>
              <Form.Item
                label="Zero Export Function"
                name="zeroExportFunction"
                valuePropName="checked"
                getValueFromEvent={(checked) => checked ? '1' : '0'}
                getValueProps={(value) => ({ checked: value === '1' })}
              >
                <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
              </Form.Item>
              <Form.Item
                label="Zero Export Adjustment Power (W)"
                name="zeroExportAdjustmentPower"
              >
                <InputNumber min={-1000} max={1000} style={{ width: '100%' }} />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default DeviceSettings;
