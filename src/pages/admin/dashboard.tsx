import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  Progress,
  List,
  Avatar,
  Badge,
  Timeline,
  Alert,
  Button,
  Divider,
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
  EyeOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { authService } from '../../service/auth.service';
import type { UserResponseDto } from '../../types/auth';
import { HopeCloudStatus } from '../../components';
import '../../styles/dashboard.css';

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
      const activeUsers = usersData.filter(u => u.isActive).length;
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

  const pendingUsers = users.filter(u => !u.emailVerified).slice(0, 3);

  const activityData = [
    {
      action: 'User created',
      user: 'John Doe',
      time: '2 minutes ago',
      type: 'success',
    },
    {
      action: 'Password reset',
      user: 'Jane Smith',
      time: '1 hour ago',
      type: 'warning',
    },
    {
      action: 'Account activated',
      user: 'Bob Wilson',
      time: '3 hours ago',
      type: 'success',
    },
    {
      action: 'User deactivated',
      user: 'Alice Brown',
      time: '1 day ago',
      type: 'error',
    },
  ];

  return (
    <div className="premium-dashboard" style={{ padding: '0', margin: '-24px', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ padding: '32px 24px' }}>
        <Space direction="vertical" size={32} style={{ width: '100%' }}>

          {/* Premium Key Metrics */}
          <Row gutter={[24, 24]} className="floating-element">
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card-premium glass-card">
                <div style={{ padding: '24px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <TeamOutlined style={{ fontSize: '32px', color: '#6366f1' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowUpOutlined style={{ color: '#10b981', fontSize: '12px' }} />
                      <span style={{ color: '#10b981', fontSize: '14px', fontWeight: 600 }}>12%</span>
                    </div>
                  </div>
                  <Statistic
                    title={<span style={{ color: 'rgba(0,0,0,0.6)', fontSize: '14px', fontWeight: 500 }}>Total Users</span>}
                    value={stats.totalUsers}
                    valueStyle={{ color: '#6366f1', fontSize: '36px', fontWeight: 700, lineHeight: 1 }}
                  />
                  <div style={{ marginTop: '12px', fontSize: '13px', color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>
                    +2 new this week
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card-premium glass-card">
                <div style={{ padding: '24px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <CheckCircleOutlined style={{ fontSize: '32px', color: '#10b981' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: '#10b981', fontSize: '14px', fontWeight: 600 }}>
                        {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <Statistic
                    title={<span style={{ color: 'rgba(0,0,0,0.6)', fontSize: '14px', fontWeight: 500 }}>Active Users</span>}
                    value={stats.activeUsers}
                    valueStyle={{ color: '#10b981', fontSize: '36px', fontWeight: 700, lineHeight: 1 }}
                  />
                  <div className="premium-progress" style={{ marginTop: '12px' }}>
                    <Progress 
                      percent={stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0} 
                      showInfo={false} 
                      size="small"
                      strokeColor={{
                        '0%': '#10b981',
                        '100%': '#06b6d4',
                      }}
                    />
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card-premium glass-card">
                <div style={{ padding: '24px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <ClockCircleOutlined style={{ fontSize: '32px', color: '#f59e0b' }} />
                    {stats.pendingActivations > 0 && (
                      <Badge 
                        count={stats.pendingActivations} 
                        style={{ 
                          backgroundColor: '#f59e0b', 
                          fontWeight: 600,
                          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                        }} 
                      />
                    )}
                  </div>
                  <Statistic
                    title={<span style={{ color: 'rgba(0,0,0,0.6)', fontSize: '14px', fontWeight: 500 }}>Pending Activations</span>}
                    value={stats.pendingActivations}
                    valueStyle={{ color: '#f59e0b', fontSize: '36px', fontWeight: 700, lineHeight: 1 }}
                  />
                  <div style={{ marginTop: '12px', fontSize: '13px', color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>
                    {stats.pendingActivations > 0 ? 'Needs attention' : '✨ All caught up!'}
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card-premium glass-card">
                <div style={{ padding: '24px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <SafetyCertificateOutlined style={{ fontSize: '32px', color: '#ec4899' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: '#ec4899', fontSize: '14px', fontWeight: 600 }}>
                        {Math.round((stats.adminUsers / Math.max(stats.totalUsers, 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                  <Statistic
                    title={<span style={{ color: 'rgba(0,0,0,0.6)', fontSize: '14px', fontWeight: 500 }}>Admin Users</span>}
                    value={stats.adminUsers}
                    valueStyle={{ color: '#ec4899', fontSize: '36px', fontWeight: 700, lineHeight: 1 }}
                  />
                  <div style={{ marginTop: '12px', fontSize: '13px', color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>
                    of total users
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Premium Content Grid */}
          <Row gutter={[24, 24]}>
            {/* Recent Activity Premium */}
            <Col xs={24} lg={12}>
              <Card 
                className="glass-card"
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      padding: '8px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <BellOutlined style={{ color: 'white', fontSize: '16px' }} />
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: 600, color: 'rgba(0,0,0,0.8)' }}>Recent Activity</span>
                  </div>
                }
                extra={
                  <Button 
                    className="premium-btn"
                    type="text" 
                    icon={<EyeOutlined />}
                    style={{ 
                      borderRadius: '12px',
                      fontWeight: 500,
                      color: '#667eea'
                    }}
                  >
                    View All
                  </Button>
                }
                style={{ height: '400px' }}
              >
                {activityData.length > 0 ? (
                  <Timeline 
                    className="premium-timeline"
                    items={activityData.map((activity, index) => ({
                      key: index,
                      dot: (
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: activity.type === 'success' ? 
                            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' :
                            activity.type === 'warning' ? 
                            'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' :
                            'linear-gradient(135deg, #ff6b6b 0%, #ffa8a8 100%)',
                          boxShadow: `0 4px 15px ${
                            activity.type === 'success' ? 'rgba(79, 172, 254, 0.3)' :
                            activity.type === 'warning' ? 'rgba(255, 154, 158, 0.3)' :
                            'rgba(255, 107, 107, 0.3)'
                          }`
                        }}
                        />
                      ),
                      children: (
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          padding: '8px 0'
                        }}>
                          <div>
                            <Text strong style={{ fontSize: '14px', color: 'rgba(0,0,0,0.8)' }}>
                              {activity.action}
                            </Text>
                            <br />
                            <Text style={{ fontSize: '13px', color: 'rgba(0,0,0,0.5)' }}>
                              {activity.user}
                            </Text>
                          </div>
                          <span className="premium-badge" style={{ 
                            fontSize: '11px', 
                            color: 'rgba(0,0,0,0.5)',
                            background: 'rgba(0,0,0,0.05)',
                            border: 'none'
                          }}>
                            {activity.time}
                          </span>
                        </div>
                      )
                    }))}
                  />
                ) : (
                  <Empty description="No recent activity" />
                )}
              </Card>
            </Col>

            {/* System Status Premium */}
            <Col xs={24} lg={12}>
              <Card 
                className="glass-card"
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      padding: '8px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <SafetyCertificateOutlined style={{ color: 'white', fontSize: '16px' }} />
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: 600, color: 'rgba(0,0,0,0.8)' }}>System Status</span>
                  </div>
                }
                style={{ height: '400px' }}
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        boxShadow: '0 2px 8px rgba(79, 172, 254, 0.4)'
                      }} />
                      <Text style={{ fontSize: '14px', fontWeight: 500 }}>Authentication Service</Text>
                    </div>
                    <span className="status-online-premium">Online</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        boxShadow: '0 2px 8px rgba(79, 172, 254, 0.4)'
                      }} />
                      <Text style={{ fontSize: '14px', fontWeight: 500 }}>Database Connection</Text>
                    </div>
                    <span className="status-online-premium">Connected</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        boxShadow: '0 2px 8px rgba(79, 172, 254, 0.4)'
                      }} />
                      <Text style={{ fontSize: '14px', fontWeight: 500 }}>Email Service</Text>
                    </div>
                    <span className="status-online-premium">Active</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                        boxShadow: '0 2px 8px rgba(255, 154, 158, 0.4)'
                      }} />
                      <Text style={{ fontSize: '14px', fontWeight: 500 }}>Backup Service</Text>
                    </div>
                    <span className="status-warning-premium">Running</span>
                  </div>
                  
                  <Divider style={{ margin: '16px 0', opacity: 0.3 }} />
                  
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <Text style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(0,0,0,0.6)' }}>Server Health</Text>
                      <Text style={{ fontSize: '14px', fontWeight: 600, color: '#4facfe' }}>95%</Text>
                    </div>
                    <Progress 
                      percent={95} 
                      showInfo={false} 
                      size="small"
                      strokeColor={{
                        '0%': '#10b981',
                        '100%': '#06b6d4',
                      }}
                      trailColor="rgba(0,0,0,0.1)"
                    />
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <Text style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(0,0,0,0.6)' }}>Memory Usage</Text>
                      <Text style={{ fontSize: '14px', fontWeight: 600, color: '#667eea' }}>68%</Text>
                    </div>
                    <Progress 
                      percent={68} 
                      showInfo={false} 
                      size="small"
                      strokeColor={{
                        '0%': '#667eea',
                        '100%': '#764ba2',
                      }}
                      trailColor="rgba(0,0,0,0.1)"
                    />
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Bottom Row Premium */}
          <Row gutter={[24, 24]}>
            {/* Recent Users Premium */}
            <Col xs={24} lg={12}>
              <Card 
                className="glass-card"
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                      padding: '8px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <TeamOutlined style={{ color: 'white', fontSize: '16px' }} />
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: 600, color: 'rgba(0,0,0,0.8)' }}>Recent Users</span>
                  </div>
                }
                extra={
                  <Button 
                    className="premium-btn"
                    type="text" 
                    href="/admin/users"
                    style={{ 
                      borderRadius: '12px',
                      fontWeight: 500,
                      color: '#667eea'
                    }}
                  >
                    View All
                  </Button>
                }
                loading={loading}
                style={{ height: '420px' }}
              >
                {recentUsers.length > 0 ? (
                  <List
                    dataSource={recentUsers}
                    renderItem={(user) => (
                      <List.Item style={{ 
                        padding: '16px 0', 
                        borderBottom: '1px solid rgba(0,0,0,0.06)',
                        transition: 'all 0.3s ease'
                      }}>
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              icon={<UserOutlined />} 
                              style={{ 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                              }}
                              size="large"
                            />
                          }
                          title={
                            <Text strong style={{ fontSize: '15px', color: 'rgba(0,0,0,0.8)' }}>
                              {user.firstName} {user.lastName}
                            </Text>
                          }
                          description={
                            <Space direction="vertical" size="small">
                              <Text style={{ fontSize: '13px', color: 'rgba(0,0,0,0.5)' }}>
                                {user.email}
                              </Text>
                              <Space>
                                <span className={`premium-badge ${user.role === 'admin' ? 'badge-error' : 'badge-success'}`}>
                                  {user.role}
                                </span>
                                {user.isActive && (
                                  <span className="premium-badge badge-success">Active</span>
                                )}
                                {!user.emailVerified && (
                                  <span className="premium-badge badge-warning">Pending</span>
                                )}
                              </Space>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div className="premium-loading">
                    <Empty description="No users found" />
                  </div>
                )}
              </Card>
            </Col>

            {/* Pending Activations Premium */}
            <Col xs={24} lg={12}>
              <Card 
                className="glass-card"
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                      padding: '8px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      <MailOutlined style={{ color: 'white', fontSize: '16px' }} />
                      {stats.pendingActivations > 0 && (
                        <Badge 
                          count={stats.pendingActivations} 
                          style={{ 
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            backgroundColor: '#ff6b6b',
                            boxShadow: '0 2px 8px rgba(255, 107, 107, 0.4)'
                          }} 
                        />
                      )}
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: 600, color: 'rgba(0,0,0,0.8)' }}>
                      Pending Activations
                    </span>
                  </div>
                }
                loading={loading}
                style={{ height: '420px' }}
              >
                {pendingUsers.length > 0 ? (
                  <div>
                    <Alert
                      message={`${stats.pendingActivations} users haven't activated their accounts yet`}
                      type="warning"
                      showIcon
                      style={{ 
                        marginBottom: 20,
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, rgba(255, 154, 158, 0.1) 0%, rgba(254, 207, 239, 0.1) 100%)'
                      }}
                    />
                    <List
                      dataSource={pendingUsers}
                      renderItem={(user) => (
                        <List.Item
                          style={{ 
                            padding: '16px 0', 
                            borderBottom: '1px solid rgba(0,0,0,0.06)'
                          }}
                          actions={[
                            <Button 
                              className="premium-btn"
                              type="text" 
                              size="small"
                              style={{ 
                                borderRadius: '8px',
                                fontWeight: 500,
                                color: '#ff9a9e'
                              }}
                            >
                              Resend Email
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar 
                                icon={<UserOutlined />} 
                                style={{ 
                                  background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                                  border: 'none',
                                  boxShadow: '0 4px 15px rgba(255, 154, 158, 0.3)'
                                }}
                                size="large"
                              />
                            }
                            title={
                              <Text strong style={{ fontSize: '15px', color: 'rgba(0,0,0,0.8)' }}>
                                {user.firstName} {user.lastName}
                              </Text>
                            }
                            description={
                              <Text style={{ fontSize: '13px', color: 'rgba(0,0,0,0.5)' }}>
                                {user.email}
                              </Text>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '20px',
                      boxShadow: '0 10px 30px rgba(79, 172, 254, 0.3)'
                    }}>
                      <CheckCircleOutlined style={{ fontSize: '40px', color: 'white' }} />
                    </div>
                    <Title level={4} style={{ color: 'rgba(0,0,0,0.8)', margin: 0 }}>
                      All Caught Up! ✨
                    </Title>
                    <Text style={{ color: 'rgba(0,0,0,0.5)', marginTop: '8px' }}>
                      All users have activated their accounts
                    </Text>
                  </div>
                )}
              </Card>
            </Col>
          </Row>

          {/* HopeCloud Integration Status */}
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={8}>
              <HopeCloudStatus />
            </Col>
          </Row>
        </Space>
      </div>
    </div>
  );
};

export default Dashboard;