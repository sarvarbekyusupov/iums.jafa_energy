import React, { useEffect, useState } from 'react';
import { Card, Table, message, Button, Space, Tag, Typography, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  CloudOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import solisCloudService from '../../../service/soliscloud.service';

const { Title, Text } = Typography;

interface WeatherStation {
  id: string;
  stationId: string;
  stationName: string;
  sn: string;
  dataTimestamp: string;
  temperature: number;
  humidity: number;
  irradiance: number;
  windSpeed: number;
  status: number;
  [key: string]: any;
}

const WeatherListPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WeatherStation[]>([]);
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
      const response = await solisCloudService.getWeatherStationList({
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
      });

      setData(response.records || []);
      setPagination({
        ...pagination,
        total: response.total || 0,
      });
    } catch (error: any) {
      message.error(error?.response?.data?.msg || 'Failed to fetch weather stations');
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

  const columns: ColumnsType<WeatherStation> = [
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
      title: 'Temperature (°C)',
      dataIndex: 'temperature',
      key: 'temperature',
      width: 130,
      render: (value: number) => (value || 0).toFixed(1),
    },
    {
      title: 'Humidity (%)',
      dataIndex: 'humidity',
      key: 'humidity',
      width: 110,
      render: (value: number) => (value || 0).toFixed(1),
    },
    {
      title: 'Irradiance (W/m²)',
      dataIndex: 'irradiance',
      key: 'irradiance',
      width: 130,
      render: (value: number) => (value || 0).toFixed(0),
    },
    {
      title: 'Wind Speed (m/s)',
      dataIndex: 'windSpeed',
      key: 'windSpeed',
      width: 120,
      render: (value: number) => (value || 0).toFixed(1),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_: any, record: WeatherStation) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/admin/soliscloud/weather/${record.sn}`)}
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
            <CloudOutlined style={{ fontSize: 32 }} />
            <Title level={2} style={{ margin: 0 }}>
              Weather Stations
            </Title>
          </Space>
          <Text style={{ color: 'rgba(0,0,0,0.65)' }}>
            Environmental monitoring and weather data
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
          rowKey="sn"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} weather stations`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default WeatherListPage;
