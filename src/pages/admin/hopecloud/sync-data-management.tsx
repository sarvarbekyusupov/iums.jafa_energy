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
  const [activeTab, setActiveTab] = useState('dashboard');

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
      const [sitesRes, devicesRes, kpisRes, commModulesRes] = await Promise.allSettled([
        sitesService.getAllSites(),
        sitesService.getAllDevices(),
        siteKpisService.getAllSiteKpis(),
        communicationModulesService.getAllModules(),
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

      // Alarms - set empty for now (API not available)
      setAlarms([]);

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

  // Dashboard Content
  const DashboardContent = () => {
    const totalSites = sites.length;
    const activeSites = sites.filter(s => s.status === 'active').length;
    const totalDevices = devices.length;
    const activeDevices = devices.filter(d => d.status === 'active').length;
    const latestKpis = kpis.slice(0, 10);
    const totalCapacity = sites.reduce((sum, site) => sum + parseFloat(site.capacityKw || '0'), 0);
    const totalDailyYield = latestKpis.reduce((sum, kpi) => sum + parseFloat(kpi.dailyYieldKwh || '0'), 0);

    return (
      <div style={{ padding: '24px' }}>
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Sites (Synced)"
                value={totalSites}
                prefix={<HomeOutlined />}
                valueStyle={{ color: '#1890ff' }}
                suffix={`/ ${activeSites} Active`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Devices (Synced)"
                value={totalDevices}
                prefix={<DatabaseOutlined />}
                valueStyle={{ color: '#52c41a' }}
                suffix={`/ ${activeDevices} Active`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Capacity"
                value={totalCapacity.toFixed(2)}
                prefix={<ThunderboltOutlined />}
                suffix="kW"
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Daily Yield (Latest)"
                value={totalDailyYield.toFixed(2)}
                prefix={<RiseOutlined />}
                suffix="kWh"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={16}>
            <Card title="Recent Site KPIs (Database)" extra={
              <Button icon={<ReloadOutlined />} onClick={loadSyncedData} loading={loading}>
                Refresh
              </Button>
            }>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {latestKpis.map((kpi, index) => (
                  <div key={kpi.id} style={{
                    padding: '12px',
                    borderBottom: index < latestKpis.length - 1 ? '1px solid #f0f0f0' : 'none',
                    background: index % 2 === 0 ? '#fafafa' : 'white'
                  }}>
                    <Row gutter={16}>
                      <Col span={4}>
                        <Text strong>Site {kpi.siteId}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {dayjs(kpi.measuredAt).format('MM-DD HH:mm')}
                        </Text>
                      </Col>
                      <Col span={5}>
                        <Text type="secondary">Daily Yield</Text>
                        <br />
                        <Text strong>{parseFloat(kpi.dailyYieldKwh || '0').toFixed(2)} kWh</Text>
                      </Col>
                      <Col span={5}>
                        <Text type="secondary">Current Power</Text>
                        <br />
                        <Text strong>{parseFloat(kpi.currentPowerKw || '0').toFixed(2)} kW</Text>
                      </Col>
                      <Col span={5}>
                        <Text type="secondary">Performance</Text>
                        <br />
                        <Text strong>{(parseFloat(kpi.performanceRatio || '0') * 100).toFixed(1)}%</Text>
                      </Col>
                      <Col span={5}>
                        <Text type="secondary">Availability</Text>
                        <br />
                        <Text strong>{parseFloat(kpi.availabilityPercentage || '0').toFixed(1)}%</Text>
                      </Col>
                    </Row>
                  </div>
                ))}
                {latestKpis.length === 0 && (
                  <Empty description="No KPI data available in database" />
                )}
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="System Status">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">Database Synchronization</Text>
                  <div style={{ marginTop: '8px' }}>
                    <Progress percent={100} status="success" strokeColor="#52c41a" />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      All data synced from HopeCloud
                    </Text>
                  </div>
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <div>
                  <Text type="secondary">Data Sources</Text>
                  <div style={{ marginTop: '8px' }}>
                    <Tag color="green">Sites Database</Tag>
                    <Tag color="green">Devices Database</Tag>
                    <Tag color="green">KPIs Database</Tag>
                    <Tag color="orange">Alarms (Pending)</Tag>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

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
              <Button icon={<ReloadOutlined />} onClick={loadSyncedData} loading={loading}>
                Refresh
              </Button>
            </Space>
          }
        >
          <Alert
            message="Device Alarms API Not Available"
            description="The device alarms endpoint (/api/device-alarms) returns 404. Once the backend implements this API, alarm data will be displayed here with the same design as Real Time Data."
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          <Empty
            description="No alarm data available in database yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
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
      key: 'dashboard',
      label: (
        <Space>
          <DashboardOutlined />
          Dashboard
        </Space>
      ),
      children: <div style={{ padding: 0, margin: 0, minHeight: 'calc(100vh - 120px)', width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}><DashboardContent /></div>,
    },
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
      <Content style={{ background: '#f0f2f5', padding: 0, margin: 0 }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '24px',
          color: 'white',
          marginBottom: '0'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Space align="center" size="large">
              <Avatar size={64} icon={<DatabaseOutlined />} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <div>
                <Title level={2} style={{ color: 'white', margin: 0 }}>
                  HopeCloud Sync Data Management
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
                  View and manage synchronized data from HopeCloud stored in local database
                </Text>
              </div>
            </Space>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '8px 8px 0 0',
          margin: '0 24px',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size="large"
            items={tabItems}
            style={{ margin: 0, width: '100%', overflow: 'hidden' }}
            tabBarStyle={{
              paddingLeft: '24px',
              paddingRight: '24px',
              marginBottom: 0,
              background: 'white',
              borderBottom: '1px solid #f0f0f0'
            }}
          />
        </div>
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