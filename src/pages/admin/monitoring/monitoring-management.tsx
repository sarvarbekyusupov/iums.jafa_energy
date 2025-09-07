import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Table, message, Spin, Statistic, Row, Col } from 'antd';
import { MonitorOutlined, ReloadOutlined, AlertOutlined } from '@ant-design/icons';
import { monitoringService, deviceAlarmsService } from '../../../service';

const { Title, Text } = Typography;

const MonitoringManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [alarms, setAlarms] = useState<any[]>([]);

  useEffect(() => {
    fetchSystemStatus();
    fetchAlarms();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      setLoading(true);
      const status = await monitoringService.getSystemHealth();
      setSystemStatus(status);
    } catch (error: any) {
      message.error('Failed to fetch system status: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchAlarms = async () => {
    try {
      const alarmsData = await deviceAlarmsService.getAllDeviceAlarms();
      setAlarms(Array.isArray(alarmsData) ? alarmsData : []);
    } catch (error: any) {
      message.error('Failed to fetch alarms: ' + (error?.message || 'Unknown error'));
    }
  };

  const alarmColumns = [
    {
      title: 'Device',
      dataIndex: 'deviceId',
      key: 'deviceId',
    },
    {
      title: 'Type',
      dataIndex: 'alarmType',
      key: 'alarmType',
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => (
        <Text type={severity === 'critical' ? 'danger' : severity === 'warning' ? 'warning' : 'secondary'}>
          {severity?.toUpperCase()}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Text type={status === 'active' ? 'danger' : 'success'}>
          {status?.toUpperCase()}
        </Text>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div style={{ padding: '0' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MonitorOutlined style={{ color: '#1890ff' }} />
            System Monitoring
          </Title>
          <Text type="secondary">
            Monitor system health and performance
          </Text>
        </div>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />}
          onClick={() => { fetchSystemStatus(); fetchAlarms(); }}
          loading={loading}
        >
          Refresh Data
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="System Status"
              value={systemStatus?.status || 'Unknown'}
              valueStyle={{ color: systemStatus?.status === 'healthy' ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Alarms"
              value={Array.isArray(alarms) ? alarms.filter(a => a.status === 'active').length : 0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Devices"
              value={systemStatus?.totalDevices || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Online Devices"
              value={systemStatus?.onlineDevices || 0}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Recent Alarms">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text>Loading alarms...</Text>
            </div>
          </div>
        ) : (
          <Table
            columns={alarmColumns}
            dataSource={Array.isArray(alarms) ? alarms : []}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            locale={{
              emptyText: 'No alarms found'
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default MonitoringManagement;