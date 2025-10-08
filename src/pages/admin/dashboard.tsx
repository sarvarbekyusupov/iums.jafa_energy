import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  List,
  Avatar,
  Badge,
  Tag,
  Button,
  Empty,
} from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  MailOutlined,
  ArrowUpOutlined,
  BellOutlined,
  CloudServerOutlined,
} from '@ant-design/icons';
import { authService } from '../../service/auth.service';
import type { UserResponseDto } from '../../types/auth';
import { HopeCloudStatus } from '../../components';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingActivations: 0,
    adminUsers: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const usersData = await authService.getAllUsers();
      setUsers(usersData);

      // Calculate statistics
      const totalUsers = usersData.length;
      const activeUsers = usersData.filter(u => u.isActive && u.emailVerified).length;
      const pendingActivations = usersData.filter(u => !u.emailVerified).length;
      const adminUsers = usersData.filter(u => u.role === 'admin').length;

      setStats({
        totalUsers,
        activeUsers,
        pendingActivations,
        adminUsers,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentUsers = users
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const pendingUsers = users.filter(u => !u.emailVerified).slice(0, 5);

  // Generate real activity from user data
  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now.getTime() - past.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 60) return `${diffInMins} minute${diffInMins !== 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  };

  const activityData = users
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)
    .map(user => ({
      action: user.emailVerified ? 'User registered & verified' : 'User created',
      user: `${user.firstName} ${user.lastName}`,
      time: getTimeAgo(user.createdAt),
      icon: user.emailVerified ? <CheckCircleOutlined /> : <UserOutlined />,
      color: user.emailVerified ? '#52c41a' : '#13c2c2',
    }));

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        {/* Page Header */}
        <div>
          <Title level={3} style={{ margin: 0, marginBottom: 4 }}>Dashboard Overview</Title>
          <Text type="secondary">Welcome back! Here's what's happening with your system today.</Text>
        </div>

        {/* Key Metrics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable style={{ borderLeft: '4px solid #13c2c2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <TeamOutlined style={{ fontSize: '28px', color: '#13c2c2' }} />
                <ArrowUpOutlined style={{ color: '#52c41a', fontSize: '14px' }} />
              </div>
              <Statistic
                title="Total Users"
                value={stats.totalUsers}
                valueStyle={{ color: '#13c2c2', fontSize: '28px', fontWeight: 600 }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card hoverable style={{ borderLeft: '4px solid #52c41a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <CheckCircleOutlined style={{ fontSize: '28px', color: '#52c41a' }} />
                <Text strong style={{ color: '#52c41a' }}>
                  {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                </Text>
              </div>
              <Statistic
                title="Active Users"
                value={stats.activeUsers}
                valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 600 }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card hoverable style={{ borderLeft: '4px solid #fa8c16' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <ClockCircleOutlined style={{ fontSize: '28px', color: '#fa8c16' }} />
                {stats.pendingActivations > 0 && (
                  <Badge count={stats.pendingActivations} style={{ backgroundColor: '#fa8c16' }} />
                )}
              </div>
              <Statistic
                title="Pending Activations"
                value={stats.pendingActivations}
                valueStyle={{ color: '#fa8c16', fontSize: '28px', fontWeight: 600 }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card hoverable style={{ borderLeft: '4px solid #722ed1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <SafetyCertificateOutlined style={{ fontSize: '28px', color: '#722ed1' }} />
                <Text strong style={{ color: '#722ed1' }}>
                  {stats.totalUsers > 0 ? Math.round((stats.adminUsers / stats.totalUsers) * 100) : 0}%
                </Text>
              </div>
              <Statistic
                title="Admin Users"
                value={stats.adminUsers}
                valueStyle={{ color: '#722ed1', fontSize: '28px', fontWeight: 600 }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content Grid */}
        <Row gutter={[16, 16]}>
          {/* Recent Activity */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <BellOutlined style={{ color: '#13c2c2' }} />
                  <span>Recent Activity</span>
                </Space>
              }
              extra={<Button type="link" size="small">View All</Button>}
              style={{ height: '480px' }}
            >
              {activityData.length > 0 ? (
                <List
                  dataSource={activityData}
                  renderItem={(item) => (
                    <List.Item style={{ padding: '12px 0' }}>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            icon={item.icon}
                            style={{ backgroundColor: item.color }}
                          />
                        }
                        title={<Text strong>{item.action}</Text>}
                        description={
                          <Space direction="vertical" size={0}>
                            <Text type="secondary">{item.user}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>{item.time}</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No recent activity"
                />
              )}
            </Card>
          </Col>

          {/* System Status */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <CloudServerOutlined style={{ color: '#13c2c2' }} />
                  <span>System Status</span>
                </Space>
              }
              style={{ height: '480px' }}
            >
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#52c41a' }} />
                    <Text>Authentication Service</Text>
                  </Space>
                  <Tag color="success">Online</Tag>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#52c41a' }} />
                    <Text>Database Connection</Text>
                  </Space>
                  <Tag color="success">Connected</Tag>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#52c41a' }} />
                    <Text>Email Service</Text>
                  </Space>
                  <Tag color="success">Active</Tag>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fa8c16' }} />
                    <Text>Backup Service</Text>
                  </Space>
                  <Tag color="warning">Running</Tag>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Pending Activations */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <MailOutlined style={{ color: '#fa8c16' }} />
                  <span>Pending Activations</span>
                  {stats.pendingActivations > 0 && (
                    <Badge count={stats.pendingActivations} style={{ backgroundColor: '#fa8c16' }} />
                  )}
                </Space>
              }
              style={{ height: '480px' }}
              loading={loading}
            >
              {pendingUsers.length > 0 ? (
                <List
                  dataSource={pendingUsers}
                  renderItem={(user) => (
                    <List.Item
                      extra={
                        <Button size="small" type="link">
                          Resend
                        </Button>
                      }
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#fa8c16' }} />}
                        title={`${user.firstName} ${user.lastName}`}
                        description={user.email}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="All users have activated their accounts!"
                />
              )}
            </Card>
          </Col>
        </Row>

        {/* Recent Users & HopeCloud */}
        <Row gutter={[16, 16]}>
          {/* Recent Users */}
          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <TeamOutlined style={{ color: '#13c2c2' }} />
                  <span>Recent Users</span>
                </Space>
              }
              extra={<Button type="link" href="/admin/users">View All</Button>}
              loading={loading}
            >
              {recentUsers.length > 0 ? (
                <List
                  dataSource={recentUsers}
                  renderItem={(user) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            icon={<UserOutlined />}
                            style={{ backgroundColor: '#13c2c2' }}
                            size="large"
                          />
                        }
                        title={`${user.firstName} ${user.lastName}`}
                        description={
                          <Space direction="vertical" size={4}>
                            <Text type="secondary">{user.email}</Text>
                            <Space size={4}>
                              <Tag color={user.role === 'admin' ? 'red' : 'blue'}>{user.role}</Tag>
                              <Tag color={user.isActive ? 'green' : 'default'}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </Tag>
                              <Tag color={user.emailVerified ? 'cyan' : 'orange'}>
                                {user.emailVerified ? 'Verified' : 'Unverified'}
                              </Tag>
                            </Space>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="No users found" />
              )}
            </Card>
          </Col>

          {/* HopeCloud Integration */}
          <Col xs={24} lg={8}>
            <HopeCloudStatus />
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default Dashboard;
