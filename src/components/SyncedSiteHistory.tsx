import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Button, Spin, message, Row, Col, Statistic, Alert, Tabs } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ReloadOutlined, ThunderboltOutlined, RiseOutlined, ClockCircleOutlined, CalendarOutlined, BarChartOutlined, SyncOutlined } from '@ant-design/icons';
import { hopeCloudService, siteKpisService } from '../service';
import { apiClient } from '../service/api-client';
import type { HopeCloudStationHistoricalPower, HopeCloudStatistics } from '../types/hopecloud';
import dayjs from 'dayjs';

interface SyncedSiteHistoryProps {
  stationId: string;
  stationName?: string;
}

interface ChartDataPoint {
  time: string;
  power: number;
}

interface StatsDataPoint {
  time: string;
  energy: number;
  power: number;
  revenue?: number;
}

type ViewType = 'hourly' | 'daily' | 'monthly' | 'yearly';

const SyncedSiteHistory: React.FC<SyncedSiteHistoryProps> = ({
  stationId,
  stationName
}) => {
  const [activeTab, setActiveTab] = useState<ViewType>('hourly');

  // Hourly data state
  const [historicalData, setHistoricalData] = useState<HopeCloudStationHistoricalPower[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = dayjs();
    return today;
  });

  // Stats data state
  const [statsData, setStatsData] = useState<HopeCloudStatistics[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [statsDateRange, setStatsDateRange] = useState(() => {
    // Default range - will be updated when tab changes
    const endDate = dayjs();
    const startDate = endDate.subtract(30, 'days');
    return { startDate, endDate };
  });

  const fetchHistoricalData = async () => {
    if (!stationId) return;

    setLoading(true);
    setError(null);

    try {
      // Map database site IDs to HopeCloud station IDs
      const hopecloudStationId = stationId === '3' ? '1921207990405709826' : stationId;

      const dateString = selectedDate.format('YYYY-MM-DD');
      const response = await hopeCloudService.getStationHistoricalPower(hopecloudStationId, dateString);

      if (response?.data) {
        setHistoricalData(response.data);
      } else {
        throw new Error('Failed to fetch historical data');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch station historical data';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Sync function to trigger HopeCloud daily sync
  const triggerDailySync = async () => {
    setSyncing(true);
    setSyncResult(null);

    try {
      const response = await apiClient.post('/api/hopecloud/sync/daily');
      setSyncResult(response);

      if (response.status === 'success') {
        message.success(`Sync completed! ${response.data.recordsProcessed} sites processed`);
        // Refresh data after successful sync
        setTimeout(() => {
          fetchStatsData();
        }, 2000); // Wait 2 seconds for sync to propagate
      } else {
        message.warning('Sync completed with some issues');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Sync failed';
      message.error(errorMessage);
      console.error('Sync error:', err);
    } finally {
      setSyncing(false);
    }
  };

  const fetchStatsData = async () => {
    if (!stationId) return;

    setStatsLoading(true);
    setStatsError(null);

    try {
      let response;

      // Use database API as instructed: GET /api/site-kpis?siteId=1&startDate=2025-09-01&endDate=2025-09-30
      const startDate = statsDateRange.startDate.format('YYYY-MM-DD');
      const endDate = statsDateRange.endDate.format('YYYY-MM-DD');

      const params = new URLSearchParams({
        siteId: stationId,
        startDate,
        endDate
      });

      console.log(`🔍 Database API Call: /api/site-kpis?${params.toString()}`);
      response = await apiClient.get(`/api/site-kpis?${params.toString()}`);

      if (response?.data && Array.isArray(response.data)) {
        console.log(`📊 ${activeTab} Database API returned ${response.data.length} records`);
        console.log(`📅 Date range in response:`, {
          first: response.data[0]?.measuredAt,
          last: response.data[response.data.length - 1]?.measuredAt
        });
        console.log(`📝 Sample records:`, response.data.slice(0, 3));

        // Check date distribution
        const uniqueDates = [...new Set(response.data.map(item => dayjs(item?.measuredAt).format('YYYY-MM-DD')))];
        console.log(`📅 Unique dates in response (${uniqueDates.length}):`, uniqueDates.slice(0, 10));

        setStatsData(response.data);
      } else {
        console.warn(`${activeTab} API unexpected response:`, response);
        throw new Error('Failed to fetch statistics data');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch station statistics';
      setStatsError(errorMessage);
      message.error(errorMessage);
    } finally {
      setStatsLoading(false);
    }
  };

  // Effect for hourly data (when selectedDate changes)
  useEffect(() => {
    if (activeTab === 'hourly') {
      fetchHistoricalData();
    }
  }, [selectedDate, stationId, activeTab]);

  // Effect for stats data (when activeTab or date range changes)
  useEffect(() => {
    if (activeTab !== 'hourly') {
      fetchStatsData();
    }
  }, [activeTab, statsDateRange, stationId]);

  // Effect to update date range when tab changes
  useEffect(() => {
    if (activeTab === 'hourly') return; // Hourly uses selectedDate

    const now = dayjs();
    let newStartDate, newEndDate;

    switch (activeTab) {
      case 'daily':
        newEndDate = now;
        newStartDate = now.subtract(30, 'days');
        break;
      case 'monthly':
        newEndDate = now;
        newStartDate = now.subtract(12, 'months');
        break;
      case 'yearly':
        newEndDate = now;
        newStartDate = now.subtract(5, 'years');
        break;
    }

    setStatsDateRange({ startDate: newStartDate, endDate: newEndDate });
  }, [activeTab]);

  // Data processing functions
  const processHistoricalData = (): ChartDataPoint[] => {
    if (!Array.isArray(historicalData) || historicalData.length === 0) {
      return [];
    }

    return historicalData.map((item, index) => ({
      time: item?.time || `${index.toString().padStart(2, '0')}:00`,
      power: Math.max(0, parseFloat(item?.nowKw?.toString() || '0')),
    }));
  };

  const processStatsData = (): StatsDataPoint[] => {
    if (!Array.isArray(statsData) || statsData.length === 0) {
      return [];
    }

    // Process data based on the dataType we requested
    return statsData.map((item) => {
      let formattedTime = '';
      let energy = 0;
      let power = 0;

      try {
        // Format time based on active tab
        switch (activeTab) {
          case 'daily':
            formattedTime = dayjs(item?.measuredAt).format('MM-DD');
            energy = Math.max(0, parseFloat(item?.dailyYieldKwh?.toString() || '0'));
            break;
          case 'monthly':
            formattedTime = dayjs(item?.measuredAt).format('YYYY-MM');
            energy = Math.max(0, parseFloat(item?.monthlyYieldKwh?.toString() || '0'));
            break;
          case 'yearly':
            formattedTime = dayjs(item?.measuredAt).format('YYYY');
            energy = Math.max(0, parseFloat(item?.yearlyYieldKwh?.toString() || '0'));
            break;
          default:
            formattedTime = 'Unknown';
            energy = 0;
        }

        power = Math.max(0, parseFloat(item?.currentPowerKw?.toString() || '0'));
      } catch (error) {
        console.warn('Error processing stats item:', item, error);
        formattedTime = 'Error';
        energy = 0;
        power = 0;
      }

      return {
        time: formattedTime,
        energy,
        power,
        revenue: 0, // Revenue calculation would need additional data or different API
      };
    }).filter(item => item.time !== 'Error'); // Filter out invalid items
  };



  // Calculate statistics
  const calculateStats = (data: StatsDataPoint[]) => {
    if (!Array.isArray(data) || data.length === 0) {
      return { totalEnergy: 0, peakPower: 0, totalRevenue: 0 };
    }

    try {
      const validData = data.filter(item => item && typeof item.energy === 'number' && typeof item.power === 'number');

      if (validData.length === 0) {
        return { totalEnergy: 0, peakPower: 0, totalRevenue: 0 };
      }

      const totalEnergy = validData.reduce((sum, item) => sum + (item.energy || 0), 0);
      const powerValues = validData.map(item => item.power || 0).filter(p => p > 0);
      const peakPower = powerValues.length > 0 ? Math.max(...powerValues) : 0;
      const totalRevenue = validData.reduce((sum, item) => sum + (item.revenue || 0), 0);

      return { totalEnergy, peakPower, totalRevenue };
    } catch (error) {
      console.warn('Error calculating stats:', error);
      return { totalEnergy: 0, peakPower: 0, totalRevenue: 0 };
    }
  };

  // Tab items matching Real Time Data design
  const tabItems = [
    {
      key: 'hourly',
      label: (
        <span>
          <ClockCircleOutlined />
          Hourly
        </span>
      ),
    },
    {
      key: 'daily',
      label: (
        <span>
          <CalendarOutlined />
          Daily
        </span>
      ),
    },
    {
      key: 'monthly',
      label: (
        <span>
          <BarChartOutlined />
          Monthly
        </span>
      ),
    },
    {
      key: 'yearly',
      label: (
        <span>
          <BarChartOutlined />
          Yearly
        </span>
      ),
    },
  ];

  // Render tab content
  const renderTabContent = () => {
    if (activeTab === 'hourly') {
      // Hourly tab with date picker and power chart
      const chartData = processHistoricalData();
      const peakPower = chartData.length > 0 ? Math.max(...chartData.map(d => d.power)) : 0;
      const avgPower = chartData.length > 0 ? chartData.reduce((sum, d) => sum + d.power, 0) / chartData.length : 0;

      return (
        <div>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <DatePicker
                value={selectedDate}
                onChange={(date) => date && setSelectedDate(date)}
                style={{ width: '100%' }}
                placeholder="Select date"
              />
            </Col>
            <Col span={12}>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={fetchHistoricalData}
                loading={loading}
              >
                Refresh Data
              </Button>
            </Col>
          </Row>

          {/* Statistics Cards */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Statistic
                title="Peak Power"
                value={peakPower}
                precision={2}
                suffix="kW"
                valueStyle={{ color: '#cf1322' }}
                prefix={<ThunderboltOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Average Power"
                value={avgPower}
                precision={2}
                suffix="kW"
                valueStyle={{ color: '#3f8600' }}
                prefix={<RiseOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Total Data Points"
                value={chartData.length}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
          </Row>

          {/* Chart */}
          <Card>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px' }}>Loading hourly power data...</div>
              </div>
            ) : error ? (
              <Alert
                message="Error Loading Data"
                description={error}
                type="error"
                showIcon
              />
            ) : chartData.length > 0 ? (
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => [`${value} kW`, 'Power']}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="power"
                      stroke="#1890ff"
                      fillOpacity={1}
                      fill="url(#colorPower)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                No hourly data available for selected date
              </div>
            )}
          </Card>
        </div>
      );
    } else {
      // Daily/Monthly/Yearly tabs with date range picker and dual charts
      const chartData = processStatsData();
      const stats = calculateStats(chartData);

      const getDatePickerProps = () => {
        switch (activeTab) {
          case 'monthly':
            return { picker: 'month' as const };
          case 'yearly':
            return { picker: 'year' as const };
          default:
            return {};
        }
      };

      return (
        <div>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={16}>
              <DatePicker.RangePicker
                value={[statsDateRange.startDate, statsDateRange.endDate]}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setStatsDateRange({
                      startDate: dates[0],
                      endDate: dates[1],
                    });
                  }
                }}
                style={{ width: '100%' }}
                {...getDatePickerProps()}
              />
            </Col>
            <Col span={8}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  type="primary"
                  icon={<SyncOutlined />}
                  onClick={triggerDailySync}
                  loading={syncing}
                >
                  Sync HopeCloud
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchStatsData}
                  loading={statsLoading}
                >
                  Refresh Data
                </Button>
              </div>
            </Col>
          </Row>

          {/* Sync Status Display */}
          {syncResult && (
            <Alert
              message={`Sync completed: ${syncResult.data?.recordsProcessed || 0} sites processed, ${syncResult.data?.recordsFailed || 0} device issues`}
              description={`Duration: ${syncResult.data?.startTime ? Math.round((new Date(syncResult.data.endTime).getTime() - new Date(syncResult.data.startTime).getTime()) / 1000) : 0}s`}
              type={syncResult.data?.recordsFailed === 0 ? 'success' : 'warning'}
              closable
              onClose={() => setSyncResult(null)}
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Statistics Cards */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Statistic
                title="Peak Power"
                value={stats.peakPower}
                precision={2}
                suffix="kW"
                valueStyle={{ color: '#cf1322' }}
                prefix={<ThunderboltOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Total Energy"
                value={stats.totalEnergy}
                precision={2}
                suffix="kWh"
                valueStyle={{ color: '#3f8600' }}
                prefix={<RiseOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Total Revenue"
                value={stats.totalRevenue}
                precision={2}
                prefix="$"
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
          </Row>

          {/* Chart */}
          <Card>
            {statsLoading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px' }}>Loading {activeTab} statistics...</div>
              </div>
            ) : statsError ? (
              <Alert
                message="Error Loading Data"
                description={statsError}
                type="error"
                showIcon
              />
            ) : chartData.length > 0 ? (
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any, name: string) => {
                        if (name === 'Energy (kWh)') return [`${value} kWh`, 'Energy'];
                        if (name === 'Power (kW)') return [`${value} kW`, 'Power'];
                        return [value, name];
                      }}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="energy"
                      stroke="#52c41a"
                      fillOpacity={1}
                      fill="url(#colorEnergy)"
                      name="Energy (kWh)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                No {activeTab} data available for selected period
              </div>
            )}
          </Card>
        </div>
      );
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <Alert
        message="HopeCloud Synced Data - Historical Analysis"
        description={`Station ${stationId} historical data synchronized from HopeCloud. Use tabs to view different time periods.`}
        type="info"
        showIcon
        style={{ marginBottom: '16px' }}
      />

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as ViewType)}
        items={tabItems}
        size="large"
      />

      <div style={{ marginTop: '16px' }}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SyncedSiteHistory;