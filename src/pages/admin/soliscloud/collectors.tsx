import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Space, Tag, message, Button, Input, Row, Col, Statistic, Typography } from 'antd';
import {
  DatabaseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  SignalFilled,
} from '@ant-design/icons';
import solisCloudService from '../../../service/soliscloud.service';
import type { Collector } from '../../../types/soliscloud';

const { Title, Text } = Typography;

const SolisCloudCollectors: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [filteredCollectors, setFilteredCollectors] = useState<Collector[]>([]);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  useEffect(() => {
    fetchCollectors();
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    filterCollectors();
  }, [searchText, collectors]);

  const fetchCollectors = async () => {
    try {
      setLoading(true);
      const response = await solisCloudService.getCollectorList({
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
      });

      setCollectors(response.records || []);
      setFilteredCollectors(response.records || []);
      setPagination(prev => ({ ...prev, total: response.total || 0 }));
    } catch (error: any) {
      message.error(error?.response?.data?.msg || 'Failed to fetch collectors');
    } finally {
      setLoading(false);
    }
  };

  const filterCollectors = () => {
    if (!searchText) {
      setFilteredCollectors(collectors);
      return;
    }

    const filtered = collectors.filter(collector =>
      collector.sn?.toLowerCase().includes(searchText.toLowerCase()) ||
      collector.stationName?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredCollectors(filtered);
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
        return <Tag icon={<CheckCircleOutlined />} color="success">Online</Tag>;
      case 2:
        return <Tag icon={<CloseCircleOutlined />} color="error">Offline</Tag>;
      case 3:
        return <Tag icon={<CloseCircleOutlined />} color="warning">Fault</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const getSignalIcon = (signalIntensity?: number) => {
    if (!signalIntensity) return null;

    let color = 'red';
    if (signalIntensity > 70) color = 'green';
    else if (signalIntensity > 40) color = 'orange';

    return <SignalFilled style={{ color, fontSize: 16 }} />;
  };

  const columns = [
    {
      title: 'Collector SN',
      dataIndex: 'sn',
      key: 'sn',
      width: 180,
      fixed: 'left' as const,
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Station',
      dataIndex: 'stationName',
      key: 'stationName',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      render: (state: number) => getStateTag(state),
      filters: [
        { text: 'Online', value: 1 },
        { text: 'Offline', value: 2 },
        { text: 'Fault', value: 3 },
      ],
      onFilter: (value: any, record: Collector) => record.state === value,
    },
    {
      title: 'Model',
      dataIndex: 'monitorModel',
      key: 'monitorModel',
      width: 200,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: 'Signal',
      dataIndex: 'rssi',
      key: 'rssi',
      width: 120,
      render: (_: any, record: any) => {
        const rssi = record.rssi;
        const rssiLevel = record.rssiLevel;
        return (
          <Space>
            {getSignalIcon(rssiLevel * 25)}
            <Text>{rssi ? `${rssi} dBm` : '-'}</Text>
          </Space>
        );
      },
      sorter: (a: any, b: any) => (a.rssi || 0) - (b.rssi || 0),
    },
    {
      title: 'Firmware Version',
      dataIndex: 'version',
      key: 'version',
      width: 130,
      render: (text: string) => <Text code>{text || '-'}</Text>,
    },
    {
      title: 'ICCID',
      dataIndex: 'iccid',
      key: 'iccid',
      width: 180,
      render: (text: string) => <Text code>{text || '-'}</Text>,
    },
  ];

  const onlineCollectors = collectors.filter(c => c.state === 1).length;
  const offlineCollectors = collectors.filter(c => c.state === 2).length;
  const faultyCollectors = collectors.filter(c => c.state === 3).length;

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
            <DatabaseOutlined style={{ fontSize: 32 }} />
            <Title level={2} style={{ margin: 0 }}>
              Data Collectors
            </Title>
          </Space>
          <Text style={{ color: 'rgba(0,0,0,0.65)' }}>
            Monitor and manage your SolisCloud data collection devices
          </Text>
        </Space>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Collectors"
              value={collectors.length}
              prefix={<DatabaseOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Online"
              value={onlineCollectors}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Offline"
              value={offlineCollectors}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Fault"
              value={faultyCollectors}
              prefix={<CloseCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Collectors Table */}
      <Card
        title={
          <Space>
            <DatabaseOutlined />
            <span>Collector List</span>
          </Space>
        }
        extra={
          <Space>
            <Input
              placeholder="Search by SN or station"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchCollectors}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredCollectors}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} collectors`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          onRow={(record) => ({
            onClick: () => navigate(`/admin/soliscloud/collectors/${record.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>
    </div>
  );
};

export default SolisCloudCollectors;
