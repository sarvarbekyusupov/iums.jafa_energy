import React, { useState } from "react";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Typography,
  Space,
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
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../helpers/hooks/useAuth";

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
    if (path.startsWith("/admin/hopecloud")) {
      // If we're on HopeCloud pages, open the HopeCloud submenu
      setOpenKeys(["hopecloud"]);
    } else if (path.startsWith("/admin/fsolar")) {
      // If we're on Fsolar pages, open the Fsolar submenu
      setOpenKeys(["fsolar"]);
    } else {
      // Otherwise, open the General Dashboard
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
      onClick: () => navigate("/admin/profile"),
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

  const sidebarItems: MenuProps["items"] = [
    {
      key: "general-dashboard",
      icon: <AppstoreOutlined />,
      label: "General Dashboard",
      children: [
        {
          key: "/admin",
          icon: <DashboardOutlined />,
          label: "Dashboard",
          onClick: () => navigate("/admin"),
        },
        {
          key: "/admin/sites",
          icon: <HomeOutlined />,
          label: "Sites Management",
          onClick: () => navigate("/admin/sites"),
        },
        {
          key: "/admin/devices",
          icon: <DeviceOutlined />,
          label: "Devices Management",
          onClick: () => navigate("/admin/devices"),
        },
        {
          key: "/admin/fusion-solar",
          icon: <ThunderboltOutlined />,
          label: "FusionSolar",
          onClick: () => navigate("/admin/fusion-solar"),
        },
        {
          key: "/admin/reports",
          icon: <FileTextOutlined />,
          label: "Reports",
          onClick: () => navigate("/admin/reports"),
        },
        {
          key: "/admin/monitoring",
          icon: <MonitorOutlined />,
          label: "Monitoring",
          onClick: () => navigate("/admin/monitoring"),
        },
        {
          key: "/admin/analytics",
          icon: <BarChartOutlined />,
          label: "Analytics",
          onClick: () => navigate("/admin/analytics"),
        },
        {
          key: "/admin/notifications",
          icon: <BellOutlined />,
          label: "Notifications",
          onClick: () => navigate("/admin/notifications"),
        },
        {
          key: "/admin/users",
          icon: <UserOutlined />,
          label: "User Management",
          onClick: () => navigate("/admin/users"),
        },
      ],
    },
    {
      key: "hopecloud",
      icon: <CloudServerOutlined />,
      label: "HopeCloud",
      children: [
        {
          key: "/admin/hopecloud/real-time-data",
          icon: <ThunderboltOutlined />,
          label: "Real Time Data",
          onClick: () => navigate("/admin/hopecloud/real-time-data"),
        },
        {
          key: "/admin/hopecloud/sync-data",
          icon: <DatabaseOutlined />,
          label: "Sync Data",
          onClick: () => navigate("/admin/hopecloud/sync-data"),
        },
      ],
    },
    {
      key: "fsolar",
      icon: <ThunderboltOutlined />,
      label: "Fsolar",
      children: [
        {
          key: "/admin/fsolar/realtime",
          icon: <DashboardOutlined />,
          label: "Real-time Monitor",
          onClick: () => navigate("/admin/fsolar/realtime"),
        },
        {
          key: "/admin/fsolar/devices",
          icon: <DeviceOutlined />,
          label: "Devices",
          onClick: () => navigate("/admin/fsolar/devices"),
        },
        {
          key: "/admin/fsolar/settings",
          icon: <SettingOutlined />,
          label: "Device Settings",
          onClick: () => navigate("/admin/fsolar/settings"),
        },
        {
          key: "/admin/fsolar/energy",
          icon: <BarChartOutlined />,
          label: "Energy Analytics",
          onClick: () => navigate("/admin/fsolar/energy"),
        },
        {
          key: "/admin/fsolar/history",
          icon: <LineChartOutlined />,
          label: "Historical Data",
          onClick: () => navigate("/admin/fsolar/history"),
        },
        {
          key: "/admin/fsolar/templates",
          icon: <FileTextOutlined />,
          label: "Strategy Templates",
          onClick: () => navigate("/admin/fsolar/templates"),
        },
        {
          key: "/admin/fsolar/tasks",
          icon: <AppstoreOutlined />,
          label: "Economic Tasks",
          onClick: () => navigate("/admin/fsolar/tasks"),
        },
        {
          key: "/admin/fsolar/monitor",
          icon: <MonitorOutlined />,
          label: "Task Monitoring",
          onClick: () => navigate("/admin/fsolar/monitor"),
        },
        {
          key: "/admin/fsolar/records",
          icon: <DatabaseOutlined />,
          label: "Run Records",
          onClick: () => navigate("/admin/fsolar/records"),
        },
        {
          key: "/admin/fsolar/alarms",
          icon: <BellOutlined />,
          label: "Device Alarms",
          onClick: () => navigate("/admin/fsolar/alarms"),
        },
      ],
    },
  ];

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
              Welcome, {user?.firstName || "User"} {user?.lastName || ""}
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
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
