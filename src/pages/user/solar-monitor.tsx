import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Alert, Space, Typography, Divider, Progress, Badge } from 'antd';
import {
  ThunderboltOutlined,
  SunOutlined,
  DashboardOutlined,
  CloudServerOutlined,
  FireOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { unifiedSolarService } from '../../service/unified-solar.service';
import type { UnifiedSolarSummary } from '../../service/unified-solar.service';
import { useAuth } from '../../helpers/hooks/useAuth';

const { Title, Text } = Typography;

/**
 * Simple Solar Monitor Page for End Users
 * Displays solar data from providers that belong to the authenticated user
 *
 * NOTE: The backend API should filter data based on the authenticated user's ID.
 * Only solar stations/devices assigned to this user should be returned.
 */
const SolarMonitor: React.FC = () => {
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

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'HopeCloud':
        return <CloudServerOutlined />;
      case 'SolisCloud':
        return <SunOutlined />;
      case 'FSolar':
        return <ThunderboltOutlined />;
      default:
        return <DashboardOutlined />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'HopeCloud':
        return '#1890ff';
      case 'SolisCloud':
        return '#52c41a';
      case 'FSolar':
        return '#fa8c16';
      default:
        return '#722ed1';
    }
  };

  if (loading && !solarData) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
        <Space direction="vertical" size="large">
          <Spin size="large" />
          <Text style={{ fontSize: '16px', color: '#595959' }}>Loading your solar energy data...</Text>
        </Space>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '48px', background: '#f0f2f5', minHeight: '100vh' }}>
        <Alert
          message="Unable to Load Solar Data"
          description={error}
          type="error"
          showIcon
          action={
            <a onClick={fetchSolarData} style={{ cursor: 'pointer', fontWeight: 600 }}>
              Retry
            </a>
          }
        />
      </div>
    );
  }

  if (!solarData) {
    return null;
  }

  return (
    <div style={{ padding: '24px 48px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Space direction="vertical" size={32} style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', paddingTop: '24px' }}>
          <Title level={1} style={{ margin: 0, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <SunOutlined style={{ color: '#faad14', fontSize: '48px' }} />
            {user ? `${user.firstName}'s Solar Energy System` : 'My Solar Energy System'}
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            Real-time monitoring of your solar power generation
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Last updated: {new Date(solarData.lastUpdate).toLocaleString()}
          </Text>
        </div>

        {/* Main Statistics Cards */}
        <Row gutter={[24, 24]}>
          {/* Current Power */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={{
                height: '100%',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>Current Power</span>}
                value={solarData.totalCurrentPower.toFixed(2)}
                suffix="kW"
                valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 700 }}
                prefix={<ThunderboltOutlined style={{ color: '#fff' }} />}
              />
              <Divider style={{ margin: '16px 0', borderColor: 'rgba(255,255,255,0.3)' }} />
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>
                Live generation capacity
              </Text>
            </Card>
          </Col>

          {/* Today's Energy */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={{
                height: '100%',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>Energy Today</span>}
                value={solarData.totalEnergyToday.toFixed(2)}
                suffix="kWh"
                valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 700 }}
                prefix={<SunOutlined style={{ color: '#fff' }} />}
              />
              <Divider style={{ margin: '16px 0', borderColor: 'rgba(255,255,255,0.3)' }} />
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>
                Energy generated today
              </Text>
            </Card>
          </Col>

          {/* Total Lifetime Energy */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={{
                height: '100%',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>Total Energy</span>}
                value={(solarData.totalEnergyLifetime / 1000).toFixed(2)}
                suffix="MWh"
                valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 700 }}
                prefix={<FireOutlined style={{ color: '#fff' }} />}
              />
              <Divider style={{ margin: '16px 0', borderColor: 'rgba(255,255,255,0.3)' }} />
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>
                Lifetime generation
              </Text>
            </Card>
          </Col>

          {/* System Status */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={{
                height: '100%',
                borderRadius: '12px',
                background: solarData.totalActiveAlarms > 0
                  ? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                  : 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>System Status</span>}
                value={solarData.totalActiveAlarms}
                suffix="Alarms"
                valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 700 }}
                prefix={solarData.totalActiveAlarms > 0 ? <WarningOutlined style={{ color: '#fff' }} /> : <CheckCircleOutlined style={{ color: '#fff' }} />}
              />
              <Divider style={{ margin: '16px 0', borderColor: 'rgba(255,255,255,0.3)' }} />
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>
                {solarData.totalActiveAlarms === 0 ? 'All systems running smoothly' : 'Attention needed'}
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Provider Breakdown */}
        <Card
          title={<Space><DashboardOutlined /> Your Solar Providers</Space>}
          bordered={false}
          style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          <Row gutter={[16, 16]}>
            {solarData.providers.map((provider) => (
              <Col xs={24} md={8} key={provider.provider}>
                <Card
                  size="small"
                  style={{
                    borderRadius: '8px',
                    borderLeft: `4px solid ${getProviderColor(provider.provider)}`,
                    height: '100%'
                  }}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Space>
                        {getProviderIcon(provider.provider)}
                        <Text strong style={{ color: getProviderColor(provider.provider), fontSize: '16px' }}>
                          {provider.provider}
                        </Text>
                      </Space>
                      <Badge
                        status={provider.alarms.active > 0 ? 'error' : 'success'}
                        text={provider.alarms.active > 0 ? `${provider.alarms.active} Alarms` : 'Healthy'}
                      />
                    </div>

                    <Row gutter={8}>
                      <Col span={12}>
                        <div style={{ background: '#fafafa', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                            Current Power
                          </Text>
                          <Text strong style={{ fontSize: '18px', color: getProviderColor(provider.provider) }}>
                            {provider.power.current.toFixed(1)} kW
                          </Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ background: '#fafafa', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                            Today
                          </Text>
                          <Text strong style={{ fontSize: '18px', color: getProviderColor(provider.provider) }}>
                            {provider.energy.today.toFixed(1)} kWh
                          </Text>
                        </div>
                      </Col>
                    </Row>

                    {provider.stations.total > 0 && (
                      <>
                        <Divider style={{ margin: '8px 0' }} />
                        <div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Stations: {provider.stations.online}/{provider.stations.total} online
                          </Text>
                          <Progress
                            percent={Math.round((provider.stations.online / provider.stations.total) * 100)}
                            strokeColor={getProviderColor(provider.provider)}
                            size="small"
                            status={provider.stations.online === provider.stations.total ? 'success' : 'active'}
                            style={{ marginTop: '4px' }}
                          />
                        </div>
                      </>
                    )}

                    {provider.devices.total > 0 && (
                      <>
                        <Divider style={{ margin: '8px 0' }} />
                        <div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Devices: {provider.devices.online}/{provider.devices.total} online
                          </Text>
                          <Progress
                            percent={Math.round((provider.devices.online / provider.devices.total) * 100)}
                            strokeColor={getProviderColor(provider.provider)}
                            size="small"
                            status={provider.devices.online === provider.devices.total ? 'success' : 'active'}
                            style={{ marginTop: '4px' }}
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
        <Card
          title={<Space><FireOutlined /> System Summary</Space>}
          bordered={false}
          style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                  Total Stations
                </Text>
                <Text style={{ fontSize: '32px', fontWeight: 700, color: '#1890ff' }}>
                  {solarData.totalStations}
                </Text>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                  Total Devices
                </Text>
                <Text style={{ fontSize: '32px', fontWeight: 700, color: '#52c41a' }}>
                  {solarData.totalDevices}
                </Text>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                  This Month
                </Text>
                <Text style={{ fontSize: '32px', fontWeight: 700, color: '#fa8c16' }}>
                  {solarData.totalEnergyMonth.toFixed(0)} <span style={{ fontSize: '16px' }}>kWh</span>
                </Text>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                  This Year
                </Text>
                <Text style={{ fontSize: '32px', fontWeight: 700, color: '#722ed1' }}>
                  {(solarData.totalEnergyYear / 1000).toFixed(1)} <span style={{ fontSize: '16px' }}>MWh</span>
                </Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Footer Info */}
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Data aggregated from {solarData.providers.length} solar providers • Auto-refreshes every 5 minutes
          </Text>
        </div>
      </Space>
    </div>
  );
};

export default SolarMonitor;
