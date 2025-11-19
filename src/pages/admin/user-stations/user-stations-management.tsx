import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Select,
  Input,
  message,
  Space,
  Tag,
  Popconfirm,
  Typography,
  Row,
  Col,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  UserOutlined,
  ThunderboltOutlined,
  CloudServerOutlined,
  SunOutlined,
} from '@ant-design/icons';
import { authService } from '../../../service/auth.service';
import { userStationsService, type AssignStationDto, type UserStationResponse } from '../../../service/user-stations.service';
import { hopeCloudService } from '../../../service/hopecloud.service';
import { solisCloudService } from '../../../service/soliscloud.service';
import fsolarService from '../../../service/fsolar.service';

const { Title, Text } = Typography;
const { Option } = Select;

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const UserStationsManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userStations, setUserStations] = useState<UserStationResponse[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [availableStations, setAvailableStations] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserStations(selectedUser);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await authService.getAllUsers();
      // Filter to show only regular users
      const regularUsers = data.filter(u => u.role === 'user' || u.role === 'operator');
      setUsers(regularUsers);
    } catch (error: any) {
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStations = async (userId: number) => {
    try {
      setLoading(true);
      const data = await userStationsService.getUserStations(userId);
      setUserStations(data);
    } catch (error: any) {
      message.error('Failed to load user stations');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableStations = async (provider: string) => {
    try {
      setLoading(true);
      let stations: any[] = [];

      if (provider === 'hopecloud') {
        const response = await hopeCloudService.getStations();
        stations = (response.data?.records || []).map((s: any) => ({
          id: s.plantId,
          name: s.plantName,
          provider: 'hopecloud',
        }));
      } else if (provider === 'soliscloud') {
        const response = await solisCloudService.getStationDetailList({ pageNo: 1, pageSize: 100 });
        stations = (response.records || []).map((s: any) => ({
          id: s.id,
          name: s.stationName,
          provider: 'soliscloud',
        }));
      } else if (provider === 'fsolar') {
        const response = await fsolarService.getDbDevices({ page: 1, limit: 100 });
        stations = (response.data?.data || []).map((d: any) => ({
          id: d.id || d.deviceId,
          name: d.name || d.deviceName,
          provider: 'fsolar',
        }));
      }

      setAvailableStations(stations);
    } catch (error: any) {
      message.error(`Failed to load ${provider} stations`);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    form.setFieldsValue({ stationId: undefined });
    fetchAvailableStations(provider);
  };

  const handleAssignStation = async (values: any) => {
    if (!selectedUser) {
      message.error('Please select a user first');
      return;
    }

    try {
      setLoading(true);
      const station = availableStations.find(s => s.id === values.stationId);

      const assignData: AssignStationDto = {
        userId: selectedUser,
        stationId: values.stationId,
        provider: values.provider,
        stationName: station?.name || values.stationId,
        isOwner: values.isOwner || true,
      };

      await userStationsService.assignStation(assignData);
      message.success('Station assigned successfully');
      setModalVisible(false);
      form.resetFields();
      fetchUserStations(selectedUser);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to assign station');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStation = async (userId: number, provider: string, stationId: string) => {
    try {
      setLoading(true);
      console.log('Removing station:', { userId, provider, stationId });
      await userStationsService.removeStation(userId, provider, String(stationId));
      message.success('Station removed successfully');
      fetchUserStations(userId);
    } catch (error: any) {
      console.error('Remove station error:', error.response?.data);
      message.error(error.response?.data?.message || 'Failed to remove station');
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider?.toLowerCase()) {
      case 'hopecloud': return <CloudServerOutlined style={{ color: '#1890ff' }} />;
      case 'soliscloud': return <SunOutlined style={{ color: '#52c41a' }} />;
      case 'fsolar': return <ThunderboltOutlined style={{ color: '#fa8c16' }} />;
      default: return <CloudServerOutlined />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider?.toLowerCase()) {
      case 'hopecloud': return 'blue';
      case 'soliscloud': return 'green';
      case 'fsolar': return 'orange';
      default: return 'default';
    }
  };

  const stationColumns = [
    {
      title: 'Provider',
      dataIndex: 'provider',
      key: 'provider',
      render: (provider: string) => (
        <Space>
          {getProviderIcon(provider)}
          <Tag color={getProviderColor(provider)}>{provider.toUpperCase()}</Tag>
        </Space>
      ),
    },
    {
      title: 'Station Name',
      dataIndex: 'station_name',
      key: 'station_name',
    },
    {
      title: 'Station ID',
      dataIndex: 'station_id',
      key: 'station_id',
      render: (text: string) => <Text code>{text}</Text>,
    },
    {
      title: 'Owner',
      dataIndex: 'is_owner',
      key: 'is_owner',
      render: (isOwner: boolean) => (
        <Tag color={isOwner ? 'green' : 'default'}>
          {isOwner ? 'Owner' : 'Viewer'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Assigned At',
      dataIndex: 'assigned_at',
      key: 'assigned_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: UserStationResponse) => (
        <Popconfirm
          title="Remove this station assignment?"
          description="The user will lose access to this station."
          onConfirm={() => handleRemoveStation(record.user_id, record.provider, record.station_id)}
          okText="Yes, Remove"
          cancelText="Cancel"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>User Station Management</Title>
      <Text type="secondary">
        Assign and manage solar stations/inverters for users
      </Text>

      <Divider />

      <Row gutter={24}>
        <Col span={8}>
          <Card title={<Space><UserOutlined /> Users</Space>} style={{ height: '100%' }}>
            <Select
              style={{ width: '100%' }}
              placeholder="Select a user"
              onChange={(value) => setSelectedUser(value)}
              value={selectedUser}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={users.map(u => ({
                value: u.id,
                label: `${u.firstName} ${u.lastName} (${u.email})`,
              }))}
            />

            {selectedUser && (
              <div style={{ marginTop: '16px' }}>
                <Text strong>Selected User:</Text>
                <br />
                <Text>{users.find(u => u.id === selectedUser)?.email}</Text>
                <br />
                <Text type="secondary">
                  {userStations.length} station(s) assigned
                </Text>
              </div>
            )}
          </Card>
        </Col>

        <Col span={16}>
          <Card
            title={<Space><ThunderboltOutlined /> Assigned Stations</Space>}
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
                disabled={!selectedUser}
              >
                Assign Station
              </Button>
            }
          >
            <Table
              columns={stationColumns}
              dataSource={userStations}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: 'No stations assigned yet' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Assign Station Modal */}
      <Modal
        title="Assign Station to User"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAssignStation}
        >
          <Form.Item
            name="provider"
            label="Provider"
            rules={[{ required: true, message: 'Please select a provider' }]}
          >
            <Select placeholder="Select provider" onChange={handleProviderChange}>
              <Option value="hopecloud">
                <Space>
                  <CloudServerOutlined style={{ color: '#1890ff' }} />
                  HopeCloud
                </Space>
              </Option>
              <Option value="soliscloud">
                <Space>
                  <SunOutlined style={{ color: '#52c41a' }} />
                  SolisCloud
                </Space>
              </Option>
              <Option value="fsolar">
                <Space>
                  <ThunderboltOutlined style={{ color: '#fa8c16' }} />
                  FSolar
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="stationId"
            label="Station"
            rules={[{ required: true, message: 'Please select a station' }]}
          >
            <Select
              placeholder="Select a station"
              loading={loading}
              disabled={!selectedProvider}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={availableStations.map(s => ({
                value: s.id,
                label: `${s.name} (${s.id})`,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="isOwner"
            label="Access Level"
            initialValue={true}
          >
            <Select>
              <Option value={true}>Owner (Full Access)</Option>
              <Option value={false}>Viewer (Read Only)</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserStationsManagement;
