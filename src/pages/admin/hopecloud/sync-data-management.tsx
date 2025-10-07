import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Table,
  Tag,
  Spin,
  message,
  Tabs,
  Statistic,
  Progress,
  Modal,
  Descriptions,
  Badge,
  Avatar,
  Layout,
  Input,
  Select,
  List,
  Empty,
  Tooltip,
  Form,
  Divider,
  Alert,
} from 'antd';
import type { TableColumnsType, TabsProps } from 'antd';
import {
  CloudServerOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  DatabaseOutlined,
  DashboardOutlined,
  BellOutlined,
  SearchOutlined,
  LineChartOutlined,
  TeamOutlined,
  HomeOutlined,
  WifiOutlined,
  BarChartOutlined,
  CalendarOutlined,
  SettingOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { sitesService, siteKpisService, deviceAlarmsService, hopeCloudService, communicationModulesService } from '../../../service';
import StatisticsDashboard from '../../../components/StatisticsDashboard';
import SyncedSiteHistory from '../../../components/SyncedSiteHistory';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Content } = Layout;
const { Search } = Input;

// Types for synced data
interface SyncedSite {
  id: number;
  siteName: string;
  capacityKw: string;
  status: string;
  location?: string;
  province?: string;
  city?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

interface SyncedDevice {
  id: number;
  deviceName: string;
  deviceType: string;
  status: string;
  siteId: number;
  serialNumber?: string;
  model?: string;
  createdAt: string;
  updatedAt: string;
}

interface SyncedKpi {
  id: number;
  siteId: number;
  measuredAt: string;
  dailyYieldKwh: string;
  currentPowerKw: string;
  performanceRatio: string;
  availabilityPercentage: string;
  totalYieldKwh: string;
  createdAt: string;
}

interface SyncedAlarm {
  id: number;
  deviceId: number;
  severity: string;
  status: string;
  description: string;
  message: string;
  occurredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  createdAt: string;
}

const SyncDataManagement: React.FC = () => {
  // Core state for synced data
  const [sites, setSites] = useState<SyncedSite[]>([]);
  const [devices, setDevices] = useState<SyncedDevice[]>([]);
  const [kpis, setKpis] = useState<SyncedKpi[]>([]);
  const [alarms, setAlarms] = useState<SyncedAlarm[]>([]);
  const [commModules, setCommModules] = useState<any[]>([]); // CommunicationModule type from api.ts
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('stations');

  // Modal states
  const [selectedSite, setSelectedSite] = useState<SyncedSite | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<SyncedDevice | null>(null);
  const [siteModalVisible, setSiteModalVisible] = useState(false);
  const [deviceModalVisible, setDeviceModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  // Search and filter states
  const [siteSearchText, setSiteSearchText] = useState('');
  const [alarmSearchText, setAlarmSearchText] = useState('');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<number | undefined>(undefined);

  // Load all synced data
  const loadSyncedData = async () => {
    setLoading(true);
    try {
      const [sitesRes, devicesRes, kpisRes, commModulesRes, alarmsRes] = await Promise.allSettled([
        sitesService.getAllSites(),
        sitesService.getAllDevices(),
        siteKpisService.getAllSiteKpis(),
        communicationModulesService.getAllModules(),
        deviceAlarmsService.getAllDeviceAlarms(),
      ]);

      // Handle sites
      if (sitesRes.status === 'fulfilled') {
        const sitesData = sitesRes.value?.data || sitesRes.value || [];
        setSites(Array.isArray(sitesData) ? sitesData : []);
        console.log('Synced sites loaded:', sitesData.length);
      } else {
        console.error('Failed to load synced sites:', sitesRes.reason);
        setSites([]);
      }

      // Handle devices
      if (devicesRes.status === 'fulfilled') {
        const devicesData = devicesRes.value?.data || devicesRes.value || [];
        setDevices(Array.isArray(devicesData) ? devicesData : []);
        console.log('Synced devices loaded:', devicesData.length);
      } else {
        console.error('Failed to load synced devices:', devicesRes.reason);
        setDevices([]);
      }

      // Handle KPIs
      if (kpisRes.status === 'fulfilled') {
        const kpisData = kpisRes.value?.data || kpisRes.value || [];
        setKpis(Array.isArray(kpisData) ? kpisData : []);
        console.log('Synced KPIs loaded:', kpisData.length);
      } else {
        console.error('Failed to load synced KPIs:', kpisRes.reason);
        setKpis([]);
      }

      // Handle communication modules
      if (commModulesRes.status === 'fulfilled') {
        const modulesData = commModulesRes.value || [];
        setCommModules(Array.isArray(modulesData) ? modulesData : []);
        console.log('Communication modules loaded:', modulesData.length);
      } else {
        console.error('Failed to load communication modules:', commModulesRes.reason);
        setCommModules([]);
      }

      // Handle alarms
      if (alarmsRes.status === 'fulfilled') {
        const alarmsData = alarmsRes.value?.data || alarmsRes.value || [];
        setAlarms(Array.isArray(alarmsData) ? alarmsData : []);
        console.log('Device alarms loaded:', alarmsData.length);
      } else {
        console.error('Failed to load device alarms:', alarmsRes.reason);
        setAlarms([]);
      }

    } catch (error) {
      console.error('Error loading synced data:', error);
      message.error('Failed to load synced data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadSyncedData();
  }, []);


  // Stations Content
  const StationsContent = () => {
    const filteredSites = sites.filter(site =>
      site.siteName?.toLowerCase().includes(siteSearchText.toLowerCase()) ||
      site.id.toString().includes(siteSearchText)
    );

    const columns: TableColumnsType<SyncedSite> = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 80,
      },
      {
        title: 'Site Name',
        dataIndex: 'siteName',
        key: 'siteName',
        render: (text: string, record: SyncedSite) => (
          <Space>
            <Text strong>{text || `Site ${record.id}`}</Text>
          </Space>
        ),
      },
      {
        title: 'Capacity',
        dataIndex: 'capacityKw',
        key: 'capacityKw',
        render: (capacity: string) => `${parseFloat(capacity || '0').toFixed(2)} kW`,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => (
          <Tag color={status === 'active' ? 'green' : 'red'}>
            {status?.toUpperCase() || 'UNKNOWN'}
          </Tag>
        ),
      },
      {
        title: 'Location',
        key: 'location',
        render: (record: SyncedSite) => (
          <Text>{record.province || record.city || record.location || 'N/A'}</Text>
        ),
      },
      {
        title: 'Last Updated',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (record: SyncedSite) => (
          <Space>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedSite(record);
                setSiteModalVisible(true);
              }}
            >
              View
            </Button>
            <Button
              size="small"
              icon={<LineChartOutlined />}
              onClick={() => {
                setSelectedSite(record);
                setHistoryModalVisible(true);
              }}
            >
              History
            </Button>
          </Space>
        ),
      },
    ];

    return (
      <div style={{ padding: '24px' }}>
        <Card
          title={
            <Space>
              <DatabaseOutlined />
              Synced Sites from Database
              <Badge count={sites.length} showZero />
            </Space>
          }
          extra={
            <Space>
              <Search
                placeholder="Search sites..."
                value={siteSearchText}
                onChange={(e) => setSiteSearchText(e.target.value)}
                style={{ width: 200 }}
              />
              <Button icon={<ReloadOutlined />} onClick={loadSyncedData} loading={loading}>
                Refresh
              </Button>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={filteredSites}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </div>
    );
  };

  // Alarms Content
  const AlarmsContent = () => {
    const [syncing, setSyncing] = useState(false);
    const [alarmsLoading, setAlarmsLoading] = useState(false);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [syncStartDate, setSyncStartDate] = useState(dayjs().subtract(7, 'days').format('YYYY-MM-DD'));
    const [syncEndDate, setSyncEndDate] = useState(dayjs().format('YYYY-MM-DD'));

    const handleSyncAlarms = async () => {
      setSyncing(true);
      const hideLoading = message.loading('Syncing alarms from HopeCloud... This may take 1-2 minutes for large date ranges.', 0);

      try {
        const response = await hopeCloudService.resyncAlarms({
          startDate: syncStartDate,
          endDate: syncEndDate,
        });

        hideLoading();

        if (response.status === 'success') {
          const { alarmsCreated, errors } = response.data.details;
          if (errors.length > 0) {
            message.warning(`Synced ${alarmsCreated} alarms with ${errors.length} errors`);
          } else {
            message.success(`Successfully synced ${alarmsCreated} alarms from HopeCloud`);
          }
          // Refresh only alarms data without blocking entire UI
          setAlarmsLoading(true);
          try {
            const alarmsRes = await deviceAlarmsService.getAllDeviceAlarms();
            const alarmsData = alarmsRes?.data || alarmsRes || [];
            setAlarms(Array.isArray(alarmsData) ? alarmsData : []);
          } finally {
            setAlarmsLoading(false);
          }
          setShowSyncModal(false);
        } else {
          throw new Error(response.message || 'Failed to sync alarms');
        }
      } catch (err: any) {
        hideLoading();
        if (err.message?.includes('504') || err.message?.includes('timeout')) {
          message.warning({
            content: 'Sync is taking longer than expected. The process is still running in the background. Please refresh in a few minutes to see the results.',
            duration: 8,
          });
          setShowSyncModal(false);
        } else {
          message.error(err.message || 'Failed to sync alarms');
        }
      } finally {
        setSyncing(false);
      }
    };

    const handleRefreshAlarms = async () => {
      setAlarmsLoading(true);
      try {
        const alarmsRes = await deviceAlarmsService.getAllDeviceAlarms();
        const alarmsData = alarmsRes?.data || alarmsRes || [];
        setAlarms(Array.isArray(alarmsData) ? alarmsData : []);
      } catch (error) {
        message.error('Failed to refresh alarms');
      } finally {
        setAlarmsLoading(false);
      }
    };

    const getSeverityColor = (severity: string) => {
      switch (severity) {
        case 'critical': return 'red';
        case 'high': return 'orange';
        case 'medium': return 'gold';
        case 'low': return 'blue';
        default: return 'default';
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'active': return 'red';
        case 'acknowledged': return 'orange';
        case 'resolved': return 'green';
        default: return 'default';
      }
    };

    const getDeviceName = (deviceId: number) => {
      const device = devices.find(d => d.id === deviceId);
      return device?.deviceName || `Device ${deviceId}`;
    };

    const filteredAlarms = alarms.filter(alarm => {
      if (!alarmSearchText) return true;
      const searchLower = alarmSearchText.toLowerCase();
      return (
        alarm.title?.toLowerCase().includes(searchLower) ||
        alarm.alarmCode?.toLowerCase().includes(searchLower) ||
        alarm.alarmType?.toLowerCase().includes(searchLower) ||
        getDeviceName(alarm.deviceId).toLowerCase().includes(searchLower)
      );
    });

    const alarmColumns: TableColumnsType<SyncedAlarm> = [
      {
        title: 'Device',
        dataIndex: 'deviceId',
        key: 'deviceId',
        render: (deviceId: number) => <Text strong>{getDeviceName(deviceId)}</Text>,
      },
      {
        title: 'Code',
        dataIndex: 'alarmCode',
        key: 'alarmCode',
        width: 80,
      },
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
      },
      {
        title: 'Type',
        dataIndex: 'alarmType',
        key: 'alarmType',
        render: (type: string) => type || 'N/A',
      },
      {
        title: 'Severity',
        dataIndex: 'severity',
        key: 'severity',
        render: (severity: string) => (
          <Tag color={getSeverityColor(severity)}>{severity?.toUpperCase() || 'N/A'}</Tag>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => (
          <Tag color={getStatusColor(status)}>{status?.toUpperCase() || 'N/A'}</Tag>
        ),
      },
      {
        title: 'Occurred At',
        dataIndex: 'occurredAt',
        key: 'occurredAt',
        render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : 'N/A',
      },
    ];

    return (
      <div style={{ padding: '24px' }}>
        <Card
          title={
            <Space>
              <BellOutlined />
              Device Alarms (Database)
              <Badge count={alarms.length} showZero />
            </Space>
          }
          extra={
            <Space>
              <Search
                placeholder="Search alarms..."
                value={alarmSearchText}
                onChange={(e) => setAlarmSearchText(e.target.value)}
                style={{ width: 200 }}
              />
              <Button
                icon={<SyncOutlined />}
                onClick={() => setShowSyncModal(true)}
              >
                Sync from HopeCloud
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleRefreshAlarms} loading={alarmsLoading}>
                Refresh
              </Button>
            </Space>
          }
        >
          <Table
            columns={alarmColumns}
            dataSource={filteredAlarms}
            rowKey="id"
            loading={alarmsLoading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
            locale={{
              emptyText: 'No alarms found. Click "Sync from HopeCloud" to load alarm data.'
            }}
          />
        </Card>

        {/* Sync Modal */}
        <Modal
          title="Sync Alarms from HopeCloud"
          open={showSyncModal}
          onCancel={() => setShowSyncModal(false)}
          onOk={handleSyncAlarms}
          confirmLoading={syncing}
          okText="Sync Alarms"
        >
          <div style={{ marginBottom: 16 }}>
            <Alert
              message="Note: HopeCloud processes alarms in 1-day chunks"
              description="Syncing large date ranges may take time. Recommended: 7-30 days at a time. Default syncs last 7 days for all devices."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          </div>
          <Form layout="vertical">
            <Form.Item label="Start Date">
              <Input
                type="date"
                value={syncStartDate}
                onChange={(e) => setSyncStartDate(e.target.value)}
                max={syncEndDate}
              />
            </Form.Item>
            <Form.Item label="End Date">
              <Input
                type="date"
                value={syncEndDate}
                onChange={(e) => setSyncEndDate(e.target.value)}
                min={syncStartDate}
                max={dayjs().format('YYYY-MM-DD')}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  };

  // Communication Content
  const CommunicationContent = () => {
    const [syncing, setSyncing] = useState(false);

    const handleSyncCommunicationModules = async () => {
      setSyncing(true);
      try {
        const response = await hopeCloudService.syncCommunicationModules();

        if (response.status === 'success') {
          message.success('Communication modules synced successfully from HopeCloud');
          await loadSyncedData(); // Refresh data
        } else {
          throw new Error(response.message || 'Failed to sync communication modules');
        }
      } catch (err: any) {
        message.error(err.message || 'Failed to sync communication modules');
      } finally {
        setSyncing(false);
      }
    };

    const getSignalStrength = (rssi?: number) => {
      if (!rssi) return { text: 'N/A', color: 'default', bars: 0 };
      if (rssi >= 60) return { text: 'Excellent', color: 'green', bars: 4 };
      if (rssi >= 40) return { text: 'Good', color: 'blue', bars: 3 };
      if (rssi >= 20) return { text: 'Fair', color: 'orange', bars: 2 };
      return { text: 'Poor', color: 'red', bars: 1 };
    };

    const getSiteName = (siteId: number) => {
      const site = sites.find(s => s.id === siteId);
      return site?.siteName || `Site ${siteId}`;
    };

    const commModuleColumns: TableColumnsType<any> = [
      {
        title: 'Module ID',
        dataIndex: 'id',
        key: 'id',
        width: 100,
      },
      {
        title: 'Site',
        dataIndex: 'siteId',
        key: 'siteId',
        render: (siteId: number) => <Text strong>{getSiteName(siteId)}</Text>,
      },
      {
        title: 'Equipment PN',
        dataIndex: 'equipmentPn',
        key: 'equipmentPn',
        render: (pn: string) => pn || 'N/A',
      },
      {
        title: 'Device Type',
        dataIndex: 'deviceType',
        key: 'deviceType',
        render: (type: string) => (
          <Tag color="blue">{type === '707' ? 'WiFi' : type === '705' ? '4G' : type || 'N/A'}</Tag>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => {
          const color = status === 'online' ? 'green' : status === 'offline' ? 'default' : 'red';
          return <Tag color={color}>{status?.toUpperCase() || 'N/A'}</Tag>;
        },
      },
      {
        title: 'Signal (RSSI)',
        dataIndex: 'rssi',
        key: 'rssi',
        render: (rssi: number) => {
          const signal = getSignalStrength(rssi);
          return (
            <Space>
              <Tag color={signal.color}>{rssi || 'N/A'}</Tag>
              <Text type="secondary">{signal.text}</Text>
            </Space>
          );
        },
      },
      {
        title: 'Devices',
        dataIndex: 'loadedNumber',
        key: 'loadedNumber',
        render: (count: number) => count || 0,
      },
      {
        title: 'Last Update',
        dataIndex: 'lastUpdate',
        key: 'lastUpdate',
        render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : 'N/A',
      },
    ];

    return (
      <div style={{ padding: '24px' }}>
        <Card
          title={
            <Space>
              <WifiOutlined />
              Communication Modules (Database)
              <Badge count={commModules.length} showZero />
            </Space>
          }
          extra={
            <Space>
              <Button
                icon={<SyncOutlined />}
                onClick={handleSyncCommunicationModules}
                loading={syncing}
              >
                Sync from HopeCloud
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadSyncedData} loading={loading}>
                Refresh
              </Button>
            </Space>
          }
        >
          <Table
            columns={commModuleColumns}
            dataSource={commModules}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
            locale={{
              emptyText: 'No communication modules found. Click "Sync from HopeCloud" to load data.'
            }}
          />
        </Card>
      </div>
    );
  };

  // Users Content
  const UsersContent = () => {
    return (
      <div style={{ padding: '24px' }}>
        <Card
          title={
            <Space>
              <TeamOutlined />
              Users & Channels (Database)
            </Space>
          }
        >
          <Alert
            message="User & Channel Data Not Available"
            description="User and channel synchronization from HopeCloud to database is pending. This section will show synced user/channel data with the same interface as Real Time Data."
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          <Empty
            description="No user/channel data synchronized yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      </div>
    );
  };

  // Devices Content
  const DevicesContent = () => {
    const [syncing, setSyncing] = useState(false);

    const handleResyncDevices = async () => {
      setSyncing(true);
      try {
        const response = await hopeCloudService.resyncDevices({
          skipReadings: true // Fast mode - only sync daily statistics
        });

        if (response.status === 'success') {
          message.success('All devices synced successfully from HopeCloud');
          await loadSyncedData(); // Refresh data
        } else {
          throw new Error(response.message || 'Failed to sync devices');
        }
      } catch (err: any) {
        message.error(err.message || 'Failed to sync devices');
      } finally {
        setSyncing(false);
      }
    };

    const handleResyncSingleDevice = async (deviceId: number) => {
      try {
        const response = await hopeCloudService.resyncDevices({
          deviceIds: [deviceId],
          skipReadings: true
        });

        if (response.status === 'success') {
          message.success('Device synced successfully from HopeCloud');
          await loadSyncedData();
        } else {
          throw new Error(response.message || 'Failed to sync device');
        }
      } catch (err: any) {
        message.error(err.message || 'Failed to sync device');
      }
    };

    const deviceColumns: TableColumnsType<SyncedDevice> = [
      {
        title: 'Device ID',
        dataIndex: 'id',
        key: 'id',
        width: 100,
      },
      {
        title: 'Device Name',
        dataIndex: 'deviceName',
        key: 'deviceName',
        render: (name: string) => <Text strong>{name || 'N/A'}</Text>,
      },
      {
        title: 'Type',
        dataIndex: 'deviceType',
        key: 'deviceType',
        render: (type: string) => <Tag color="blue">{type}</Tag>,
      },
      {
        title: 'Serial Number',
        dataIndex: 'serialNumber',
        key: 'serialNumber',
        render: (serial: string) => serial || 'N/A',
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => (
          <Tag color={status === 'active' ? 'green' : 'default'}>
            {status?.toUpperCase() || 'N/A'}
          </Tag>
        ),
      },
      {
        title: 'Station ID',
        dataIndex: 'stationId',
        key: 'stationId',
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (record: SyncedDevice) => (
          <Space>
            <Button
              size="small"
              icon={<SyncOutlined />}
              onClick={() => handleResyncSingleDevice(record.id)}
            >
              Sync
            </Button>
          </Space>
        ),
      },
    ];

    return (
      <div style={{ padding: '24px' }}>
        <Card
          title={
            <Space>
              <SettingOutlined />
              Synced Devices from Database
              <Badge count={devices.length} showZero />
            </Space>
          }
          extra={
            <Space>
              <Button
                icon={<SyncOutlined />}
                onClick={handleResyncDevices}
                loading={syncing}
              >
                Sync All from HopeCloud
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadSyncedData} loading={loading}>
                Refresh
              </Button>
            </Space>
          }
        >
          <Table
            columns={deviceColumns}
            dataSource={devices}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </div>
    );
  };

  // Tab items matching Real Time Data structure
  const tabItems: TabsProps['items'] = [
    {
      key: 'stations',
      label: (
        <Space>
          <DatabaseOutlined />
          Stations
          <Badge count={sites.length} showZero size="small" />
        </Space>
      ),
      children: <div style={{ padding: 0, margin: 0, minHeight: 'calc(100vh - 120px)', width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}><StationsContent /></div>,
    },
    {
      key: 'devices',
      label: (
        <Space>
          <SettingOutlined />
          Devices
          <Badge count={devices.length} showZero size="small" />
        </Space>
      ),
      children: <div style={{ padding: 0, margin: 0, minHeight: 'calc(100vh - 120px)', width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}><DevicesContent /></div>,
    },
    {
      key: 'alarms',
      label: (
        <Space>
          <BellOutlined />
          Alarms
          <Badge count={alarms.length} showZero size="small" />
        </Space>
      ),
      children: <div style={{ padding: 0, margin: 0, minHeight: 'calc(100vh - 120px)', width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}><AlarmsContent /></div>,
    },
    {
      key: 'communication',
      label: (
        <Space>
          <WifiOutlined />
          Communication
          <Badge count={commModules.length} showZero size="small" />
        </Space>
      ),
      children: <div style={{ padding: 0, margin: 0, minHeight: 'calc(100vh - 120px)', width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}><CommunicationContent /></div>,
    },
    {
      key: 'users',
      label: (
        <Space>
          <TeamOutlined />
          Users & Channels
        </Space>
      ),
      children: <div style={{ padding: 0, margin: 0, minHeight: 'calc(100vh - 120px)', width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}><UsersContent /></div>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ background: 'transparent', padding: '24px', margin: 0 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          items={tabItems}
          style={{ margin: 0, width: '100%' }}
          tabBarStyle={{
            marginBottom: 0,
            background: 'transparent'
          }}
        />
      </Content>

      {/* Site Details Modal */}
      <Modal
        title={`Site Details - ${selectedSite?.siteName || selectedSite?.id}`}
        open={siteModalVisible}
        onCancel={() => setSiteModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedSite && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Site ID">{selectedSite.id}</Descriptions.Item>
            <Descriptions.Item label="Site Name">{selectedSite.siteName || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Capacity">{selectedSite.capacityKw} kW</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={selectedSite.status === 'active' ? 'green' : 'red'}>
                {selectedSite.status?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Province">{selectedSite.province || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="City">{selectedSite.city || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Address" span={2}>{selectedSite.address || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Created">{dayjs(selectedSite.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
            <Descriptions.Item label="Updated">{dayjs(selectedSite.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* History Modal */}
      <Modal
        title={`Historical Data - ${selectedSite?.siteName || selectedSite?.id}`}
        open={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={null}
        width={1200}
      >
        {selectedSite && (
          <SyncedSiteHistory stationId={selectedSite.id.toString()} />
        )}
      </Modal>
    </Layout>
  );
};

export default SyncDataManagement;