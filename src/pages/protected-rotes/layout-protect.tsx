import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Spin } from "antd";

interface ProtectProps {
  children: React.ReactNode;
}

const LayoutProtect = ({ children }: ProtectProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default LayoutProtect;