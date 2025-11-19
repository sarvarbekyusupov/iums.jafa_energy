import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, Alert, Space, Typography, Table, Tag, Statistic, Descriptions } from 'antd';
import {
  ThunderboltOutlined,
  SunOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  CloudServerOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { unifiedSolarService } from '../../service/unified-solar.service';
import type { UnifiedSolarSummary } from '../../service/unified-solar.service';

const { Title, Text } = Typography;

/**
 * User Inverters Detail Page
 * Shows detailed information about all user's inverters/stations
 * Read-only view (no management controls)
 */
const UserInvertersDetail: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [solarData, setSolarData] = useState<UnifiedSolarSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSolarData();
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
          <Text style={{ fontSize: '16px' }}>Loading your inverters data...</Text>
        </Space>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Unable to Load Inverters Data"
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
        {/* Page Header */}
        <div>
          <Title level={2} style={{ margin: 0, marginBottom: 4 }}>
            My Inverters & Stations
          </Title>
          <Text type="secondary">
            Detailed information about your solar energy systems
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Last updated: {new Date(solarData.lastUpdate).toLocaleString()}
          </Text>
        </div>

        {/* Quick Summary */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Stations"
                value={solarData.totalStations}
                prefix={<DashboardOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Current Power Output"
                value={solarData.totalCurrentPower.toFixed(2)}
                suffix="kW"
                prefix={<ThunderboltOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Energy Today"
                value={solarData.totalEnergyToday.toFixed(2)}
                suffix="kWh"
                prefix={<SunOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Detailed Provider Information */}
        {solarData.providers.map((provider) => (
          <Card
            key={provider.provider}
            title={
              <Space>
                {getProviderIcon(provider.provider)}
                <span style={{ color: getProviderColor(provider.provider) }}>
                  {provider.provider}
                </span>
              </Space>
            }
            extra={
              <Tag color={provider.alarms.active > 0 ? 'error' : 'success'}>
                {provider.alarms.active > 0 ? `${provider.alarms.active} Alarms` : 'Healthy'}
              </Tag>
            }
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Provider Summary */}
              <Descriptions bordered column={{ xs: 1, sm: 2, md: 4 }}>
                <Descriptions.Item label="Stations">
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>{provider.stations.online} Online</Text>
                    {provider.stations.offline > 0 && (
                      <>
                        <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                        <Text>{provider.stations.offline} Offline</Text>
                      </>
                    )}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Current Power">
                  <Text strong style={{ color: getProviderColor(provider.provider) }}>
                    {provider.power.current.toFixed(2)} kW
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Energy Today">
                  <Text strong style={{ color: getProviderColor(provider.provider) }}>
                    {provider.energy.today.toFixed(2)} kWh
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Total Energy">
                  <Text strong style={{ color: getProviderColor(provider.provider) }}>
                    {(provider.energy.total / 1000).toFixed(2)} MWh
                  </Text>
                </Descriptions.Item>
              </Descriptions>

              {/* Energy Stats Cards */}
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Card size="small" style={{ background: '#f0f5ff', border: '1px solid #d6e4ff' }}>
                    <Statistic
                      title="Today's Production"
                      value={provider.energy.today.toFixed(1)}
                      suffix="kWh"
                      valueStyle={{ fontSize: '18px', color: getProviderColor(provider.provider) }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                    <Statistic
                      title="This Month"
                      value={provider.energy.thisMonth.toFixed(1)}
                      suffix="kWh"
                      valueStyle={{ fontSize: '18px', color: getProviderColor(provider.provider) }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card size="small" style={{ background: '#fffbe6', border: '1px solid #ffe58f' }}>
                    <Statistic
                      title="This Year"
                      value={(provider.energy.thisYear / 1000).toFixed(1)}
                      suffix="MWh"
                      valueStyle={{ fontSize: '18px', color: getProviderColor(provider.provider) }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card size="small" style={{ background: '#fff0f6', border: '1px solid #ffadd2' }}>
                    <Statistic
                      title="Lifetime Total"
                      value={(provider.energy.total / 1000).toFixed(2)}
                      suffix="MWh"
                      valueStyle={{ fontSize: '18px', color: getProviderColor(provider.provider) }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Device/Station Status */}
              {(provider.devices.total > 0 || provider.stations.total > 0) && (
                <Card size="small" title="Status Overview" type="inner">
                  <Row gutter={[16, 16]}>
                    <Col xs={12} sm={8}>
                      <Space direction="vertical" align="center" style={{ width: '100%' }}>
                        <CheckCircleOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
                        <Text type="secondary">Online</Text>
                        <Text strong style={{ fontSize: '20px' }}>
                          {provider.stations.online || provider.devices.online}
                        </Text>
                      </Space>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Space direction="vertical" align="center" style={{ width: '100%' }}>
                        <CloseCircleOutlined style={{ fontSize: '32px', color: '#ff4d4f' }} />
                        <Text type="secondary">Offline</Text>
                        <Text strong style={{ fontSize: '20px' }}>
                          {provider.stations.offline || provider.devices.offline}
                        </Text>
                      </Space>
                    </Col>
                    {provider.devices.warning > 0 && (
                      <Col xs={12} sm={8}>
                        <Space direction="vertical" align="center" style={{ width: '100%' }}>
                          <WarningOutlined style={{ fontSize: '32px', color: '#fa8c16' }} />
                          <Text type="secondary">Warning</Text>
                          <Text strong style={{ fontSize: '20px' }}>
                            {provider.devices.warning}
                          </Text>
                        </Space>
                      </Col>
                    )}
                  </Row>
                </Card>
              )}
            </Space>
          </Card>
        ))}

        {/* Info Footer */}
        <Alert
          message="Read-Only View"
          description="You're viewing your inverters in monitoring mode. Contact your administrator for configuration changes or support."
          type="info"
          showIcon
        />
      </Space>
    </div>
  );
};

export default UserInvertersDetail;
