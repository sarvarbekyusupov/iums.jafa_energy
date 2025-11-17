import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  Spin,
  Alert,
  Badge,
  Tag,
  Divider,
  Progress,
  Table,
} from 'antd';
import {
  ThunderboltOutlined,
  DashboardOutlined,
  AlertOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  SunOutlined,
  FireOutlined,
  SafetyOutlined,
  RiseOutlined,
  FallOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Column, Pie } from '@ant-design/charts';
import { unifiedSolarService } from '../../service/unified-solar.service';
import type { UnifiedSolarSummary, UnifiedSolarData } from '../../service/unified-solar.service';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [solarData, setSolarData] = useState<UnifiedSolarSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await unifiedSolarService.getUnifiedSolarData();
      setSolarData(data);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error?.message || 'Failed to load solar data');
    } finally {
      setLoading(false);
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

  if (loading && !solarData) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Space direction="vertical" size="large">
          <Spin size="large" />
          <Text>Loading solar energy data from all providers...</Text>
        </Space>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Error Loading Dashboard"
          description={error}
          type="error"
          showIcon
          action={
            <a onClick={fetchDashboardData} style={{ cursor: 'pointer' }}>
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

  // Prepare chart data
  const energyChartData = solarData.providers.map(p => ({
    provider: p.provider,
    value: p.energy.today,
    type: 'Today',
  })).concat(
    solarData.providers.map(p => ({
      provider: p.provider,
      value: p.energy.total,
      type: 'Lifetime',
    }))
  );

  const powerDistribution = solarData.providers
    .filter(p => p.power.current > 0)
    .map(p => ({
      provider: p.provider,
      value: p.power.current,
    }));

  const deviceStatusData = solarData.providers.flatMap(p => [
    { provider: p.provider, status: 'Online', count: p.devices.online },
    { provider: p.provider, status: 'Offline', count: p.devices.offline },
    { provider: p.provider, status: 'Warning', count: p.devices.warning },
  ]).filter(d => d.count > 0);

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        {/* Page Header */}
        <div>
          <Title level={2} style={{ margin: 0, marginBottom: 4, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <DashboardOutlined style={{ color: '#52c41a' }} />
            Unified Solar Energy Dashboard
          </Title>
          <Text type="secondary">
            Real-time monitoring across HopeCloud, SolisCloud, and FSolar providers
          </Text>
          <Text type="secondary" style={{ marginLeft: '16px', fontSize: '12px' }}>
            Last updated: {new Date(solarData.lastUpdate).toLocaleString()}
          </Text>
        </div>

        {/* Overall Statistics */}
        <Card title={<Space><FireOutlined /> Overall System Statistics</Space>} bordered={false}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable style={{ borderLeft: '4px solid #52c41a', height: '100%' }}>
                <Statistic
                  title="Total Energy Today"
                  value={solarData.totalEnergyToday.toFixed(2)}
                  suffix="kWh"
                  valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 600 }}
                  prefix={<ThunderboltOutlined />}
                />
                <Divider style={{ margin: '12px 0' }} />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Across all {solarData.providers.length} providers
                </Text>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card hoverable style={{ borderLeft: '4px solid #1890ff', height: '100%' }}>
                <Statistic
                  title="Current Power Output"
                  value={solarData.totalCurrentPower.toFixed(2)}
                  suffix="kW"
                  valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 600 }}
                  prefix={<RiseOutlined />}
                />
                <Divider style={{ margin: '12px 0' }} />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Real-time generation capacity
                </Text>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card hoverable style={{ borderLeft: '4px solid #fa8c16', height: '100%' }}>
                <Statistic
                  title="Total Lifetime Energy"
                  value={(solarData.totalEnergyLifetime / 1000).toFixed(2)}
                  suffix="MWh"
                  valueStyle={{ color: '#fa8c16', fontSize: '28px', fontWeight: 600 }}
                  prefix={<DatabaseOutlined />}
                />
                <Divider style={{ margin: '12px 0' }} />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Cumulative generation
                </Text>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card hoverable style={{ borderLeft: '4px solid #f5222d', height: '100%' }}>
                <Statistic
                  title="Active Alarms"
                  value={solarData.totalActiveAlarms}
                  valueStyle={{ color: solarData.totalActiveAlarms > 0 ? '#f5222d' : '#52c41a', fontSize: '28px', fontWeight: 600 }}
                  prefix={solarData.totalActiveAlarms > 0 ? <WarningOutlined /> : <CheckCircleOutlined />}
                />
                <Divider style={{ margin: '12px 0' }} />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {solarData.totalActiveAlarms === 0 ? 'All systems nominal' : 'Requires attention'}
                </Text>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* Provider Comparison Cards */}
        <Row gutter={[16, 16]}>
          {solarData.providers.map((provider: UnifiedSolarData) => (
            <Col xs={24} lg={8} key={provider.provider}>
              <Card
                title={
                  <Space>
                    {getProviderIcon(provider.provider)}
                    <span style={{ color: getProviderColor(provider.provider) }}>
                      {provider.provider}
                    </span>
                  </Space>
                }
                bordered={false}
                style={{ height: '100%' }}
                extra={
                  <Badge
                    status={provider.alarms.active > 0 ? 'error' : 'success'}
                    text={provider.alarms.active > 0 ? `${provider.alarms.active} Alarms` : 'Healthy'}
                  />
                }
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {/* Energy Statistics */}
                  <div>
                    <Text strong style={{ color: getProviderColor(provider.provider) }}>
                      Energy Production
                    </Text>
                    <Row gutter={[8, 8]} style={{ marginTop: '8px' }}>
                      <Col span={12}>
                        <Card size="small">
                          <Statistic
                            title="Today"
                            value={provider.energy.today.toFixed(1)}
                            suffix="kWh"
                            valueStyle={{ fontSize: '16px' }}
                          />
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card size="small">
                          <Statistic
                            title="Lifetime"
                            value={(provider.energy.total / 1000).toFixed(1)}
                            suffix="MWh"
                            valueStyle={{ fontSize: '16px' }}
                          />
                        </Card>
                      </Col>
                    </Row>
                  </div>

                  {/* Power & Devices */}
                  <div>
                    <Row gutter={[8, 8]}>
                      <Col span={12}>
                        <div style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>Current Power</Text>
                          <div style={{ fontSize: '18px', fontWeight: 600, color: getProviderColor(provider.provider) }}>
                            {provider.power.current.toFixed(2)} kW
                          </div>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>Devices</Text>
                          <div style={{ fontSize: '18px', fontWeight: 600 }}>
                            {provider.devices.online}/{provider.devices.total}
                            {provider.stations.total > 0 && (
                              <Text type="secondary" style={{ fontSize: '12px', marginLeft: '4px' }}>
                                ({provider.stations.online}/{provider.stations.total} stations)
                              </Text>
                            )}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Device Status */}
                  {provider.devices.total > 0 && (
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>Device Health</Text>
                      <Progress
                        percent={Math.round((provider.devices.online / provider.devices.total) * 100)}
                        strokeColor={getProviderColor(provider.provider)}
                        status={provider.devices.online === provider.devices.total ? 'success' : 'active'}
                      />
                      <Space size="small" style={{ marginTop: '4px' }}>
                        <Tag color="success" style={{ fontSize: '11px' }}>
                          {provider.devices.online} Online
                        </Tag>
                        {provider.devices.offline > 0 && (
                          <Tag color="default" style={{ fontSize: '11px' }}>
                            {provider.devices.offline} Offline
                          </Tag>
                        )}
                        {provider.devices.warning > 0 && (
                          <Tag color="warning" style={{ fontSize: '11px' }}>
                            {provider.devices.warning} Warning
                          </Tag>
                        )}
                      </Space>
                    </div>
                  )}

                  {/* Alarms */}
                  {provider.alarms.active > 0 && (
                    <Alert
                      message={`${provider.alarms.active} Active Alarms`}
                      description={
                        <Space size="small">
                          {provider.alarms.critical > 0 && (
                            <Tag color="error">
                              {provider.alarms.critical} Critical
                            </Tag>
                          )}
                          {provider.alarms.warning > 0 && (
                            <Tag color="warning">
                              {provider.alarms.warning} Warning
                            </Tag>
                          )}
                        </Space>
                      }
                      type="warning"
                      showIcon
                      icon={<AlertOutlined />}
                      style={{ padding: '8px 12px' }}
                    />
                  )}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Charts Section */}
        <Row gutter={[16, 16]}>
          {/* Energy Comparison Chart */}
          <Col xs={24} lg={12}>
            <Card title={<Space><ThunderboltOutlined /> Energy Production Comparison</Space>} bordered={false}>
              {energyChartData.filter(d => d.value > 0).length > 0 ? (
                <Column
                  data={energyChartData.filter(d => d.value > 0)}
                  xField="provider"
                  yField="value"
                  seriesField="type"
                  isGroup={true}
                  columnStyle={{
                    radius: [8, 8, 0, 0],
                  }}
                  label={{
                    position: 'top',
                    formatter: (datum) => `${datum.value.toFixed(1)} kWh`,
                    style: {
                      fontSize: 10,
                    },
                  }}
                  legend={{
                    position: 'top-right',
                  }}
                  height={300}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                  <Text type="secondary">No energy data available</Text>
                </div>
              )}
            </Card>
          </Col>

          {/* Power Distribution Pie Chart */}
          <Col xs={24} lg={12}>
            <Card title={<Space><RiseOutlined /> Current Power Distribution</Space>} bordered={false}>
              {powerDistribution.length > 0 ? (
                <Pie
                  data={powerDistribution}
                  angleField="value"
                  colorField="provider"
                  radius={0.8}
                  innerRadius={0.6}
                  label={{
                    type: 'spider',
                    formatter: (datum) => `${datum.provider}\n${datum.value.toFixed(2)} kW`,
                  }}
                  legend={{
                    position: 'bottom',
                  }}
                  height={300}
                  color={({ provider }) => getProviderColor(provider)}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                  <Text type="secondary">No power data available</Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Device Status Table */}
        <Card title={<Space><DatabaseOutlined /> Device Status Overview</Space>} bordered={false}>
          <Table
            dataSource={solarData.providers.map((p, index) => ({
              key: index,
              provider: p.provider,
              stations: p.stations.total,
              stationsOnline: p.stations.online,
              devices: p.devices.total,
              devicesOnline: p.devices.online,
              devicesOffline: p.devices.offline,
              devicesWarning: p.devices.warning,
              currentPower: p.power.current,
              energyToday: p.energy.today,
              alarms: p.alarms.active,
            }))}
            pagination={false}
            scroll={{ x: 'max-content' }}
            columns={[
              {
                title: 'Provider',
                dataIndex: 'provider',
                key: 'provider',
                render: (text: string) => (
                  <Space>
                    {getProviderIcon(text)}
                    <Text strong style={{ color: getProviderColor(text) }}>{text}</Text>
                  </Space>
                ),
                fixed: 'left',
              },
              {
                title: 'Stations',
                children: [
                  {
                    title: 'Total',
                    dataIndex: 'stations',
                    key: 'stations',
                    align: 'center' as const,
                  },
                  {
                    title: 'Online',
                    dataIndex: 'stationsOnline',
                    key: 'stationsOnline',
                    align: 'center' as const,
                    render: (val: number, record: any) => (
                      <Tag color={val === record.stations ? 'success' : 'default'}>{val}</Tag>
                    ),
                  },
                ],
              },
              {
                title: 'Devices',
                children: [
                  {
                    title: 'Total',
                    dataIndex: 'devices',
                    key: 'devices',
                    align: 'center' as const,
                  },
                  {
                    title: 'Online',
                    dataIndex: 'devicesOnline',
                    key: 'devicesOnline',
                    align: 'center' as const,
                    render: (val: number) => <Tag color="success">{val}</Tag>,
                  },
                  {
                    title: 'Offline',
                    dataIndex: 'devicesOffline',
                    key: 'devicesOffline',
                    align: 'center' as const,
                    render: (val: number) => val > 0 ? <Tag color="default">{val}</Tag> : <Text type="secondary">0</Text>,
                  },
                  {
                    title: 'Warning',
                    dataIndex: 'devicesWarning',
                    key: 'devicesWarning',
                    align: 'center' as const,
                    render: (val: number) => val > 0 ? <Tag color="warning">{val}</Tag> : <Text type="secondary">0</Text>,
                  },
                ],
              },
              {
                title: 'Power (kW)',
                dataIndex: 'currentPower',
                key: 'currentPower',
                align: 'right' as const,
                render: (val: number) => <Text strong>{val.toFixed(2)}</Text>,
              },
              {
                title: 'Energy Today (kWh)',
                dataIndex: 'energyToday',
                key: 'energyToday',
                align: 'right' as const,
                render: (val: number) => <Text strong style={{ color: '#52c41a' }}>{val.toFixed(2)}</Text>,
              },
              {
                title: 'Alarms',
                dataIndex: 'alarms',
                key: 'alarms',
                align: 'center' as const,
                render: (val: number) => (
                  val > 0 ? (
                    <Badge count={val} style={{ backgroundColor: '#f5222d' }} />
                  ) : (
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                  )
                ),
              },
            ]}
          />
        </Card>

        {/* System Information */}
        <Card title={<Space><SafetyOutlined /> System Summary</Space>} bordered={false}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                <Text strong>Total Sites/Stations</Text>
                <div style={{ fontSize: '24px', fontWeight: 600, color: '#1890ff', marginTop: '8px' }}>
                  {solarData.totalStations}
                </div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Across all providers
                </Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                <Text strong>Total Devices</Text>
                <div style={{ fontSize: '24px', fontWeight: 600, color: '#52c41a', marginTop: '8px' }}>
                  {solarData.totalDevices}
                </div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Inverters, collectors, and equipment
                </Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                <Text strong>Connected Providers</Text>
                <div style={{ fontSize: '24px', fontWeight: 600, color: '#fa8c16', marginTop: '8px' }}>
                  {solarData.providers.length}
                </div>
                <Space size="small" style={{ marginTop: '8px' }}>
                  {solarData.providers.map(p => (
                    <Tag key={p.provider} color={getProviderColor(p.provider)} style={{ margin: 0 }}>
                      {p.provider}
                    </Tag>
                  ))}
                </Space>
              </div>
            </Col>
          </Row>
        </Card>
      </Space>
    </div>
  );
};

export default Dashboard;
