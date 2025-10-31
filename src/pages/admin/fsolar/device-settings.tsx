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
} from 'antd';
import {
  ReloadOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  EditOutlined,
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
      // Convert values to settings format
      const settingsContent = Object.keys(values).map((key) => ({
        settingId: parseInt(key.replace('setting_', '')),
        value: String(values[key]),
      }));

      await fsolarDeviceService.setDeviceSettings({
        deviceSn: selectedDevice,
        settingsContent,
      });

      message.success('Settings updated successfully');
      setEditModalVisible(false);
      form.resetFields();
      fetchSettings(selectedDevice);
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

  return (
    <div>
      <Title level={2}>Device Settings & Configuration</Title>

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
            onClick={() => selectedDevice && fetchSettings(selectedDevice)}
            loading={loading}
          >
            Refresh
          </Button>
          <Text type="secondary">Device SN: {settings.deviceSn}</Text>
        </Space>
      </Card>

      <Tabs defaultActiveKey="grid">
        {/* Grid Settings */}
        <TabPane
          tab={
            <span>
              <ThunderboltOutlined />
              Grid Settings
            </span>
          }
          key="grid"
        >
          <Card
            title="Grid Configuration"
            extra={
              <Button
                icon={<EditOutlined />}
                onClick={() =>
                  handleEdit('grid', {
                    acOutputRatedVoltage: settings.acOutputRatedVoltage,
                    onGridPowerLimit: settings.onGridPowerLimit,
                    powerFactor: settings.powerFactor,
                  })
                }
              >
                Edit
              </Button>
            }
          >
            <Descriptions bordered column={2}>
              <Descriptions.Item label="AC Output Rated Voltage">
                {settings.acOutputRatedVoltage} V
              </Descriptions.Item>
              <Descriptions.Item label="AC Output Rated Frequency">
                {settings.acOutputRatedFrequency} Hz
              </Descriptions.Item>
              <Descriptions.Item label="Grid Standard Code">
                {settings.gridStandardCode}
              </Descriptions.Item>
              <Descriptions.Item label="On-Grid Power Limit">
                {settings.onGridPowerLimit}%
              </Descriptions.Item>
              <Descriptions.Item label="On-Grid Power Slope">
                {settings.onGridPowerSlope}
              </Descriptions.Item>
              <Descriptions.Item label="Power Factor">
                {settings.powerFactor}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Divider />

          <Card title="Voltage Protection Settings">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Stage 1 Over-Voltage</Text>
                <Descriptions bordered column={1} size="small" style={{ marginTop: 8 }}>
                  <Descriptions.Item label="Trip Value">
                    {settings.overVoltageStage1TripValue} V
                  </Descriptions.Item>
                  <Descriptions.Item label="Trip Time">
                    {settings.overVoltageStage1TripTime} s
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Text strong>Stage 2 Over-Voltage</Text>
                <Descriptions bordered column={1} size="small" style={{ marginTop: 8 }}>
                  <Descriptions.Item label="Trip Value">
                    {settings.overVoltageStage2TripValue} V
                  </Descriptions.Item>
                  <Descriptions.Item label="Trip Time">
                    {settings.overVoltageStage2TripTime} s
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Text strong>Stage 1 Under-Voltage</Text>
                <Descriptions bordered column={1} size="small" style={{ marginTop: 8 }}>
                  <Descriptions.Item label="Trip Value">
                    {settings.underVoltageStage1TripValue} V
                  </Descriptions.Item>
                  <Descriptions.Item label="Trip Time">
                    {settings.underVoltageStage1TripTime} s
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Text strong>Stage 2 Under-Voltage</Text>
                <Descriptions bordered column={1} size="small" style={{ marginTop: 8 }}>
                  <Descriptions.Item label="Trip Value">
                    {settings.underVoltageStage2TripValue} V
                  </Descriptions.Item>
                  <Descriptions.Item label="Trip Time">
                    {settings.underVoltageStage2TripTime} s
                  </Descriptions.Item>
                </Descriptions>
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

          <Card title="Zero Export">
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
          <Card title="Battery Configuration">
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
          <Card title="Operation Mode & Control">
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
      >
        <Alert
          message="Warning"
          description="Changing device settings may affect system operation. Please ensure you understand the implications before making changes."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form form={form} layout="vertical" onFinish={handleSaveSettings}>
          {/* Form fields will be dynamically generated based on section */}
          <Text type="secondary">
            Note: Settings update functionality requires backend support
          </Text>
        </Form>
      </Modal>
    </div>
  );
};

export default DeviceSettings;
