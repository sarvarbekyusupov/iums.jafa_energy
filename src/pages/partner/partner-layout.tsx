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
  LineChartOutlined,
  CloudOutlined,
  WifiOutlined,
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

  // Set initial open keys based on current location
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/partner/hopecloud")) {
      setOpenKeys(["hopecloud"]);
    } else if (path.startsWith("/partner/fsolar")) {
      setOpenKeys(["fsolar"]);
    } else if (path.startsWith("/partner/soliscloud")) {
      setOpenKeys(["soliscloud"]);
    } else {
      setOpenKeys(["general-dashboard"]);
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

  // Build sidebar items based on available providers
  const buildSidebarItems = (): MenuProps["items"] => {
    const items: MenuProps["items"] = [
      {
        key: "general-dashboard",
        icon: <AppstoreOutlined />,
        label: "General Dashboard",
        children: [
          {
            key: "/partner",
            icon: <DashboardOutlined />,
            label: "Dashboard",
            onClick: () => navigate("/partner"),
          },
        ],
      },
    ];

    // Add HopeCloud menu if partner has access
    if (availableProviders.includes('hopecloud')) {
      items.push({
        key: "hopecloud",
        icon: <CloudServerOutlined />,
        label: "HopeCloud",
        children: [
          {
            key: "/partner/hopecloud/real-time-data",
            icon: <ThunderboltOutlined />,
            label: "Real Time Data",
            onClick: () => navigate("/partner/hopecloud/real-time-data"),
          },
          {
            key: "/partner/hopecloud/sync-data",
            icon: <DatabaseOutlined />,
            label: "Sync Data",
            onClick: () => navigate("/partner/hopecloud/sync-data"),
          },
        ],
      });
    }

    // Add FSolar menu if partner has access
    if (availableProviders.includes('fsolar')) {
      items.push({
        key: "fsolar",
        icon: <ThunderboltOutlined />,
        label: "Fsolar",
        children: [
          {
            key: "/partner/fsolar/realtime",
            icon: <DashboardOutlined />,
            label: "Real-time Monitor",
            onClick: () => navigate("/partner/fsolar/realtime"),
          },
          {
            key: "/partner/fsolar/devices",
            icon: <DeviceOutlined />,
            label: "Devices",
            onClick: () => navigate("/partner/fsolar/devices"),
          },
          {
            key: "/partner/fsolar/settings",
            icon: <SettingOutlined />,
            label: "Device Settings",
            onClick: () => navigate("/partner/fsolar/settings"),
          },
          {
            key: "/partner/fsolar/energy",
            icon: <BarChartOutlined />,
            label: "Energy Analytics",
            onClick: () => navigate("/partner/fsolar/energy"),
          },
          {
            key: "/partner/fsolar/history",
            icon: <LineChartOutlined />,
            label: "Historical Data",
            onClick: () => navigate("/partner/fsolar/history"),
          },
          {
            key: "/partner/fsolar/templates",
            icon: <FileTextOutlined />,
            label: "Strategy Templates",
            onClick: () => navigate("/partner/fsolar/templates"),
          },
          {
            key: "/partner/fsolar/tasks",
            icon: <AppstoreOutlined />,
            label: "Economic Tasks",
            onClick: () => navigate("/partner/fsolar/tasks"),
          },
          {
            key: "/partner/fsolar/monitor",
            icon: <MonitorOutlined />,
            label: "Task Monitoring",
            onClick: () => navigate("/partner/fsolar/monitor"),
          },
          {
            key: "/partner/fsolar/records",
            icon: <DatabaseOutlined />,
            label: "Run Records",
            onClick: () => navigate("/partner/fsolar/records"),
          },
          {
            key: "/partner/fsolar/alarms",
            icon: <BellOutlined />,
            label: "Device Alarms",
            onClick: () => navigate("/partner/fsolar/alarms"),
          },
        ],
      });
    }

    // Add SolisCloud menu if partner has access
    if (availableProviders.includes('soliscloud')) {
      items.push({
        key: "soliscloud",
        icon: <CloudServerOutlined />,
        label: "SolisCloud",
        children: [
          {
            key: "/partner/soliscloud/dashboard",
            icon: <DashboardOutlined />,
            label: "Dashboard",
            onClick: () => navigate("/partner/soliscloud/dashboard"),
          },
          {
            key: "/partner/soliscloud/stations",
            icon: <HomeOutlined />,
            label: "Stations",
            onClick: () => navigate("/partner/soliscloud/stations"),
          },
          {
            key: "/partner/soliscloud/inverters",
            icon: <ThunderboltOutlined />,
            label: "Inverters",
            onClick: () => navigate("/partner/soliscloud/inverters"),
          },
          {
            key: "/partner/soliscloud/alarms",
            icon: <BellOutlined />,
            label: "Alarms",
            onClick: () => navigate("/partner/soliscloud/alarms"),
          },
          {
            key: "/partner/soliscloud/collectors",
            icon: <WifiOutlined />,
            label: "Collectors",
            onClick: () => navigate("/partner/soliscloud/collectors"),
          },
          {
            key: "/partner/soliscloud/epm",
            icon: <LineChartOutlined />,
            label: "EPM",
            onClick: () => navigate("/partner/soliscloud/epm"),
          },
          {
            key: "/partner/soliscloud/weather",
            icon: <CloudOutlined />,
            label: "Weather",
            onClick: () => navigate("/partner/soliscloud/weather"),
          },
        ],
      });
    }

    return items;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(to bottom right, rgb(236, 253, 245), rgb(240, 253, 244), rgb(240, 253, 250))',
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
        background: "transparent",
      }}
    >
      {/* Green energy background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "linear-gradient(to bottom right, rgb(236, 253, 245), rgb(240, 253, 244), rgb(240, 253, 250))",
          zIndex: 0,
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: "5rem",
            left: "2.5rem",
            width: "18rem",
            height: "18rem",
            background: "rgba(134, 239, 172, 0.3)",
            borderRadius: "9999px",
            mixBlendMode: "multiply",
            filter: "blur(48px)",
            animation: "blob 7s infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "10rem",
            right: "2.5rem",
            width: "18rem",
            height: "18rem",
            background: "rgba(167, 243, 208, 0.3)",
            borderRadius: "9999px",
            mixBlendMode: "multiply",
            filter: "blur(48px)",
            animation: "blob 7s infinite",
            animationDelay: "2s",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-2rem",
            left: "50%",
            width: "18rem",
            height: "18rem",
            background: "rgba(153, 246, 228, 0.3)",
            borderRadius: "9999px",
            mixBlendMode: "multiply",
            filter: "blur(48px)",
            animation: "blob 7s infinite",
            animationDelay: "4s",
          }}
        />
        {/* Subtle grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(128, 128, 128, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(128, 128, 128, 0.03) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

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
          items={buildSidebarItems()}
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
