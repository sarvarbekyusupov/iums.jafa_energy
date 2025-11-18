import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../helpers/hooks/useAuth";
import { Spin } from "antd";

interface ProtectProps {
  children: React.ReactNode;
}

const LoginProtect = ({ children }: ProtectProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

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

  if (isAuthenticated && user) {
    if (location.pathname === "/") {
      // Role-based redirection after login
      if (user.role === 'super_admin' || user.role === 'admin') {
        return <Navigate to="/admin" replace />;
      } else {
        // Regular users (operator, user) go to monitor page
        return <Navigate to="/monitor" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default LoginProtect;
