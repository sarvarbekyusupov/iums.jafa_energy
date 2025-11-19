import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Alert, Space, Typography, Tag, Progress } from 'antd';
import {
  ThunderboltOutlined,
  SunOutlined,
  FireOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloudServerOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../helpers/hooks/useAuth';
import { unifiedSolarService } from '../../service/unified-solar.service';
import type { UnifiedSolarSummary } from '../../service/unified-solar.service';

const { Title, Text } = Typography;

/**
 * User Dashboard - Summary view of solar energy system
 * Shows high-level overview with key metrics
 */
const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [solarData, setSolarData] = useState<UnifiedSolarSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSolarData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchSolarData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchSolarData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await unifiedSolarService.getUnifiedSolarData();
      setSolarData(data);
    } catch (error: any) {
      console.error('Failed to fetch solar data:', error);
      setError(error?.message || 'Failed to load solar data');
    } finally {
      setLoading(false);
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'HopeCloud': return '#1890ff';
      case 'SolisCloud': return '#52c41a';
      case 'FSolar': return '#fa8c16';
      default: return '#722ed1';
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'HopeCloud': return <CloudServerOutlined />;
      case 'SolisCloud': return <SunOutlined />;
      case 'FSolar': return <ThunderboltOutlined />;
      default: return <DashboardOutlined />;
    }
  };

  if (loading && !solarData) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Space direction="vertical" size="large">
          <Spin size="large" />
          <Text style={{ fontSize: '16px' }}>Loading your solar energy data...</Text>
        </Space>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Unable to Load Solar Data"
          description={error}
          type="error"
          showIcon
          action={<a onClick={fetchSolarData} style={{ cursor: 'pointer', fontWeight: 600 }}>Retry</a>}
        />
      </div>
    );
  }

  if (!solarData) return null;

  return (
    <div style={{ padding: '0' }}>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        {/* Welcome Header */}
        <div>
          <Title level={2} style={{ margin: 0, marginBottom: 4 }}>
            Welcome, {user?.firstName} {user?.lastName}!
          </Title>
          <Text type="secondary">
            Here's your solar energy system overview
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Last updated: {new Date(solarData.lastUpdate).toLocaleString()}
          </Text>
        </div>

        {/* Key Metrics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderLeft: '4px solid #1890ff' }}>
              <Statistic
                title="Current Power"
                value={solarData.totalCurrentPower.toFixed(2)}
                suffix="kW"
                prefix={<ThunderboltOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderLeft: '4px solid #52c41a' }}>
              <Statistic
                title="Energy Today"
                value={solarData.totalEnergyToday.toFixed(2)}
                suffix="kWh"
                prefix={<SunOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderLeft: '4px solid #fa8c16' }}>
              <Statistic
                title="Total Energy"
                value={(solarData.totalEnergyLifetime / 1000).toFixed(2)}
                suffix="MWh"
                prefix={<FireOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderLeft: `4px solid ${solarData.totalActiveAlarms > 0 ? '#f5222d' : '#52c41a'}` }}>
              <Statistic
                title="System Status"
                value={solarData.totalActiveAlarms}
                suffix="Alarms"
                prefix={solarData.totalActiveAlarms > 0 ? <WarningOutlined /> : <CheckCircleOutlined />}
                valueStyle={{ color: solarData.totalActiveAlarms > 0 ? '#f5222d' : '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Your Providers */}
        <Card title={<Space><DashboardOutlined /> Your Solar Providers</Space>}>
          <Row gutter={[16, 16]}>
            {solarData.providers.map((provider) => (
              <Col xs={24} md={8} key={provider.provider}>
                <Card
                  size="small"
                  style={{ borderLeft: `4px solid ${getProviderColor(provider.provider)}` }}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space>
                        {getProviderIcon(provider.provider)}
                        <Text strong style={{ color: getProviderColor(provider.provider) }}>
                          {provider.provider}
                        </Text>
                      </Space>
                      <Tag color={provider.alarms.active > 0 ? 'error' : 'success'}>
                        {provider.alarms.active > 0 ? `${provider.alarms.active} Alarms` : 'Healthy'}
                      </Tag>
                    </div>

                    <Row gutter={8}>
                      <Col span={12}>
                        <Statistic
                          title="Power"
                          value={provider.power.current.toFixed(1)}
                          suffix="kW"
                          valueStyle={{ fontSize: '18px', color: getProviderColor(provider.provider) }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Today"
                          value={provider.energy.today.toFixed(1)}
                          suffix="kWh"
                          valueStyle={{ fontSize: '18px', color: getProviderColor(provider.provider) }}
                        />
                      </Col>
                    </Row>

                    {provider.stations.total > 0 && (
                      <>
                        <div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Stations: {provider.stations.online}/{provider.stations.total} online
                          </Text>
                          <Progress
                            percent={Math.round((provider.stations.online / provider.stations.total) * 100)}
                            strokeColor={getProviderColor(provider.provider)}
                            size="small"
                            status={provider.stations.online === provider.stations.total ? 'success' : 'active'}
                          />
                        </div>
                      </>
                    )}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* System Summary */}
        <Card title={<Space><FireOutlined /> System Summary</Space>}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Total Stations"
                value={solarData.totalStations}
                prefix={<DashboardOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="This Month"
                value={solarData.totalEnergyMonth.toFixed(0)}
                suffix="kWh"
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="This Year"
                value={(solarData.totalEnergyYear / 1000).toFixed(1)}
                suffix="MWh"
                valueStyle={{ color: '#fa8c16' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Providers"
                value={solarData.providers.length}
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
          </Row>
        </Card>
      </Space>
    </div>
  );
};

export default UserDashboard;
