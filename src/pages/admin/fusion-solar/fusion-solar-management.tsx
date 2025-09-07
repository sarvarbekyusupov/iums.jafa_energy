import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Button, Table, message, Spin, Tabs } from 'antd';
import { ThunderboltOutlined, SyncOutlined, DatabaseOutlined } from '@ant-design/icons';
import { fusionSolarService } from '../../../service';

const { Title, Text } = Typography;

const FusionSolarManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<any>(null);
  const [plants, setPlants] = useState<any[]>([]);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const healthData = await fusionSolarService.getHealth();
      setHealth(healthData);
    } catch (error: any) {
      message.error('Failed to fetch FusionSolar health: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const plantsData = await fusionSolarService.getPlants();
      setPlants(plantsData);
    } catch (error: any) {
      message.error('Failed to fetch plants: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const triggerSync = async (syncType: 'realtime' | 'daily' | 'monthly') => {
    try {
      setLoading(true);
      switch (syncType) {
        case 'realtime':
          await fusionSolarService.triggerRealtimeSync();
          break;
        case 'daily':
          await fusionSolarService.triggerDailySync();
          break;
        case 'monthly':
          await fusionSolarService.triggerMonthlySync();
          break;
      }
      message.success(`${syncType} sync triggered successfully`);
    } catch (error: any) {
      message.error(`Failed to trigger ${syncType} sync: ` + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'health',
      label: 'System Health',
      children: (
        <Card>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <Spin size="large" />
              <div style={{ marginTop: '16px' }}>
                <Text>Loading health data...</Text>
              </div>
            </div>
          ) : (
            <div>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Text strong>Status: </Text>
                  <Text type={health?.status === 'healthy' ? 'success' : 'danger'}>
                    {health?.status || 'Unknown'}
                  </Text>
                </div>
                <Button 
                  type="primary" 
                  icon={<SyncOutlined />}
                  onClick={fetchHealth}
                  loading={loading}
                >
                  Refresh Health
                </Button>
              </Space>
            </div>
          )}
        </Card>
      ),
    },
    {
      key: 'plants',
      label: 'Plants',
      children: (
        <Card>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Button 
              type="primary" 
              icon={<DatabaseOutlined />}
              onClick={fetchPlants}
              loading={loading}
            >
              Load Plants
            </Button>
            <Table
              columns={[
                { title: 'Plant ID', dataIndex: 'id', key: 'id' },
                { title: 'Name', dataIndex: 'name', key: 'name' },
                { title: 'Capacity', dataIndex: 'capacity', key: 'capacity' },
                { title: 'Status', dataIndex: 'status', key: 'status' },
              ]}
              dataSource={plants}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: 'No plants found' }}
            />
          </Space>
        </Card>
      ),
    },
    {
      key: 'sync',
      label: 'Data Sync',
      children: (
        <Card>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Title level={4}>Sync Operations</Title>
            <Space wrap>
              <Button 
                type="primary" 
                icon={<SyncOutlined />}
                onClick={() => triggerSync('realtime')}
                loading={loading}
              >
                Trigger Realtime Sync
              </Button>
              <Button 
                type="primary" 
                icon={<SyncOutlined />}
                onClick={() => triggerSync('daily')}
                loading={loading}
              >
                Trigger Daily Sync
              </Button>
              <Button 
                type="primary" 
                icon={<SyncOutlined />}
                onClick={() => triggerSync('monthly')}
                loading={loading}
              >
                Trigger Monthly Sync
              </Button>
            </Space>
          </Space>
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: '0' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThunderboltOutlined style={{ color: '#ff9500' }} />
          FusionSolar Management
        </Title>
        <Text type="secondary">
          Monitor and manage FusionSolar integration
        </Text>
      </div>

      <Tabs items={tabItems} />
    </div>
  );
};

export default FusionSolarManagement;