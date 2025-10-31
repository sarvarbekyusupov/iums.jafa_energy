import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  message,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Typography,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  SettingOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { fsolarDeviceService } from '../../../service/fsolar';
import type { Device } from '../../../types/fsolar';

const { Title, Text } = Typography;

const DevicesManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [form] = Form.useForm();

  // Fetch devices
  const fetchDevices = async (page: number = 1, pageSize: number = 20) => {
    try {
      setLoading(true);
      const result = await fsolarDeviceService.getDeviceList({
        pageNum: page,
        pageSize,
      });
      setDevices(result.dataList);
      setPagination({
        current: parseInt(result.currentPage),
        pageSize: parseInt(result.pageSize),
        total: parseInt(result.total),
      });
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // Handle add device
  const handleAddDevice = async (values: any) => {
    try {
      setLoading(true);
      await fsolarDeviceService.addDevices({
        deviceSaveInfoList: [
          {
            deviceSn: values.deviceSn,
            deviceType: values.deviceType,
            deviceName: values.deviceName,
          },
        ],
      });
      message.success('Device added successfully');
      setAddModalVisible(false);
      form.resetFields();
      fetchDevices(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to add device');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete device
  const handleDeleteDevice = async (deviceSn: string) => {
    try {
      setLoading(true);
      await fsolarDeviceService.deleteDevices([deviceSn]);
      message.success('Device deleted successfully');
      fetchDevices(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to delete device');
    } finally {
      setLoading(false);
    }
  };

  // Handle view details
  const handleViewDetails = async (device: Device) => {
    try {
      setLoading(true);
      const details = await fsolarDeviceService.getDeviceBasicInfo(device.deviceSn);
      setSelectedDevice(details);
      setDetailModalVisible(true);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to fetch device details');
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns: ColumnsType<Device> = [
    {
      title: 'Device SN',
      dataIndex: 'deviceSn',
      key: 'deviceSn',
      fixed: 'left',
      width: 200,
      render: (deviceSn: string) => <Text copyable>{deviceSn}</Text>,
    },
    {
      title: 'Master Version',
      dataIndex: 'masterVersion',
      key: 'masterVersion',
      width: 150,
      render: (version: string) => version ? <Tag color="cyan">v{version}</Tag> : <Text type="secondary">N/A</Text>,
    },
    {
      title: 'Slave Version',
      dataIndex: 'slaveVersion',
      key: 'slaveVersion',
      width: 150,
      render: (version: string) => version ? <Tag color="cyan">v{version}</Tag> : <Text type="secondary">N/A</Text>,
    },
    {
      title: 'Comm Version',
      dataIndex: 'commVersion',
      key: 'commVersion',
      width: 150,
      render: (version: string) => version ? <Tag color="geekblue">v{version}</Tag> : <Text type="secondary">N/A</Text>,
    },
    {
      title: 'Hardware Version',
      dataIndex: 'hardwareVersion',
      key: 'hardwareVersion',
      width: 150,
      render: (version: string) => version ? <Tag color="purple">v{version}</Tag> : <Text type="secondary">N/A</Text>,
    },
    {
      title: 'BP Master Version',
      dataIndex: 'bpMasterVersion',
      key: 'bpMasterVersion',
      width: 150,
      render: (version: string) => version ? <Tag color="orange">v{version}</Tag> : <Text type="secondary">N/A</Text>,
    },
    {
      title: 'BP IPA Version',
      dataIndex: 'bpIpaVersion',
      key: 'bpIpaVersion',
      width: 150,
      render: (version: string) => version ? <Tag color="orange">v{version}</Tag> : <Text type="secondary">N/A</Text>,
    },
    {
      title: 'BP Sub Version',
      dataIndex: 'bpSubVersion',
      key: 'bpSubVersion',
      width: 150,
      render: (version: string) => version ? <Tag color="orange">v{version}</Tag> : <Text type="secondary">N/A</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Details
          </Button>
          <Popconfirm
            title="Delete Device"
            description="Are you sure you want to delete this device?"
            onConfirm={() => handleDeleteDevice(record.deviceSn)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Fsolar Devices Management</Title>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Devices"
              value={pagination.total}
              prefix={<SettingOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Online"
              value={devices.filter(d => d.status === 'online').length}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Offline"
              value={devices.filter(d => d.status === 'offline').length}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card
        title="Devices List"
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchDevices(pagination.current, pagination.pageSize)}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAddModalVisible(true)}
            >
              Add Device
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={devices}
          rowKey="deviceSn"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => {
              fetchDevices(page, pageSize);
            },
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} devices`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Add Device Modal */}
      <Modal
        title="Add New Device"
        open={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleAddDevice}>
          <Form.Item
            name="deviceSn"
            label="Device Serial Number"
            rules={[{ required: true, message: 'Please input device SN' }]}
          >
            <Input placeholder="Enter device SN" />
          </Form.Item>
          <Form.Item
            name="deviceType"
            label="Device Type"
            rules={[{ required: true, message: 'Please select device type' }]}
          >
            <Select placeholder="Select device type">
              <Select.Option value="Inverter">Inverter</Select.Option>
              <Select.Option value="Battery">Battery</Select.Option>
              <Select.Option value="Meter">Meter</Select.Option>
              <Select.Option value="Sensor">Sensor</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="deviceName"
            label="Device Name"
            rules={[{ required: true, message: 'Please input device name' }]}
          >
            <Input placeholder="Enter device name" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Device Details Modal */}
      <Modal
        title={<><InfoCircleOutlined /> Device Details & Specifications</>}
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedDevice(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedDevice && (
          <div>
            {/* Device Identification */}
            <Card title="Device Identification" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text type="secondary">Device Serial Number:</Text>
                  <div><Text strong copyable>{selectedDevice.deviceSn}</Text></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Device Type:</Text>
                  <div>
                    <Tag color="blue">
                      {selectedDevice.deviceType === 'INV' ? 'Inverter' : selectedDevice.deviceType}
                    </Tag>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Device Model:</Text>
                  <div><Text strong>{selectedDevice.deviceModel || 'N/A'}</Text></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Status:</Text>
                  <div>
                    <Tag color={
                      selectedDevice.status === 'AL' ? 'red' :
                      selectedDevice.status === 'ON' ? 'green' :
                      selectedDevice.status === 'OF' ? 'default' : 'blue'
                    }>
                      {selectedDevice.status === 'AL' ? 'ALARM' :
                       selectedDevice.status === 'ON' ? 'ONLINE' :
                       selectedDevice.status === 'OF' ? 'OFFLINE' :
                       selectedDevice.status?.toUpperCase()}
                    </Tag>
                  </div>
                </Col>
                {selectedDevice.deviceName && (
                  <Col span={12}>
                    <Text type="secondary">Device Name:</Text>
                    <div>{selectedDevice.deviceName}</div>
                  </Col>
                )}
                {selectedDevice.ratedPower && (
                  <Col span={12}>
                    <Text type="secondary">Rated Power:</Text>
                    <div>{selectedDevice.ratedPower} kW</div>
                  </Col>
                )}
              </Row>
            </Card>

            {/* Collector/Gateway */}
            {selectedDevice.collectorSn && (
              <Card title="Collector/Gateway" size="small" style={{ marginBottom: 16 }}>
                <Row gutter={[16, 8]}>
                  <Col span={24}>
                    <Text type="secondary">Collector Serial Number:</Text>
                    <div><Text copyable>{selectedDevice.collectorSn}</Text></div>
                  </Col>
                </Row>
              </Card>
            )}

            {/* Firmware Versions */}
            <Card title="Firmware & Software Versions" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 8]}>
                {selectedDevice.moduleVersion && (
                  <Col span={12}>
                    <Text type="secondary">Collector Version:</Text>
                    <div><Tag color="purple">v{selectedDevice.moduleVersion}</Tag></div>
                  </Col>
                )}
                {selectedDevice.controlVersion && (
                  <Col span={12}>
                    <Text type="secondary">Master Control Version:</Text>
                    <div><Tag color="cyan">v{selectedDevice.controlVersion}</Tag></div>
                  </Col>
                )}
                {selectedDevice.controlVersion2 && (
                  <Col span={12}>
                    <Text type="secondary">Slave Control Version:</Text>
                    <div><Tag color="cyan">v{selectedDevice.controlVersion2}</Tag></div>
                  </Col>
                )}
                {selectedDevice.iapVersion && (
                  <Col span={12}>
                    <Text type="secondary">IAP Version:</Text>
                    <div><Tag color="geekblue">v{selectedDevice.iapVersion}</Tag></div>
                  </Col>
                )}
                {selectedDevice.displayVersion && (
                  <Col span={12}>
                    <Text type="secondary">Display Version:</Text>
                    <div><Tag>v{selectedDevice.displayVersion}</Tag></div>
                  </Col>
                )}
                {selectedDevice.firmwareVersion && (
                  <Col span={12}>
                    <Text type="secondary">Firmware Version:</Text>
                    <div><Tag>v{selectedDevice.firmwareVersion}</Tag></div>
                  </Col>
                )}
              </Row>
            </Card>

            {/* Additional Info */}
            {(selectedDevice.type || selectedDevice.subType || selectedDevice.manufacturer || selectedDevice.installDate) && (
              <Card title="Additional Information" size="small">
                <Row gutter={[16, 8]}>
                  {selectedDevice.type && (
                    <Col span={12}>
                      <Text type="secondary">Type Code:</Text>
                      <div>{selectedDevice.type}</div>
                    </Col>
                  )}
                  {selectedDevice.subType && (
                    <Col span={12}>
                      <Text type="secondary">SubType Code:</Text>
                      <div>{selectedDevice.subType}</div>
                    </Col>
                  )}
                  {selectedDevice.manufacturer && (
                    <Col span={12}>
                      <Text type="secondary">Manufacturer:</Text>
                      <div>{selectedDevice.manufacturer}</div>
                    </Col>
                  )}
                  {selectedDevice.installDate && (
                    <Col span={12}>
                      <Text type="secondary">Install Date:</Text>
                      <div>{selectedDevice.installDate}</div>
                    </Col>
                  )}
                </Row>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DevicesManagement;
