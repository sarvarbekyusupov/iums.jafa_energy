import React from "react";
import type { MenuProps } from "antd";
import {
  AppstoreOutlined,
  BarChartOutlined,
  BellOutlined,
  CloudOutlined,
  CloudServerOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  HomeOutlined,
  LineChartOutlined,
  MonitorOutlined,
  SettingOutlined,
  SettingOutlined as DeviceOutlined,
  ThunderboltOutlined,
  UserOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/layout/AppShell";

/** Only the menu differs between roles; the frame itself lives in AppShell. */
const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

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
        // Hidden - Not yet implemented
        // {
        //   key: "/admin/sites",
        //   icon: <HomeOutlined />,
        //   label: "Sites Management",
        //   onClick: () => navigate("/admin/sites"),
        // },
        // {
        //   key: "/admin/devices",
        //   icon: <DeviceOutlined />,
        //   label: "Devices Management",
        //   onClick: () => navigate("/admin/devices"),
        // },
        // {
        //   key: "/admin/fusion-solar",
        //   icon: <ThunderboltOutlined />,
        //   label: "FusionSolar",
        //   onClick: () => navigate("/admin/fusion-solar"),
        // },
        // {
        //   key: "/admin/reports",
        //   icon: <FileTextOutlined />,
        //   label: "Reports",
        //   onClick: () => navigate("/admin/reports"),
        // },
        // {
        //   key: "/admin/monitoring",
        //   icon: <MonitorOutlined />,
        //   label: "Monitoring",
        //   onClick: () => navigate("/admin/monitoring"),
        // },
        // {
        //   key: "/admin/analytics",
        //   icon: <BarChartOutlined />,
        //   label: "Analytics",
        //   onClick: () => navigate("/admin/analytics"),
        // },
        // {
        //   key: "/admin/notifications",
        //   icon: <BellOutlined />,
        //   label: "Notifications",
        //   onClick: () => navigate("/admin/notifications"),
        // },
        {
          key: "/admin/users",
          icon: <UserOutlined />,
          label: "User Management",
          onClick: () => navigate("/admin/users"),
        },
        {
          key: "/admin/user-stations",
          icon: <ThunderboltOutlined />,
          label: "Station Assignment",
          onClick: () => navigate("/admin/user-stations"),
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
    {
      key: "soliscloud",
      icon: <CloudServerOutlined />,
      label: "SolisCloud",
      children: [
        {
          key: "/admin/soliscloud/dashboard",
          icon: <DashboardOutlined />,
          label: "Dashboard",
          onClick: () => navigate("/admin/soliscloud/dashboard"),
        },
        {
          key: "/admin/soliscloud/stations",
          icon: <HomeOutlined />,
          label: "Stations",
          onClick: () => navigate("/admin/soliscloud/stations"),
        },
        {
          key: "/admin/soliscloud/inverters",
          icon: <ThunderboltOutlined />,
          label: "Inverters",
          onClick: () => navigate("/admin/soliscloud/inverters"),
        },
        {
          key: "/admin/soliscloud/alarms",
          icon: <BellOutlined />,
          label: "Alarms",
          onClick: () => navigate("/admin/soliscloud/alarms"),
        },
        {
          key: "/admin/soliscloud/collectors",
          icon: <WifiOutlined />,
          label: "Collectors",
          onClick: () => navigate("/admin/soliscloud/collectors"),
        },
        {
          key: "/admin/soliscloud/epm",
          icon: <LineChartOutlined />,
          label: "EPM",
          onClick: () => navigate("/admin/soliscloud/epm"),
        },
        {
          key: "/admin/soliscloud/weather",
          icon: <CloudOutlined />,
          label: "Weather",
          onClick: () => navigate("/admin/soliscloud/weather"),
        },
        {
          key: "/admin/soliscloud/api-test",
          icon: <SettingOutlined />,
          label: "API Test",
          onClick: () => navigate("/admin/soliscloud/api-test"),
        },
      ],
    },
  ];

  return (
    <AppShell
      items={sidebarItems}
      profilePath="/admin/profile"
      fallbackName="Admin"
    />
  );
};

export default AdminLayout;
