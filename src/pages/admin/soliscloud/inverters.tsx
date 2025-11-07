import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Space, Tag, message, Button, Input, Row, Col, Statistic, Typography, Progress, Modal, Descriptions } from 'antd';
import {
  ThunderboltOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  ReloadOutlined,
  SearchOutlined,
  ThunderboltFilled,
  SafetyOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import solisCloudService from '../../../service/soliscloud.service';
import type { Inverter } from '../../../types/soliscloud';

const { Title, Text } = Typography;

const SolisCloudInverters: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [inverters, setInverters] = useState<Inverter[]>([]);
  const [filteredInverters, setFilteredInverters] = useState<Inverter[]>([]);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [warrantyData, setWarrantyData] = useState<Map<string, any>>(new Map());
  const [warrantyLoading, setWarrantyLoading] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<any>(null);
  const [isWarrantyModalVisible, setIsWarrantyModalVisible] = useState(false);

  useEffect(() => {
    fetchInverters();
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    filterInverters();
  }, [searchText, inverters]);

  const fetchInverters = async () => {
    try {
      setLoading(true);
      const response = await solisCloudService.getInverterList({
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
      });

      setInverters(response.page?.records || []);
      setFilteredInverters(response.page?.records || []);
      setPagination(prev => ({ ...prev, total: response.page?.total || 0 }));

      // Fetch warranty data for all inverters
      fetchWarrantyData();
    } catch (error: any) {
      message.error(error?.response?.data?.msg || 'Failed to fetch inverters');
    } finally {
      setLoading(false);
    }
  };

  const fetchWarrantyData = async () => {
    try {
      setWarrantyLoading(true);
      const response = await solisCloudService.getInverterWarranty({
        pageNo: 1,
        pageSize: 100,
      });

      const warrantyMap = new Map();
      response.records?.forEach((warranty: any) => {
        warrantyMap.set(warranty.sn, warranty);
      });
      setWarrantyData(warrantyMap);
    } catch (error: any) {
      console.error('Failed to fetch warranty data:', error);
    } finally {
      setWarrantyLoading(false);
    }
  };

  const showWarrantyDetails = (sn: string) => {
    const warranty = warrantyData.get(sn);
    if (warranty) {
      setSelectedWarranty(warranty);
      setIsWarrantyModalVisible(true);
    } else {
      message.info('No warranty information available for this inverter');
    }
  };

  const filterInverters = () => {
    if (!searchText) {
      setFilteredInverters(inverters);
      return;
    }

    const filtered = inverters.filter(inverter =>
      inverter.sn?.toLowerCase().includes(searchText.toLowerCase()) ||
      inverter.stationName?.toLowerCase().includes(searchText.toLowerCase()) ||
      inverter.model?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredInverters(filtered);
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
        return <Tag icon={<WarningOutlined />} color="warning">Alarm</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const columns = [
    {
      title: 'Serial Number',
      dataIndex: 'sn',
      key: 'sn',
      width: 180,
      render: (text: string) => <Text code strong>{text}</Text>,
    },
    {
      title: 'Station',
      dataIndex: 'stationName',
      key: 'stationName',
      width: 180,
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      title: 'Status',
      dataIndex: 'state',
      key: 'state',
      width: 120,
      render: (state: number) => getStateTag(state),
      filters: [
        { text: 'Online', value: 1 },
        { text: 'Offline', value: 2 },
        { text: 'Alarm', value: 3 },
      ],
      onFilter: (value: any, record: Inverter) => record.state === value,
    },
    {
      title: 'Power',
      dataIndex: 'power',
      key: 'power',
      width: 100,
      render: (power: number) => `${power || 0} kW`,
      sorter: (a: Inverter, b: Inverter) => (a.power || 0) - (b.power || 0),
    },
    {
      title: 'Current Output',
      dataIndex: 'pac',
      key: 'pac',
      width: 130,
      render: (pac: number) => (
        <Space>
          <ThunderboltOutlined style={{ color: '#faad14' }} />
          <Text>{pac ? pac.toFixed(2) : '0.00'} kW</Text>
        </Space>
      ),
      sorter: (a: Inverter, b: Inverter) => (a.pac || 0) - (b.pac || 0),
    },
    {
      title: "Today's Energy",
      dataIndex: 'etoday',
      key: 'etoday',
      width: 130,
      render: (etoday: number) => `${etoday ? etoday.toFixed(2) : '0.00'} kWh`,
      sorter: (a: Inverter, b: Inverter) => (a.etoday || 0) - (b.etoday || 0),
    },
    {
      title: 'Total Energy',
      dataIndex: 'etotal',
      key: 'etotal',
      width: 130,
      render: (etotal: number) => `${etotal ? etotal.toFixed(2) : '0.00'} kWh`,
      sorter: (a: Inverter, b: Inverter) => (a.etotal || 0) - (b.etotal || 0),
    },
    {
      title: 'Warranty',
      dataIndex: 'sn',
      key: 'warranty',
      width: 140,
      render: (sn: string) => {
        const warranty = warrantyData.get(sn);
        if (!warranty) return <Text type="secondary">-</Text>;

        const isActive = warranty.shelfState === 0;
        return (
          <Space direction="vertical" size="small">
            <Tag color={isActive ? 'success' : 'error'} icon={<SafetyOutlined />}>
              {isActive ? 'Active' : 'Expired'}
            </Tag>
            <Button
              type="link"
              size="small"
              icon={<InfoCircleOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                showWarrantyDetails(sn);
              }}
            >
              Details
            </Button>
          </Space>
        );
      },
    },
    {
      title: 'Battery SOC',
      dataIndex: 'batteryCapacitySoc',
      key: 'batteryCapacitySoc',
      width: 150,
      render: (soc: number) => soc !== undefined ? (
        <Space>
          <Progress
            type="circle"
            percent={soc}
            size={40}
            strokeColor={soc > 80 ? '#52c41a' : soc > 50 ? '#faad14' : '#ff4d4f'}
          />
          <Text>{soc}%</Text>
        </Space>
      ) : '-',
      sorter: (a: Inverter, b: Inverter) => (a.batteryCapacitySoc || 0) - (b.batteryCapacitySoc || 0),
    },
  ];

  const onlineInverters = inverters.filter(i => i.state === 1).length;
  const offlineInverters = inverters.filter(i => i.state === 2).length;
  const alarmInverters = inverters.filter(i => i.state === 3).length;
  const totalPower = inverters.reduce((sum, i) => sum + (i.pac || 0), 0);
  const totalEnergyToday = inverters.reduce((sum, i) => sum + (i.etoday || 0), 0);
  const totalEnergyAll = inverters.reduce((sum, i) => sum + (i.etotal || 0), 0);
  const avgBatterySoc = inverters.length > 0
    ? inverters.reduce((sum, i) => sum + (i.batteryCapacitySoc || 0), 0) / inverters.length
    : 0;

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
            <ThunderboltOutlined style={{ fontSize: 32 }} />
            <Title level={2} style={{ margin: 0 }}>
              Solar Inverters
            </Title>
          </Space>
          <Text style={{ color: 'rgba(0,0,0,0.65)' }}>
            Monitor and manage your solar inverters and battery systems
          </Text>
        </Space>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Inverters"
              value={inverters.length}
              prefix={<ThunderboltOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress
              percent={onlineInverters > 0 ? Math.round((onlineInverters / inverters.length) * 100) : 0}
              strokeColor="#52c41a"
              showInfo={false}
              size="small"
              style={{ marginTop: 8 }}
            />
            <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
              {onlineInverters} online, {offlineInverters} offline, {alarmInverters} alarm
            </div>
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
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Avg Battery SOC"
              value={avgBatterySoc.toFixed(0)}
              suffix="%"
              prefix={<ThunderboltFilled style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Inverters Table */}
      <Card
        title={
          <Space>
            <ThunderboltOutlined />
            <span>Inverter List</span>
          </Space>
        }
        extra={
          <Space>
            <Input
              placeholder="Search by SN, station or model"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 280 }}
              allowClear
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchInverters}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredInverters}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} inverters`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
          onRow={(record) => ({
            onClick: () => navigate(`/admin/soliscloud/inverters/${record.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>

      {/* Warranty Details Modal */}
      <Modal
        title={
          <Space>
            <SafetyOutlined />
            Inverter Warranty Information
          </Space>
        }
        open={isWarrantyModalVisible}
        onCancel={() => setIsWarrantyModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsWarrantyModalVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedWarranty && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Serial Number">
              <Text code>{selectedWarranty.sn}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Warranty Status">
              <Tag color={selectedWarranty.shelfState === 0 ? 'success' : 'error'} icon={<SafetyOutlined />}>
                {selectedWarranty.shelfState === 0 ? 'Active' : 'Expired'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Warranty Start Date">
              {selectedWarranty.shelfBeginTime ? new Date(selectedWarranty.shelfBeginTime).toLocaleDateString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Warranty End Date">
              {selectedWarranty.shelfEndTime ? new Date(selectedWarranty.shelfEndTime).toLocaleDateString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Warranty Duration">
              {selectedWarranty.shelfTime ? `${Math.floor(selectedWarranty.shelfTime / (1000 * 60 * 60 * 24 * 365))} years` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Warranty Type">
              {selectedWarranty.shelfWarrantyType || 'Standard'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default SolisCloudInverters;
