import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import App from "../App";
import {
  NotFound,
  SignIn,
  ActivateAccount,
  ResetPassword,
  ForgotPassword,
} from "@pages";
import { LayoutProtect } from "@pages";
import { LoginProtect } from "@pages";
import AdminLayout from "../pages/admin/admin-layout";
import Dashboard from "../pages/admin/dashboard";
import UserManagement from "../pages/admin/users/user-management";
import HopeCloudManagement from "../pages/admin/hopecloud/hopecloud-management";
import SyncDataManagement from "../pages/admin/hopecloud/sync-data-management";
import SitesManagement from "../pages/admin/sites/sites-management";
import FusionSolarManagement from "../pages/admin/fusion-solar/fusion-solar-management";
import ReportsManagement from "../pages/admin/reports/reports-management";
import MonitoringManagement from "../pages/admin/monitoring/monitoring-management";
import AnalyticsManagement from "../pages/admin/analytics/analytics-management";
import NotificationsManagement from "../pages/admin/notifications/notifications-management";
import DevicesManagement from "../pages/admin/devices/devices-management";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route
        index
        element={
          <LoginProtect>
            <SignIn />
          </LoginProtect>
        }
      />
      <Route 
        path="activate" 
        element={
          <LoginProtect>
            <ActivateAccount />
          </LoginProtect>
        } 
      />
      <Route 
        path="reset-password" 
        element={
          <LoginProtect>
            <ResetPassword />
          </LoginProtect>
        } 
      />
      <Route 
        path="forgot-password" 
        element={
          <LoginProtect>
            <ForgotPassword />
          </LoginProtect>
        } 
      />
      <Route path="*" element={<NotFound />} />
      
      {/* ADMIN */}
      <Route
        path="admin"
        element={
          <LayoutProtect>
            <AdminLayout />
          </LayoutProtect>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="sites" element={<SitesManagement />} />
        <Route path="devices" element={<DevicesManagement />} />
        <Route path="hopecloud" element={<Navigate to="/admin/hopecloud/real-time-data" replace />} />
        <Route path="hopecloud/real-time-data" element={<HopeCloudManagement />} />
        <Route path="hopecloud/sync-data" element={<SyncDataManagement />} />
        <Route path="fusion-solar" element={<FusionSolarManagement />} />
        <Route path="reports" element={<ReportsManagement />} />
        <Route path="monitoring" element={<MonitoringManagement />} />
        <Route path="analytics" element={<AnalyticsManagement />} />
        <Route path="notifications" element={<NotificationsManagement />} />
        <Route path="users" element={<UserManagement />} />
      </Route>
    </Route>
  )
);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;
