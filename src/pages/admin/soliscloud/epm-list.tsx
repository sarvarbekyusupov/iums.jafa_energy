import React, { useEffect, useState } from 'react';
import { Card, Table, message, Button, Space, Tag, Typography, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  ThunderboltOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import solisCloudService from '../../../service/soliscloud.service';

const { Title, Text } = Typography;

interface EPMDevice {
  id: string;
  stationId: string;
  stationName: string;
  sn: string;
  dataTimestamp: string;
  pac: number;
  familyLoadPower: number;
  activePower: number;
  status: number;
  [key: string]: any;
}

const EPMListPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EPMDevice[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await solisCloudService.getEPMList({
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
      });

      setData(response.records || []);
      setPagination({
        ...pagination,
        total: response.total || 0,
      });
    } catch (error: any) {
      message.error(error?.response?.data?.msg || 'Failed to fetch EPM devices');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total,
    });
  };

  const getStatusTag = (status: number) => {
    switch (status) {
      case 1:
        return <Tag color="success">Online</Tag>;
      case 2:
        return <Tag color="error">Offline</Tag>;
      case 3:
        return <Tag color="warning">Alarm</Tag>;
      default:
        return <Tag color="default">Unknown</Tag>;
    }
  };

  const filteredData = data.filter(item =>
    item.sn?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.stationName?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<EPMDevice> = [
    {
      title: 'Serial Number',
      dataIndex: 'sn',
      key: 'sn',
      width: 160,
      fixed: 'left',
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
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => getStatusTag(status),
    },
    {
      title: 'PAC (kW)',
      dataIndex: 'pac',
      key: 'pac',
      width: 100,
      render: (value: number) => (value || 0).toFixed(2),
    },
    {
      title: 'Family Load Power (kW)',
      dataIndex: 'familyLoadPower',
      key: 'familyLoadPower',
      width: 160,
      render: (value: number) => (value || 0).toFixed(2),
    },
    {
      title: 'Active Power (kW)',
      dataIndex: 'activePower',
      key: 'activePower',
      width: 130,
      render: (value: number) => (value || 0).toFixed(2),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_: any, record: EPMDevice) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/admin/soliscloud/epm/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card
        style={{
          marginBottom: 24,
          
          border: 'none',
        }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Space>
            <ThunderboltOutlined style={{ fontSize: 32 }} />
            <Title level={2} style={{ margin: 0 }}>
              EPM Devices
            </Title>
          </Space>
          <Text style={{ color: 'rgba(0,0,0,0.65)' }}>
            Energy Power Meter devices monitoring
          </Text>
        </Space>
      </Card>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Input
            placeholder="Search by serial number or station"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchData}
            loading={loading}
          >
            Refresh
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} devices`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
};

export default EPMListPage;
