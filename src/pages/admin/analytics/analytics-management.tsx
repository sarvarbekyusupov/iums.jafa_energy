import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Table, message, Spin, Row, Col, Statistic } from 'antd';
import { BarChartOutlined, LineChartOutlined, PieChartOutlined } from '@ant-design/icons';
import { analyticsService, siteKpisService } from '../../../service';

const { Title, Text } = Typography;

const AnalyticsManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [kpis, setKpis] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
    fetchKpis();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const analyticsData = await analyticsService.getExecutiveDashboard();
      setAnalytics(analyticsData);
    } catch (error: any) {
      message.error('Failed to fetch analytics: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchKpis = async () => {
    try {
      const kpisData = await siteKpisService.getAllSiteKpis();
      setKpis(Array.isArray(kpisData) ? kpisData : []);
    } catch (error: any) {
      message.error('Failed to fetch KPIs: ' + (error?.message || 'Unknown error'));
    }
  };

  const kpiColumns = [
    {
      title: 'Site',
      dataIndex: 'siteId',
      key: 'siteId',
    },
    {
      title: 'Energy Generated (kWh)',
      dataIndex: 'energyGenerated',
      key: 'energyGenerated',
      render: (value: number) => value ? value.toFixed(2) : '0.00',
    },
    {
      title: 'Revenue ($)',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value: number) => value ? `$${value.toFixed(2)}` : '$0.00',
    },
    {
      title: 'Efficiency (%)',
      dataIndex: 'efficiency',
      key: 'efficiency',
      render: (value: number) => value ? `${value.toFixed(1)}%` : '0.0%',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div style={{ padding: '0' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BarChartOutlined style={{ color: '#722ed1' }} />
          Analytics Dashboard
        </Title>
        <Text type="secondary">
          View performance analytics and insights
        </Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Energy Generated"
              value={analytics?.totalEnergy || 0}
              suffix="kWh"
              valueStyle={{ color: '#3f8600' }}
              prefix={<LineChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={analytics?.totalRevenue || 0}
              prefix={<PieChartOutlined />}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
              formatter={(value) => `$${value}`}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Average Efficiency"
              value={analytics?.avgEfficiency || 0}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#722ed1' }}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="Performance Overview">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <Spin size="large" />
              <div style={{ marginTop: '16px' }}>
                <Text>Loading analytics...</Text>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="secondary">
                Charts and visualizations will be displayed here
              </Text>
            </div>
          )}
        </Card>

        <Card title="Site KPIs">
          <Table
            columns={kpiColumns}
            dataSource={Array.isArray(kpis) ? kpis : []}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            locale={{
              emptyText: 'No KPIs found'
            }}
            loading={loading}
          />
        </Card>
      </Space>
    </div>
  );
};

export default AnalyticsManagement;