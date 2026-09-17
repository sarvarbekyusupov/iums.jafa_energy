import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Drawer,
  Dropdown,
  Layout,
  Menu,
  Space,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import {
  CloseOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../helpers/hooks/useAuth";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MOBILE_BREAKPOINT = 768;

interface AppShellProps {
  /** Sidebar menu. Child keys are route paths; the shell opens whichever group matches. */
  items: MenuProps["items"];
  /** Where "Profile Settings" goes, which differs per role. */
  profilePath: string;
  /** Shown in the header when the account has no first name yet. */
  fallbackName: string;
}

/** Top-level keys of the group whose child best matches the current path. */
function openKeysFor(items: MenuProps["items"], pathname: string): string[] {
  let bestKey: string | null = null;
  let bestLength = -1;

  for (const item of items ?? []) {
    const group = item as { key?: string; children?: { key?: string }[] };
    if (!group?.key || !group.children) continue;
    for (const child of group.children) {
      const key = child?.key;
      if (typeof key !== "string") continue;
      // Exact match wins; otherwise the longest prefix, so /soliscloud/stations/7
      // still opens the SolisCloud group.
      const matches = pathname === key || pathname.startsWith(key + "/");
      if (matches && key.length > bestLength) {
        bestLength = key.length;
        bestKey = group.key;
      }
    }
  }
  const first = (items?.[0] as { key?: string })?.key;
  return bestKey ? [bestKey] : typeof first === "string" ? [first] : [];
}

/**
 * The frame every signed-in page sits in: sidebar, header, content.
 *
 * There used to be three of these — one per role — at about 1000 lines between them, the same
 * markup copied with a different menu pasted in. They had already drifted: only the customer's
 * had the mobile drawer, so an admin on a phone got a sidebar that could not be opened. Each
 * also carried its own hand-written rule for which submenu to expand. The roles differ in their
 * menu and nothing else, so that is all they pass in now.
 */
const AppShell: React.FC<AppShellProps> = ({ items, profilePath, fallbackName }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT,
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Following a link should close the drawer, not leave it covering the page.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const derivedOpenKeys = useMemo(
    () => openKeysFor(items, location.pathname),
    [items, location.pathname],
  );
  const [openKeys, setOpenKeys] = useState<string[]>(derivedOpenKeys);
  useEffect(() => setOpenKeys(derivedOpenKeys), [derivedOpenKeys]);

  // The drawer mounts its menu only when it opens, so the group for the current page has to be
  // expanded again at that moment; otherwise it appears with everything collapsed.
  useEffect(() => {
    if (mobileMenuOpen) setOpenKeys(derivedOpenKeys);
  }, [mobileMenuOpen, derivedOpenKeys]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <SettingOutlined />,
      label: "Profile Settings",
      onClick: () => navigate(profilePath),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  const brandCollapsed = collapsed && !isMobile;

  const sidebar = (
    <>
      <div
        style={{
          height: 64,
          margin: "20px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 700,
          fontSize: brandCollapsed ? "24px" : "22px",
          letterSpacing: "1.5px",
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
        }}
      >
        {brandCollapsed ? "JE" : "JAFA ENERGY"}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        openKeys={openKeys}
        onOpenChange={setOpenKeys}
        // Closing on navigation alone is not enough: tapping the page you are already on
        // leaves the path unchanged, and the drawer would stay over the content.
        onClick={() => setMobileMenuOpen(false)}
        items={items}
      />
    </>
  );

  return (
    <Layout style={{ minHeight: "100vh", position: "relative" }}>
      {isMobile ? (
        <Drawer
          placement="left"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          width={280}
          closable={false}
          styles={{
            body: {
              padding: 0,
              background:
                "linear-gradient(180deg, rgba(6, 78, 59, 0.98) 0%, rgba(4, 47, 46, 0.98) 100%)",
            },
            header: { display: "none" },
          }}
        >
          <div style={{ position: "relative" }}>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setMobileMenuOpen(false)}
              style={{ position: "absolute", top: 16, right: 16, color: "#fff", zIndex: 10 }}
            />
            {sidebar}
          </div>
        </Drawer>
      ) : (
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
          {sidebar}
        </Sider>
      )}

      <Layout style={{ position: "relative", zIndex: 1, background: "transparent" }}>
        <Header
          style={{
            padding: isMobile ? "0 12px" : "0 16px",
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            borderBottom: "1px solid rgba(16, 185, 129, 0.1)",
            height: isMobile ? 56 : 64,
          }}
        >
          <Button
            type="text"
            icon={
              isMobile || collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
            }
            onClick={() =>
              isMobile ? setMobileMenuOpen(true) : setCollapsed(!collapsed)
            }
            style={{
              fontSize: "16px",
              width: isMobile ? 48 : 64,
              height: isMobile ? 48 : 64,
            }}
          />
          <Space size={isMobile ? "small" : "middle"}>
            {!isMobile && (
              <Text style={{ fontWeight: 500, color: "#047857" }}>
                Welcome, {user?.firstName || fallbackName} {user?.lastName || ""}
              </Text>
            )}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={["click"]}>
              <Avatar
                size={isMobile ? "small" : "default"}
                style={{
                  cursor: "pointer",
                  backgroundColor: "#10b981",
                  border: "2px solid rgba(16, 185, 129, 0.3)",
                  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
                }}
                icon={<UserOutlined />}
              />
            </Dropdown>
            {!isMobile && (
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
            )}
          </Space>
        </Header>
        <Content
          style={{
            margin: isMobile ? "8px" : "16px",
            padding: 0,
            minHeight: 280,
            background: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(12px)",
            borderRadius: isMobile ? 8 : 12,
            overflow: "auto",
            border: "1px solid rgba(16, 185, 129, 0.1)",
          }}
        >
          <div style={{ padding: isMobile ? "12px" : "24px" }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppShell;
