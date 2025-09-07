import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Table, message, Spin } from 'antd';
import { HomeOutlined, PlusOutlined } from '@ant-design/icons';
import { sitesService } from '../../../service';
import type { SiteResponseDto } from '../../../types';

const { Title, Text } = Typography;

const SitesManagement: React.FC = () => {
  const [sites, setSites] = useState<SiteResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const sitesData = await sitesService.getAllSites();
      setSites(sitesData);
    } catch (error: any) {
      console.error('Failed to fetch sites:', error);
      if (error?.response?.status === 404) {
        message.warning('Sites API endpoint not yet implemented on the backend');
      } else {
        message.error('Failed to fetch sites: ' + (error?.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
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
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Capacity',
      dataIndex: 'capacityKw',
      key: 'capacityKw',
      render: (value: string) => value ? `${value} kW` : 'N/A',
    },
    {
      title: 'Type',
      dataIndex: 'siteType',
      key: 'siteType',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Button type="link">View Details</Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '0' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <HomeOutlined style={{ color: '#1890ff' }} />
            Sites Management
          </Title>
          <Text type="secondary">
            Manage and monitor your solar installation sites
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />}>
          Add New Site
        </Button>
      </div>

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text>Loading sites...</Text>
            </div>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={sites}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            locale={{
              emptyText: 'No sites found'
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default SitesManagement;