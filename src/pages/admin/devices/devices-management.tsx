import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Button, Table, message, Spin, Select, Tag } from 'antd';
import { SettingOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { sitesService } from '../../../service';
import type { Device, DeviceFilters } from '../../../types/api';

const { Title, Text } = Typography;
const { Option } = Select;

const DevicesManagement: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DeviceFilters>({});

  useEffect(() => {
    fetchDevices();
  }, [filters]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const devicesData = await sitesService.getAllDevices(filters);
      setDevices(devicesData);
    } catch (error: any) {
      console.error('Failed to fetch devices:', error);
      if (error?.response?.status === 404) {
        message.warning('Devices API endpoint not yet implemented on the backend');
      } else {
        message.error('Failed to fetch devices: ' + (error?.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await sitesService.deleteDevice(id);
      message.success('Device deleted successfully');
      fetchDevices();
    } catch (error: any) {
      message.error('Failed to delete device: ' + (error?.message || 'Unknown error'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'default';
      case 'fault': return 'red';
      case 'maintenance': return 'orange';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Type',
      dataIndex: 'deviceType',
      key: 'deviceType',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Model',
      dataIndex: 'deviceModel',
      key: 'deviceModel',
      render: (model: string) => model || 'N/A',
    },
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      render: (serial: string) => serial || 'N/A',
    },
    {
      title: 'Capacity',
      dataIndex: 'capacityKw',
      key: 'capacityKw',
      render: (value: string) => value ? `${value} kW` : 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Station ID',
      dataIndex: 'stationId',
      key: 'stationId',
    },
    {
      title: 'Manufacturer',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      render: (manufacturer: string) => manufacturer || 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Device) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => message.info('Edit functionality coming soon')}
          >
            Edit
          </Button>
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '0' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SettingOutlined style={{ color: '#722ed1' }} />
            Devices Management
          </Title>
          <Text type="secondary">
            Manage and monitor your solar installation devices
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />}>
          Add New Device
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Space>
            <Select
              placeholder="Filter by Device Type"
              style={{ width: 200 }}
              allowClear
              onChange={(value) => setFilters(prev => ({ ...prev, deviceType: value }))}
            >
              <Option value="inverter">Inverter</Option>
              <Option value="meter">Meter</Option>
              <Option value="sensor">Sensor</Option>
              <Option value="battery">Battery</Option>
            </Select>
            
            <Select
              placeholder="Filter by Status"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="fault">Fault</Option>
              <Option value="maintenance">Maintenance</Option>
            </Select>

            <Select
              placeholder="Filter by Station"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => setFilters(prev => ({ ...prev, stationId: value }))}
            >
              <Option value={1}>Station 1</Option>
              <Option value={2}>Station 2</Option>
              <Option value={3}>Station 3</Option>
            </Select>
          </Space>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text>Loading devices...</Text>
            </div>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={devices}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            locale={{
              emptyText: 'No devices found'
            }}
            scroll={{ x: 'max-content' }}
          />
        )}
      </Card>
    </div>
  );
};

export default DevicesManagement;