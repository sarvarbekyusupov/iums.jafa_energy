import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Typography,
  Space,
  Spin,
} from "antd";
import type { MenuProps } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ThunderboltOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../helpers/hooks/useAuth";
import { userStationsService } from "../../service/user-stations.service";
import type { UserStationResponse } from "../../service/user-stations.service";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

type ProviderType = 'hopecloud' | 'soliscloud' | 'fsolar';

const PartnerLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [availableProviders, setAvailableProviders] = useState<ProviderType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user's assigned stations to determine available providers
  useEffect(() => {
    const fetchUserProviders = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const stations = await userStationsService.getUserStations(user.id);
        // Extract unique providers from assigned stations
        const providers = [...new Set(stations.map((s: UserStationResponse) => s.provider.toLowerCase() as ProviderType))];
        setAvailableProviders(providers);
      } catch (error) {
        console.error('Failed to fetch user stations:', error);
        setAvailableProviders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProviders();
  }, [user?.id]);

  // Only one submenu is left, so it is always the open one.
  useEffect(() => {
    setOpenKeys(["my-solar"]);
  }, [location.pathname]);

  const getSelectedKeys = () => {
    return [location.pathname];
  };

  const handleMenuOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <SettingOutlined />,
      label: "Profile Settings",
      onClick: () => navigate("/partner/profile"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  // A partner sees the stations assigned to them, the same way a customer does.
  // The vendor consoles are operator tools and now answer only to an admin.
  const sidebarItems: MenuProps["items"] = [
    {
      key: "my-solar",
      icon: <AppstoreOutlined />,
      label: "My Solar System",
      children: [
        {
          key: "/partner",
          icon: <DashboardOutlined />,
          label: "Dashboard",
          onClick: () => navigate("/partner"),
        },
        {
          key: "/partner/inverters",
          icon: <ThunderboltOutlined />,
          label: "My Inverters",
          onClick: () => navigate("/partner/inverters"),
        },
      ],
    },
  ];

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}>
        <Spin size="large" tip="Loading partner data..." />
      </div>
    );
  }

  return (
    <Layout
      style={{
        minHeight: "100vh",
        position: "relative",
      }}
    >

      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        style={{
          position: "relative",
          zIndex: 10,
          background:
            "linear-gradient(180deg, rgba(6, 78, 59, 0.95) 0%, rgba(4, 47, 46, 0.95) 100%)",
          backdropFilter: "blur(10px)",
          boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            height: 64,
            margin: "20px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: "700",
            fontSize: collapsed ? "24px" : "22px",
            letterSpacing: "1.5px",
            fontFamily:
              "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          {collapsed ? "JE" : "JAFA ENERGY"}
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
      <Layout
        style={{ position: "relative", zIndex: 1, background: "transparent" }}
      >
        <Header
          style={{
            padding: "0 16px",
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            borderBottom: "1px solid rgba(16, 185, 129, 0.1)",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
          <Space>
            <Text style={{ fontWeight: 500, color: "#047857" }}>
              Welcome, {user?.firstName || "Partner"} {user?.lastName || ""}
            </Text>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Avatar
                style={{
                  cursor: "pointer",
                  backgroundColor: "#10b981",
                  border: "2px solid rgba(16, 185, 129, 0.3)",
                  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
                }}
                icon={<UserOutlined />}
              />
            </Dropdown>
            <Button
              onClick={handleLogout}
              title="Logout"
              style={{
                backgroundColor: "#10b981",
                borderColor: "#10b981",
                color: "#fff",
                borderRadius: "8px",
                fontWeight: 500,
                boxShadow: "0 2px 6px rgba(16, 185, 129, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#059669";
                e.currentTarget.style.borderColor = "#059669";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#10b981";
                e.currentTarget.style.borderColor = "#10b981";
              }}
            >
              Logout
            </Button>
          </Space>
        </Header>
        <Content
          style={{
            margin: "16px",
            padding: 0,
            minHeight: 280,
            background: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(12px)",
            borderRadius: 12,
            overflow: "auto",
            border: "1px solid rgba(16, 185, 129, 0.1)",
          }}
        >
          <div style={{ padding: "24px" }}>
            <Outlet context={{ availableProviders }} />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PartnerLayout;
