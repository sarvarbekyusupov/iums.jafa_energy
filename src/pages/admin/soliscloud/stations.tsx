import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Space, Tag, message, Button, Input, Row, Col, Statistic, Typography, Progress, Modal, Form, InputNumber, Select } from 'antd';
import {
  HomeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  ReloadOutlined,
  SearchOutlined,
  ThunderboltOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import solisCloudService from '../../../service/soliscloud.service';
import type { Station } from '../../../types/soliscloud';

const { Title, Text } = Typography;

const SolisCloudStations: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchStations();
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    filterStations();
  }, [searchText, stations]);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await solisCloudService.getStationList({
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
      });

      setStations(response.records || []);
      setFilteredStations(response.records || []);
      setPagination(prev => ({ ...prev, total: response.total || 0 }));
    } catch (error: any) {
      message.error(error?.response?.data?.msg || 'Failed to fetch stations');
    } finally {
      setLoading(false);
    }
  };

  const filterStations = () => {
    if (!searchText) {
      setFilteredStations(stations);
      return;
    }

    const filtered = stations.filter(station =>
      station.stationName?.toLowerCase().includes(searchText.toLowerCase()) ||
      station.stationCode?.toLowerCase().includes(searchText.toLowerCase()) ||
      station.cityStr?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredStations(filtered);
  };

  const handleAddStation = async (values: any) => {
    try {
      setAddLoading(true);
      const result = await solisCloudService.addStation({
        stationName: values.stationName,
        type: values.type,
        capacity: values.capacity,
        address: values.address,
      });
      message.success(`Station added successfully! ID: ${result.id}`);
      setIsAddModalVisible(false);
      form.resetFields();
      fetchStations();
    } catch (error: any) {
      message.error(error?.response?.data?.msg || 'Failed to add station');
    } finally {
      setAddLoading(false);
    }
  };

  const handleTableChange = (newPagination: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total,
    });
  };

  const getStateTag = (state: number) => {
    switch (state) {
      case 1:
        return <Tag icon={<CheckCircleOutlined />} color="success">Normal</Tag>;
      case 2:
        return <Tag icon={<CloseCircleOutlined />} color="error">Offline</Tag>;
      case 3:
        return <Tag icon={<WarningOutlined />} color="warning">Alarm</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const columns = [
    {
      title: 'Station Name',
      dataIndex: 'stationName',
      key: 'stationName',
      width: 150,
      fixed: 'left' as const,
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Station Code',
      dataIndex: 'stationCode',
      key: 'stationCode',
      width: 120,
      render: (text: string) => <Text code>{text || '-'}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      render: (state: number) => getStateTag(state),
      filters: [
        { text: 'Normal', value: 1 },
        { text: 'Offline', value: 2 },
        { text: 'Alarm', value: 3 },
      ],
      onFilter: (value: any, record: Station) => record.state === value,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: number) => {
        const types = ['Residential', 'Commercial', 'Utility', 'Industrial'];
        return types[type - 1] || 'Unknown';
      },
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 100,
      render: (capacity: number) => `${capacity} kWp`,
      sorter: (a: Station, b: Station) => a.capacity - b.capacity,
    },
    {
      title: 'Current Power',
      dataIndex: 'pac',
      key: 'pac',
      width: 130,
      render: (pac: number) => (
        <Space size={4}>
          <ThunderboltOutlined style={{ color: '#faad14' }} />
          <span>{pac ? pac.toFixed(2) : '0.00'} kW</span>
        </Space>
      ),
      sorter: (a: Station, b: Station) => (a.pac || 0) - (b.pac || 0),
    },
    {
      title: "Today's Energy",
      dataIndex: 'eToday',
      key: 'eToday',
      width: 120,
      render: (eToday: number) => `${eToday ? eToday.toFixed(2) : '0.00'} kWh`,
      sorter: (a: Station, b: Station) => (a.eToday || 0) - (b.eToday || 0),
    },
    {
      title: 'Total Energy',
      dataIndex: 'eTotal',
      key: 'eTotal',
      width: 120,
      render: (eTotal: number) => `${eTotal ? eTotal.toFixed(2) : '0.00'} kWh`,
      sorter: (a: Station, b: Station) => (a.eTotal || 0) - (b.eTotal || 0),
    },
    {
      title: 'Location',
      key: 'location',
      width: 150,
      render: (_: any, record: Station) => (
        <Space direction="vertical" size={0}>
          <Text ellipsis style={{ maxWidth: 140 }}>{record.cityStr || '-'}</Text>
          <Text type="secondary" style={{ fontSize: 12, maxWidth: 140 }} ellipsis>{record.countryStr || '-'}</Text>
        </Space>
      ),
    },
  ];

  const normalStations = stations.filter(s => s.state === 1).length;
  const offlineStations = stations.filter(s => s.state === 2).length;
  const alarmStations = stations.filter(s => s.state === 3).length;
  const totalCapacity = stations.reduce((sum, s) => sum + (s.capacity || 0), 0);
  const totalPower = stations.reduce((sum, s) => sum + (s.pac || 0), 0);
  const totalEnergyToday = stations.reduce((sum, s) => sum + (s.eToday || 0), 0);

  return (
    <div>
      {/* Header */}
      <Card
        style={{
          marginBottom: 24,
          
          border: 'none',
        }}
      >
        <Space direction="vertical" size="small">
          <Space>
            <HomeOutlined style={{ fontSize: 32 }} />
            <Title level={2} style={{ margin: 0 }}>
              Solar Stations
            </Title>
          </Space>
          <Text style={{ color: 'rgba(0,0,0,0.65)' }}>
            Monitor and manage your solar power stations
          </Text>
        </Space>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Stations"
              value={stations.length}
              prefix={<HomeOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress
              percent={normalStations > 0 ? Math.round((normalStations / stations.length) * 100) : 0}
              strokeColor="#52c41a"
              showInfo={false}
              size="small"
              style={{ marginTop: 8 }}
            />
            <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
              {normalStations} normal, {offlineStations} offline
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Capacity"
              value={totalCapacity.toFixed(2)}
              suffix="kWp"
              prefix={<ThunderboltOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Current Power"
              value={totalPower.toFixed(2)}
              suffix="kW"
              prefix={<ThunderboltOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Today's Energy"
              value={totalEnergyToday.toFixed(2)}
              suffix="kWh"
              prefix={<ThunderboltOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Actions */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Input
              placeholder="Search by name, code or location"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              allowClear
            />
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsAddModalVisible(true)}
                size="large"
              >
                Add Station
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchStations}
                loading={loading}
                size="large"
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Stations List */}
      <Card
        title={
          <Space>
            <HomeOutlined />
            <span>Station List</span>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          {filteredStations.map((station) => (
            <Col xs={24} sm={24} md={12} lg={8} xl={6} key={station.id}>
              <Card
                hoverable
                onClick={() => navigate(`/admin/soliscloud/stations/${station.id}`)}
                styles={{ body: { padding: 16 } }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text strong style={{ fontSize: 16, display: 'block' }} ellipsis>
                        {station.stationName}
                      </Text>
                      {station.stationCode && (
                        <Text code style={{ fontSize: 12 }}>{station.stationCode}</Text>
                      )}
                    </div>
                    <div>{getStateTag(station.state)}</div>
                  </div>

                  {/* Type and Capacity */}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">
                      {(() => {
                        const types = ['Residential', 'Commercial', 'Utility', 'Industrial'];
                        return types[station.type - 1] || 'Unknown';
                      })()}
                    </Text>
                    <Text strong>{station.capacity} kWp</Text>
                  </div>

                  {/* Power Metrics */}
                  <div style={{ background: '#fafafa', padding: 12, borderRadius: 4 }}>
                    <Row gutter={[8, 8]}>
                      <Col span={24}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Space size={4}>
                            <ThunderboltOutlined style={{ color: '#faad14' }} />
                            <Text type="secondary" style={{ fontSize: 12 }}>Power</Text>
                          </Space>
                          <Text strong>{station.pac ? station.pac.toFixed(2) : '0.00'} kW</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Today</Text>
                          <Text strong style={{ fontSize: 13 }}>{station.eToday ? station.eToday.toFixed(2) : '0.00'} kWh</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Total</Text>
                          <Text strong style={{ fontSize: 13 }}>{station.eTotal ? station.eTotal.toFixed(2) : '0.00'} kWh</Text>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Location */}
                  {(station.cityStr || station.countryStr) && (
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                        📍 {station.cityStr}{station.cityStr && station.countryStr ? ', ' : ''}{station.countryStr}
                      </Text>
                    </div>
                  )}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Pagination */}
        {filteredStations.length > 0 && (
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Space>
              <Text type="secondary">Total {pagination.total} stations</Text>
              <Button
                disabled={pagination.current === 1}
                onClick={() => setPagination({ ...pagination, current: pagination.current - 1 })}
              >
                Previous
              </Button>
              <Button
                disabled={pagination.current * pagination.pageSize >= pagination.total}
                onClick={() => setPagination({ ...pagination, current: pagination.current + 1 })}
              >
                Next
              </Button>
            </Space>
          </div>
        )}

        {filteredStations.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <HomeOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
            <div>
              <Text type="secondary">No stations found</Text>
            </div>
          </div>
        )}
      </Card>

      {/* Add Station Modal */}
      <Modal
        title="Add New Station"
        open={isAddModalVisible}
        onCancel={() => {
          setIsAddModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={addLoading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddStation}
        >
          <Form.Item
            name="stationName"
            label="Station Name"
            rules={[{ required: true, message: 'Please enter station name' }]}
          >
            <Input placeholder="Enter station name" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Station Type"
            rules={[{ required: true, message: 'Please select station type' }]}
          >
            <Select placeholder="Select station type">
              <Select.Option value={1}>Residential</Select.Option>
              <Select.Option value={2}>Commercial</Select.Option>
              <Select.Option value={3}>Industrial</Select.Option>
              <Select.Option value={4}>Utility Scale</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="capacity"
            label="Capacity (kWp)"
            rules={[{ required: true, message: 'Please enter capacity' }]}
          >
            <InputNumber
              placeholder="Enter capacity"
              min={0}
              step={0.1}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
          >
            <Input.TextArea
              placeholder="Enter station address (optional)"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SolisCloudStations;
