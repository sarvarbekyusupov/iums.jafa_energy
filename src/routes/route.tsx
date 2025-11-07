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
// Fsolar pages
import FsolarRealTimeMonitoring from "../pages/admin/fsolar/real-time-monitoring";
import FsolarDevicesManagement from "../pages/admin/fsolar/devices-management";
import FsolarDeviceSettings from "../pages/admin/fsolar/device-settings";
import FsolarEnergyAnalytics from "../pages/admin/fsolar/energy-analytics";
import FsolarHistoricalData from "../pages/admin/fsolar/historical-data";
import FsolarTemplatesManagement from "../pages/admin/fsolar/templates-management";
import FsolarTasksManagement from "../pages/admin/fsolar/tasks-management";
import FsolarTaskMonitoring from "../pages/admin/fsolar/task-monitoring";
import FsolarRunRecords from "../pages/admin/fsolar/run-records";
import FsolarDeviceAlarms from "../pages/admin/fsolar/device-alarms";
// SolisCloud pages
import SolisCloudDashboard from "../pages/admin/soliscloud/dashboard";
import SolisCloudStations from "../pages/admin/soliscloud/stations";
import StationDetailPage from "../pages/admin/soliscloud/station-detail";
import StationChartsPage from "../pages/admin/soliscloud/station-charts";
import SolisCloudInverters from "../pages/admin/soliscloud/inverters";
import InverterDetailPage from "../pages/admin/soliscloud/inverter-detail";
import InverterChartsPage from "../pages/admin/soliscloud/inverter-charts";
import SolisCloudAlarms from "../pages/admin/soliscloud/alarms";
import SolisCloudCollectors from "../pages/admin/soliscloud/collectors";
import CollectorDetailPage from "../pages/admin/soliscloud/collector-detail";
import CollectorDiagnosticsPage from "../pages/admin/soliscloud/collector-diagnostics";
import EPMListPage from "../pages/admin/soliscloud/epm-list";
import EPMDetailPage from "../pages/admin/soliscloud/epm-detail";
import EPMChartsPage from "../pages/admin/soliscloud/epm-charts";
import WeatherListPage from "../pages/admin/soliscloud/weather-list";
import WeatherDetailPage from "../pages/admin/soliscloud/weather-detail";
import SolisCloudAPITest from "../pages/admin/soliscloud/api-test";

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
        {/* Fsolar routes */}
        <Route path="fsolar" element={<Navigate to="/admin/fsolar/realtime" replace />} />
        <Route path="fsolar/realtime" element={<FsolarRealTimeMonitoring />} />
        <Route path="fsolar/devices" element={<FsolarDevicesManagement />} />
        <Route path="fsolar/settings" element={<FsolarDeviceSettings />} />
        <Route path="fsolar/energy" element={<FsolarEnergyAnalytics />} />
        <Route path="fsolar/history" element={<FsolarHistoricalData />} />
        <Route path="fsolar/templates" element={<FsolarTemplatesManagement />} />
        <Route path="fsolar/tasks" element={<FsolarTasksManagement />} />
        <Route path="fsolar/monitor" element={<FsolarTaskMonitoring />} />
        <Route path="fsolar/records" element={<FsolarRunRecords />} />
        <Route path="fsolar/alarms" element={<FsolarDeviceAlarms />} />
        {/* SolisCloud routes */}
        <Route path="soliscloud" element={<Navigate to="/admin/soliscloud/dashboard" replace />} />
        <Route path="soliscloud/dashboard" element={<SolisCloudDashboard />} />
        <Route path="soliscloud/stations" element={<SolisCloudStations />} />
        <Route path="soliscloud/stations/:id" element={<StationDetailPage />} />
        <Route path="soliscloud/stations/:id/charts" element={<StationChartsPage />} />
        <Route path="soliscloud/inverters" element={<SolisCloudInverters />} />
        <Route path="soliscloud/inverters/:id" element={<InverterDetailPage />} />
        <Route path="soliscloud/inverters/:id/charts" element={<InverterChartsPage />} />
        <Route path="soliscloud/alarms" element={<SolisCloudAlarms />} />
        <Route path="soliscloud/collectors" element={<SolisCloudCollectors />} />
        <Route path="soliscloud/collectors/:id" element={<CollectorDetailPage />} />
        <Route path="soliscloud/collectors/:sn/diagnostics" element={<CollectorDiagnosticsPage />} />
        <Route path="soliscloud/epm" element={<EPMListPage />} />
        <Route path="soliscloud/epm/:id" element={<EPMDetailPage />} />
        <Route path="soliscloud/epm/:id/charts" element={<EPMChartsPage />} />
        <Route path="soliscloud/weather" element={<WeatherListPage />} />
        <Route path="soliscloud/weather/:sn" element={<WeatherDetailPage />} />
        <Route path="soliscloud/api-test" element={<SolisCloudAPITest />} />
      </Route>
    </Route>
  )
);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;
