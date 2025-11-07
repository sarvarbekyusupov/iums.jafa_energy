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
  Badge,
  Tooltip,
  Divider,
} from 'antd';
import {
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { fsolarDeviceService } from '../../../service/fsolar';
import type { Device } from '../../../types/fsolar';

const { Title, Text } = Typography;

const DevicesManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
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

  // Filter devices based on search and status
  useEffect(() => {
    let filtered = [...devices];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(
        (device) =>
          device.deviceSn?.toLowerCase().includes(searchText.toLowerCase()) ||
          device.deviceName?.toLowerCase().includes(searchText.toLowerCase()) ||
          device.deviceType?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((device) => device.status === statusFilter);
    }

    setFilteredDevices(filtered);
  }, [devices, searchText, statusFilter]);

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

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { status: any; text: string; icon: React.ReactNode }> = {
      'ON': { status: 'success', text: 'Online', icon: <CheckCircleOutlined /> },
      'OF': { status: 'default', text: 'Offline', icon: <CloseCircleOutlined /> },
      'AL': { status: 'error', text: 'Alarm', icon: <WarningOutlined /> },
    };
    const config = statusMap[status] || { status: 'processing', text: status, icon: null };
    return (
      <Space>
        {config.icon}
        <Badge status={config.status} text={config.text} />
      </Space>
    );
  };

  // Table columns
  const columns: ColumnsType<Device> = [
    {
      title: 'Device Info',
      key: 'deviceInfo',
      fixed: 'left',
      width: 280,
      render: (_, record) => (
        <div>
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <Space>
              <ThunderboltOutlined style={{ color: '#1890ff' }} />
              <Text strong copyable>{record.deviceSn}</Text>
            </Space>
            {record.deviceName && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.deviceName}
              </Text>
            )}
            {record.deviceType && (
              <Tag color="blue" style={{ fontSize: 11 }}>
                {record.deviceType === 'INV' ? 'Inverter' : record.deviceType}
              </Tag>
            )}
          </Space>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Online', value: 'ON' },
        { text: 'Offline', value: 'OF' },
        { text: 'Alarm', value: 'AL' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => getStatusBadge(status),
    },
    {
      title: (
        <Tooltip title="Master Control Version">
          <Space>
            <DatabaseOutlined />
            Master
          </Space>
        </Tooltip>
      ),
      dataIndex: 'masterVersion',
      key: 'masterVersion',
      width: 120,
      render: (version: string) => version ? <Tag color="cyan">v{version}</Tag> : <Text type="secondary">-</Text>,
    },
    {
      title: (
        <Tooltip title="Slave Control Version">
          <Space>
            <CloudServerOutlined />
            Slave
          </Space>
        </Tooltip>
      ),
      dataIndex: 'slaveVersion',
      key: 'slaveVersion',
      width: 120,
      render: (version: string) => version ? <Tag color="cyan">v{version}</Tag> : <Text type="secondary">-</Text>,
    },
    {
      title: 'Comm',
      dataIndex: 'commVersion',
      key: 'commVersion',
      width: 100,
      render: (version: string) => version ? <Tag color="geekblue">v{version}</Tag> : <Text type="secondary">-</Text>,
    },
    {
      title: 'Hardware',
      dataIndex: 'hardwareVersion',
      key: 'hardwareVersion',
      width: 120,
      render: (version: string) => version ? <Tag color="purple">v{version}</Tag> : <Text type="secondary">-</Text>,
    },
    {
      title: 'BP Versions',
      key: 'bpVersions',
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          {record.bpMasterVersion && (
            <Tooltip title="BP Master">
              <Tag color="orange" style={{ fontSize: 11 }}>M: v{record.bpMasterVersion}</Tag>
            </Tooltip>
          )}
          {record.bpIpaVersion && (
            <Tooltip title="BP IPA">
              <Tag color="orange" style={{ fontSize: 11 }}>I: v{record.bpIpaVersion}</Tag>
            </Tooltip>
          )}
          {record.bpSubVersion && (
            <Tooltip title="BP Sub">
              <Tag color="orange" style={{ fontSize: 11 }}>S: v{record.bpSubVersion}</Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Device"
            description="Are you sure you want to delete this device?"
            onConfirm={() => handleDeleteDevice(record.deviceSn)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Calculate statistics
  const onlineCount = devices.filter(d => d.status === 'ON').length;
  const offlineCount = devices.filter(d => d.status === 'OF').length;
  const alarmCount = devices.filter(d => d.status === 'AL').length;
  const onlinePercentage = pagination.total > 0 ? ((onlineCount / pagination.total) * 100).toFixed(1) : '0';

  return (
    <div>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <ThunderboltOutlined /> Fsolar Devices Management
          </Title>
        </Col>
      </Row>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Total Devices</span>}
              value={pagination.total}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#fff', fontSize: 32 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)' }}>
            <Statistic
              title={
                <Space style={{ color: 'rgba(255,255,255,0.85)' }}>
                  <CheckCircleOutlined />
                  <span>Online</span>
                </Space>
              }
              value={onlineCount}
              suffix={<span style={{ fontSize: 16 }}>/ {pagination.total}</span>}
              valueStyle={{ color: '#fff', fontSize: 32 }}
            />
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4 }}>
              {onlinePercentage}% availability
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)' }}>
            <Statistic
              title={
                <Space style={{ color: 'rgba(255,255,255,0.85)' }}>
                  <CloseCircleOutlined />
                  <span>Offline</span>
                </Space>
              }
              value={offlineCount}
              valueStyle={{ color: '#fff', fontSize: 32 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)' }}>
            <Statistic
              title={
                <Space style={{ color: 'rgba(255,255,255,0.85)' }}>
                  <WarningOutlined />
                  <span>Alarms</span>
                </Space>
              }
              value={alarmCount}
              valueStyle={{ color: '#fff', fontSize: 32 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filter Bar */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Input.Search
              placeholder="Search by device SN, name, or type..."
              allowClear
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
              prefix={<DatabaseOutlined style={{ color: '#bfbfbf' }} />}
            />
          </Col>
          <Col>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              size="large"
              style={{ width: 160 }}
              options={[
                { value: 'all', label: '📋 All Status' },
                { value: 'ON', label: '✅ Online' },
                { value: 'OF', label: '⭕ Offline' },
                { value: 'AL', label: '⚠️ Alarm' },
              ]}
            />
          </Col>
        </Row>
        {(searchText || statusFilter !== 'all') && (
          <div style={{ marginTop: 12, color: '#8c8c8c', fontSize: 12 }}>
            Showing {filteredDevices.length} of {devices.length} devices
          </div>
        )}
      </Card>

      {/* Main Table Card */}
      <Card
        title={
          <Space>
            <DatabaseOutlined style={{ color: '#1890ff' }} />
            <span style={{ fontSize: 16, fontWeight: 600 }}>Devices Registry</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchDevices(pagination.current, pagination.pageSize)}
              loading={loading}
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
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
      >
        <Table
          columns={columns}
          dataSource={filteredDevices}
          rowKey="deviceSn"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => {
              fetchDevices(page, pageSize);
            },
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} devices`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          scroll={{ x: 1400 }}
          size="middle"
          rowClassName={(record) =>
            record.status === 'AL' ? 'alarm-row' :
            record.status === 'OF' ? 'offline-row' :
            'online-row'
          }
        />
      </Card>

      <style>{`
        .alarm-row {
          background-color: #fff1f0 !important;
        }
        .alarm-row:hover td {
          background-color: #ffccc7 !important;
        }
        .offline-row {
          background-color: #fafafa !important;
        }
        .offline-row:hover td {
          background-color: #f0f0f0 !important;
        }
        .online-row:hover td {
          background-color: #f6ffed !important;
        }
      `}</style>

      {/* Add Device Modal */}
      <Modal
        title={
          <Space>
            <PlusOutlined style={{ color: '#52c41a' }} />
            <span>Add New Device</span>
          </Space>
        }
        open={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
        okText="Add Device"
        okButtonProps={{ icon: <PlusOutlined /> }}
        width={600}
      >
        <Divider style={{ margin: '12px 0 24px 0' }} />
        <Form form={form} layout="vertical" onFinish={handleAddDevice}>
          <Form.Item
            name="deviceSn"
            label={
              <Space>
                <ThunderboltOutlined />
                <span>Device Serial Number</span>
              </Space>
            }
            rules={[
              { required: true, message: 'Please input device SN' },
              { min: 10, message: 'SN must be at least 10 characters' },
            ]}
            tooltip="Unique identifier for the device"
          >
            <Input
              placeholder="e.g., 100202000124410097"
              size="large"
              prefix={<DatabaseOutlined style={{ color: '#bfbfbf' }} />}
            />
          </Form.Item>
          <Form.Item
            name="deviceType"
            label={
              <Space>
                <SettingOutlined />
                <span>Device Type</span>
              </Space>
            }
            rules={[{ required: true, message: 'Please select device type' }]}
          >
            <Select
              placeholder="Select device type"
              size="large"
              options={[
                { value: 'INV', label: '⚡ Inverter' },
                { value: 'Battery', label: '🔋 Battery' },
                { value: 'Meter', label: '📊 Meter' },
                { value: 'Sensor', label: '📡 Sensor' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="deviceName"
            label={
              <Space>
                <InfoCircleOutlined />
                <span>Device Name</span>
              </Space>
            }
            rules={[
              { required: true, message: 'Please input device name' },
              { max: 50, message: 'Name cannot exceed 50 characters' },
            ]}
            tooltip="Friendly name for easy identification"
          >
            <Input
              placeholder="e.g., Solar Inverter - Building A"
              size="large"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Device Details Modal */}
      <Modal
        title={
          <Space>
            <ThunderboltOutlined style={{ color: '#1890ff' }} />
            <span>Device Details & Specifications</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedDevice(null);
        }}
        footer={[
          <Button key="close" type="primary" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={900}
      >
        {selectedDevice && (
          <div>
            {/* Status Banner */}
            {selectedDevice.status && (
              <Card
                size="small"
                style={{
                  marginBottom: 16,
                  background: selectedDevice.status === 'ON' ? 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)' :
                              selectedDevice.status === 'AL' ? 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)' :
                              'linear-gradient(135deg, #8c8c8c 0%, #bfbfbf 100%)',
                  border: 'none',
                }}
              >
                <Row justify="space-between" align="middle">
                  <Col>
                    <Space size="large">
                      <div>
                        <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>Device Status</div>
                        <div style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>
                          {selectedDevice.status === 'ON' ? '● ONLINE' :
                           selectedDevice.status === 'AL' ? '⚠ ALARM' :
                           selectedDevice.status === 'OF' ? '○ OFFLINE' :
                           selectedDevice.status}
                        </div>
                      </div>
                      {selectedDevice.ratedPower && (
                        <Divider type="vertical" style={{ borderColor: 'rgba(255,255,255,0.3)', height: 40 }} />
                      )}
                      {selectedDevice.ratedPower && (
                        <div>
                          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>Rated Power</div>
                          <div style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
                            {selectedDevice.ratedPower} kW
                          </div>
                        </div>
                      )}
                    </Space>
                  </Col>
                </Row>
              </Card>
            )}

            {/* Device Identification */}
            <Card
              title={
                <Space>
                  <InfoCircleOutlined />
                  <span>Device Identification</span>
                </Space>
              }
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[24, 16]}>
                <Col span={24}>
                  <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 6 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Serial Number</Text>
                    <div style={{ marginTop: 4 }}>
                      <Text strong copyable style={{ fontSize: 16 }}>{selectedDevice.deviceSn}</Text>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Device Type</Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                      {selectedDevice.deviceType === 'INV' ? 'Inverter' : selectedDevice.deviceType}
                    </Tag>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Device Model</Text>
                  <div style={{ marginTop: 4 }}>
                    <Text strong style={{ fontSize: 14 }}>{selectedDevice.deviceModel || 'N/A'}</Text>
                  </div>
                </Col>
                {selectedDevice.deviceName && (
                  <Col span={24}>
                    <Text type="secondary">Device Name</Text>
                    <div style={{ marginTop: 4 }}>
                      <Text style={{ fontSize: 14 }}>{selectedDevice.deviceName}</Text>
                    </div>
                  </Col>
                )}
              </Row>
            </Card>

            {/* Collector/Gateway */}
            {selectedDevice.collectorSn && (
              <Card
                title={
                  <Space>
                    <CloudServerOutlined />
                    <span>Collector/Gateway</span>
                  </Space>
                }
                size="small"
                style={{ marginBottom: 16 }}
              >
                <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 6 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Collector Serial Number</Text>
                  <div style={{ marginTop: 4 }}>
                    <Text copyable style={{ fontSize: 14 }}>{selectedDevice.collectorSn}</Text>
                  </div>
                </div>
              </Card>
            )}

            {/* Firmware Versions */}
            <Card
              title={
                <Space>
                  <SettingOutlined />
                  <span>Firmware & Software Versions</span>
                </Space>
              }
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[16, 12]}>
                {selectedDevice.moduleVersion && (
                  <Col xs={24} sm={12} md={8}>
                    <div style={{ padding: '8px 12px', background: '#f0f5ff', borderRadius: 6, border: '1px solid #d6e4ff' }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>Collector</Text>
                      <div style={{ marginTop: 4 }}>
                        <Tag color="purple" style={{ fontSize: 13 }}>v{selectedDevice.moduleVersion}</Tag>
                      </div>
                    </div>
                  </Col>
                )}
                {selectedDevice.controlVersion && (
                  <Col xs={24} sm={12} md={8}>
                    <div style={{ padding: '8px 12px', background: '#e6fffb', borderRadius: 6, border: '1px solid #87e8de' }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>Master Control</Text>
                      <div style={{ marginTop: 4 }}>
                        <Tag color="cyan" style={{ fontSize: 13 }}>v{selectedDevice.controlVersion}</Tag>
                      </div>
                    </div>
                  </Col>
                )}
                {selectedDevice.controlVersion2 && (
                  <Col xs={24} sm={12} md={8}>
                    <div style={{ padding: '8px 12px', background: '#e6fffb', borderRadius: 6, border: '1px solid #87e8de' }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>Slave Control</Text>
                      <div style={{ marginTop: 4 }}>
                        <Tag color="cyan" style={{ fontSize: 13 }}>v{selectedDevice.controlVersion2}</Tag>
                      </div>
                    </div>
                  </Col>
                )}
                {selectedDevice.iapVersion && (
                  <Col xs={24} sm={12} md={8}>
                    <div style={{ padding: '8px 12px', background: '#f0f5ff', borderRadius: 6, border: '1px solid #adc6ff' }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>IAP</Text>
                      <div style={{ marginTop: 4 }}>
                        <Tag color="geekblue" style={{ fontSize: 13 }}>v{selectedDevice.iapVersion}</Tag>
                      </div>
                    </div>
                  </Col>
                )}
                {selectedDevice.displayVersion && (
                  <Col xs={24} sm={12} md={8}>
                    <div style={{ padding: '8px 12px', background: '#fafafa', borderRadius: 6, border: '1px solid #d9d9d9' }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>Display</Text>
                      <div style={{ marginTop: 4 }}>
                        <Tag style={{ fontSize: 13 }}>v{selectedDevice.displayVersion}</Tag>
                      </div>
                    </div>
                  </Col>
                )}
                {selectedDevice.firmwareVersion && (
                  <Col xs={24} sm={12} md={8}>
                    <div style={{ padding: '8px 12px', background: '#fafafa', borderRadius: 6, border: '1px solid #d9d9d9' }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>Firmware</Text>
                      <div style={{ marginTop: 4 }}>
                        <Tag style={{ fontSize: 13 }}>v{selectedDevice.firmwareVersion}</Tag>
                      </div>
                    </div>
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
