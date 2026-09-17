import React from "react";
import type { MenuProps } from "antd";
import {
  DashboardOutlined,
  SunOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/layout/AppShell";

/** Only the menu differs between roles; the frame itself lives in AppShell. */
const UserLayout: React.FC = () => {
  const navigate = useNavigate();

  const sidebarItems: MenuProps["items"] = [
    {
      key: "my-solar",
      icon: <SunOutlined />,
      label: "My Solar System",
      children: [
        {
          key: "/user",
          icon: <DashboardOutlined />,
          label: "Dashboard",
          onClick: () => navigate("/user"),
        },
        {
          key: "/user/inverters",
          icon: <ThunderboltOutlined />,
          label: "My Inverters",
          onClick: () => navigate("/user/inverters"),
        },
      ],
    },
  ];

  return (
    <AppShell
      items={sidebarItems}
      profilePath="/user/profile"
      fallbackName="User"
    />
  );
};

export default UserLayout;
