import React from "react";
import type { MenuProps } from "antd";
import {
  AppstoreOutlined,
  DashboardOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/layout/AppShell";

/** Only the menu differs between roles; the frame itself lives in AppShell. */
const PartnerLayout: React.FC = () => {
  const navigate = useNavigate();

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

  return (
    <AppShell
      items={sidebarItems}
      profilePath="/partner/profile"
      fallbackName="Partner"
    />
  );
};

export default PartnerLayout;
