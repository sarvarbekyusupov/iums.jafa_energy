import { Navigate } from "react-router-dom";
import { useAuth } from "../../helpers/hooks/useAuth";
import { Spin } from "antd";

interface RoleProtectProps {
  children: React.ReactNode;
  allowedRoles: Array<'super_admin' | 'admin' | 'operator' | 'user'>;
}

const RoleProtect = ({ children, allowedRoles }: RoleProtectProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    // User doesn't have required role - redirect to monitor page
    return <Navigate to="/monitor" replace />;
  }

  return <>{children}</>;
};

export default RoleProtect;
