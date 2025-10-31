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
      return <Navigate to="/admin" replace />;
    }
  }

  return <>{children}</>;
};

export default LoginProtect;
