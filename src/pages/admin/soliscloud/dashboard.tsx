import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, message, Tag, Progress, Space, Typography, Divider } from 'antd';
import {
  ThunderboltOutlined,
  HomeOutlined,
  BellOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  CloudServerOutlined,
} from '@ant-design/icons';
import solisCloudService from '../../../service/soliscloud.service';

const { Title, Text } = Typography;

const SolisCloudDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

      // Fetch core data in parallel
      const [stationsDetailData, stationsDayData, inverterListData, alarmListData, collectorListData] = await Promise.all([
        solisCloudService.getStationDetailList({ pageNo: 1, pageSize: 100 }),
        solisCloudService.getStationDayList({ time: today, pageNo: 1, pageSize: 100 }),
        solisCloudService.getInverterList({ pageNo: 1, pageSize: 100 }),
        solisCloudService.getAlarmList({ pageNo: 1, pageSize: 100 }),
        solisCloudService.getCollectorList({ pageNo: 1, pageSize: 100 }),
      ]);

      // Fetch optional month and year data with error handling
      let stationsMonthData = [];
      let stationsYearData = [];

      try {
        stationsMonthData = await solisCloudService.getStationMonthList({ month: currentMonth, pageNo: 1, pageSize: 100 });
      } catch (error: any) {
        console.error('Failed to fetch month data:', error);
      }

      try {
        stationsYearData = await solisCloudService.getStationYearList({ pageNo: 1, pageSize: 100 });
      } catch (error: any) {
        console.error('Failed to fetch year data:', error);
      }

      setStats({
        stations: stationsDetailData,
        stationsDay: stationsDayData,
        stationsMonth: stationsMonthData,
        stationsYear: stationsYearData,
        inverters: inverterListData,
        alarms: alarmListData,
        collectors: collectorListData,
      });
    } catch (error: any) {
      message.error(error?.response?.data?.msg || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large">
          <div style={{ paddingTop: 50 }}>Loading SolisCloud data...</div>
        </Spin>
      </div>
    );
  }

  if (!stats) {
    return <div>No data available</div>;
  }

  const totalStations = stats.stations.records?.length || 0;
  const onlineStations = stats.stations.records?.filter((s: any) => s.state === 1)?.length || 0;
  const offlineStations = stats.stations.records?.filter((s: any) => s.state === 2)?.length || 0;

  const totalInverters = stats.inverters.inverterStatusVo?.all || 0;
  const onlineInverters = stats.inverters.inverterStatusVo?.normal || 0;
  const offlineInverters = stats.inverters.inverterStatusVo?.offline || 0;
  const faultyInverters = stats.inverters.inverterStatusVo?.fault || 0;
  const totalAlarms = stats.alarms.records?.length || 0;
  const activeAlarms = stats.alarms.records?.filter((a: any) => a.state === '0')?.length || 0;
  const totalCollectors = stats.collectors.records?.length || 0;

  // Calculate total power and energy from detailed station data
  const totalPower = stats.stations.records?.reduce((sum: number, station: any) => sum + (station.pac || 0), 0) || 0;
  const totalEnergyToday = stats.stations.records?.reduce((sum: number, station: any) => sum + (station.eToday || 0), 0) || 0;
  const totalEnergyAll = stats.stations.records?.reduce((sum: number, station: any) => sum + (station.eTotal || 0), 0) || 0;

  return (
    <div>
      {/* Header */}
      <Card
        style={{
          marginBottom: 24,
          
          border: 'none',
        }}
      >
        <Space direction="vertical" size="small">
          <Space>
            <CloudServerOutlined style={{ fontSize: 32 }} />
            <Title level={2} style={{ margin: 0 }}>
              SolisCloud Dashboard
            </Title>
          </Space>
          <Text style={{ color: 'rgba(0,0,0,0.65)' }}>
            Real-time monitoring and management of your solar energy systems
          </Text>
        </Space>
      </Card>

      {/* Overview Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Total Stations</span>}
              value={totalStations}
              prefix={<HomeOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff' }}
            />
            <Progress
              percent={totalStations > 0 ? Math.round((onlineStations / totalStations) * 100) : 0}
              strokeColor="#fff"
              showInfo={false}
              size="small"
              style={{ marginTop: 8 }}
            />
            <div style={{ marginTop: 4, color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
              {onlineStations} online, {offlineStations} offline
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Total Inverters</span>}
              value={totalInverters}
              prefix={<ThunderboltOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff' }}
            />
            <Progress
              percent={totalInverters > 0 ? Math.round((onlineInverters / totalInverters) * 100) : 0}
              strokeColor="#fff"
              showInfo={false}
              size="small"
              style={{ marginTop: 8 }}
            />
            <div style={{ marginTop: 4, color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
              {onlineInverters} online, {offlineInverters} offline
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: activeAlarms > 0
                ? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                : 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Active Alarms</span>}
              value={activeAlarms}
              prefix={activeAlarms > 0 ? <WarningOutlined style={{ color: '#fff' }} /> : <CheckCircleOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff' }}
            />
            <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
              {totalAlarms} total alarms
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(0,0,0,0.75)' }}>Collectors</span>}
              value={totalCollectors}
              prefix={<DatabaseOutlined style={{ color: 'rgba(0,0,0,0.75)' }} />}
              valueStyle={{ color: 'rgba(0,0,0,0.75)' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Power & Energy Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Current Power"
              value={totalPower.toFixed(2)}
              suffix="kW"
              prefix={<ThunderboltOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Today's Energy"
              value={totalEnergyToday.toFixed(2)}
              suffix="kWh"
              prefix={<ThunderboltOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Energy"
              value={totalEnergyAll.toFixed(2)}
              suffix="kWh"
              prefix={<ThunderboltOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Station Details with Real-time Day Data */}
      <Card
        title={
          <Space>
            <HomeOutlined />
            <span>Today's Station Performance</span>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        {stats.stations.records?.map((station: any) => {
          // Find today's data, this month's data, and this year's data for this station
          const dayData = stats.stationsDay?.find((d: any) => d.stationId === station.id);
          const monthData = stats.stationsMonth?.find((m: any) => m.stationId === station.id);
          const yearData = stats.stationsYear?.find((y: any) => y.stationId === station.id);

          return (
            <Card key={station.id} type="inner" style={{ marginBottom: 8 }}>
              <Row gutter={16} align="middle">
                <Col xs={24} md={6}>
                  <Space direction="vertical" size="small">
                    <Text strong style={{ fontSize: 16 }}>{station.stationName}</Text>
                    <Space size="small">
                      <Tag color={station.state === 1 ? 'green' : 'red'}>
                        {station.state === 1 ? 'Normal' : 'Offline'}
                      </Tag>
                      <Tag>{station.capacity} kWp</Tag>
                      <Tag>{station.countryStr}</Tag>
                    </Space>
                  </Space>
                </Col>
                <Col xs={24} md={18}>
                  <Row gutter={8}>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="Current Power"
                        value={(station.pac || 0).toFixed(2)}
                        suffix="kW"
                        valueStyle={{ fontSize: 14 }}
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="Today"
                        value={(dayData?.energy || station.eToday || 0).toFixed(2)}
                        suffix="kWh"
                        valueStyle={{ fontSize: 14, color: '#52c41a' }}
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="This Month"
                        value={(monthData?.energy || station.eMonth || 0).toFixed(2)}
                        suffix="kWh"
                        valueStyle={{ fontSize: 14, color: '#1890ff' }}
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="This Year"
                        value={(yearData?.energy || station.eYear || 0).toFixed(2)}
                        suffix="kWh"
                        valueStyle={{ fontSize: 14, color: '#fa8c16' }}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          );
        })}
      </Card>

      {/* Recent Alarms */}
      {activeAlarms > 0 && (
        <Card
          title={
            <Space>
              <BellOutlined />
              <span>Active Alarms</span>
              <Tag color="red">{activeAlarms}</Tag>
            </Space>
          }
        >
          {stats.alarms.records
            ?.filter((alarm: any) => alarm.state === '0')
            ?.slice(0, 5)
            ?.map((alarm: any, index: number) => (
              <Card key={index} type="inner" style={{ marginBottom: 8 }}>
                <Row gutter={16} align="middle">
                  <Col xs={24} md={12}>
                    <Space direction="vertical" size="small">
                      <Space>
                        <WarningOutlined style={{ color: '#ff4d4f' }} />
                        <Text strong>{alarm.alarmMsg}</Text>
                        <Tag color={alarm.alarmLevel === '1' ? 'orange' : 'red'}>
                          Level {alarm.alarmLevel}
                        </Tag>
                      </Space>
                      <Text type="secondary">{alarm.stationName}</Text>
                    </Space>
                  </Col>
                  <Col xs={24} md={12}>
                    <Text type="secondary">
                      Device: {alarm.alarmDeviceSn}
                    </Text>
                  </Col>
                </Row>
              </Card>
            ))}
        </Card>
      )}
    </div>
  );
};

export default SolisCloudDashboard;
