import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Typography,
  Space,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  CloudServerOutlined,
  HomeOutlined,
  FileTextOutlined,
  MonitorOutlined,
  BarChartOutlined,
  BellOutlined,
  ThunderboltOutlined,
  SettingOutlined as DeviceOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  

  // Set initial open keys based on current location
  React.useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/admin/hopecloud')) {
      // If we're on HopeCloud pages, open the HopeCloud submenu
      setOpenKeys(['hopecloud']);
    } else {
      // Otherwise, open the General Dashboard
      setOpenKeys(['general-dashboard']);
    }
  }, [location.pathname]);

  const getSelectedKeys = () => {
    return [location.pathname];
  };

  const handleMenuOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: 'Profile Settings',
      onClick: () => navigate('/admin/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  const sidebarItems: MenuProps['items'] = [
    {
      key: 'general-dashboard',
      icon: <AppstoreOutlined />,
      label: 'General Dashboard',
      children: [
        {
          key: '/admin',
          icon: <DashboardOutlined />,
          label: 'Dashboard',
          onClick: () => navigate('/admin'),
        },
        {
          key: '/admin/sites',
          icon: <HomeOutlined />,
          label: 'Sites Management',
          onClick: () => navigate('/admin/sites'),
        },
        {
          key: '/admin/devices',
          icon: <DeviceOutlined />,
          label: 'Devices Management',
          onClick: () => navigate('/admin/devices'),
        },
        {
          key: '/admin/fusion-solar',
          icon: <ThunderboltOutlined />,
          label: 'FusionSolar',
          onClick: () => navigate('/admin/fusion-solar'),
        },
        {
          key: '/admin/reports',
          icon: <FileTextOutlined />,
          label: 'Reports',
          onClick: () => navigate('/admin/reports'),
        },
        {
          key: '/admin/monitoring',
          icon: <MonitorOutlined />,
          label: 'Monitoring',
          onClick: () => navigate('/admin/monitoring'),
        },
        {
          key: '/admin/analytics',
          icon: <BarChartOutlined />,
          label: 'Analytics',
          onClick: () => navigate('/admin/analytics'),
        },
        {
          key: '/admin/notifications',
          icon: <BellOutlined />,
          label: 'Notifications',
          onClick: () => navigate('/admin/notifications'),
        },
        {
          key: '/admin/users',
          icon: <UserOutlined />,
          label: 'User Management',
          onClick: () => navigate('/admin/users'),
        },
      ],
    },
    {
      key: 'hopecloud',
      icon: <CloudServerOutlined />,
      label: 'HopeCloud',
      children: [
        {
          key: '/admin/hopecloud/real-time-data',
          icon: <ThunderboltOutlined />,
          label: 'Real Time Data',
          onClick: () => navigate('/admin/hopecloud/real-time-data'),
        },
        {
          key: '/admin/hopecloud/sync-data',
          icon: <DatabaseOutlined />,
          label: 'Sync Data',
          onClick: () => navigate('/admin/hopecloud/sync-data'),
        },
      ],
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={260}>
        <div style={{
          height: 40,
          margin: 16,
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '18px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          {collapsed ? 'JI' : 'JAFA IUMS'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          openKeys={openKeys}
          onOpenChange={handleMenuOpenChange}
          items={sidebarItems}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 16px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <Space>
            <Text>Welcome, {user?.firstName || 'User'} {user?.lastName || ''}</Text>
            <Dropdown 
              menu={{ items: userMenuItems }} 
              placement="bottomRight"
              trigger={['click']}
            >
              <Avatar
                style={{ 
                  cursor: 'pointer',
                  backgroundColor: '#1890ff',
                  border: '2px solid #fff'
                }}
                icon={<UserOutlined />}
              />
            </Dropdown>
            <Button 
              onClick={handleLogout}
              title="Logout"
              style={{
                backgroundColor: '#1890ff',
                borderColor: '#1890ff',
                color: '#fff',
                borderRadius: '8px',
              }}
            >
              Logout
            </Button>
          </Space>
        </Header>
        <Content
          style={{
            margin: '16px',
            padding: 0,
            minHeight: 280,
            background: '#f5f5f5',
            borderRadius: 8,
            overflow: 'auto',
          }}
        >
          <div style={{ padding: '24px' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;