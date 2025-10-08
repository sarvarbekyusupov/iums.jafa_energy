import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Button, Spin, message, Row, Col, Statistic, Alert, Tabs } from 'antd';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { ReloadOutlined, ThunderboltOutlined, RiseOutlined, CalendarOutlined, BarChartOutlined, SyncOutlined } from '@ant-design/icons';
import { hopeCloudService } from '../service';
import { apiClient } from '../service/api-client';
import type { HopeCloudStatistics } from '../types/hopecloud';
import dayjs from 'dayjs';

interface SyncedSiteHistoryProps {
  stationId: string;
  stationName?: string;
}

interface StatsDataPoint {
  time: string;
  energy: number;
  power: number;
  revenue?: number;
}

type ViewType = 'daily' | 'monthly' | 'yearly';

const SyncedSiteHistory: React.FC<SyncedSiteHistoryProps> = ({
  stationId,
}) => {
  const [activeTab, setActiveTab] = useState<ViewType>('daily');

  // Stats data state
  const [statsData, setStatsData] = useState<HopeCloudStatistics[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  // Separate date ranges for each tab
  const [dailyDateRange, setDailyDateRange] = useState(() => {
    const endDate = dayjs();
    const startDate = endDate.subtract(30, 'days');
    return { startDate, endDate };
  });

  const [monthlyDateRange, setMonthlyDateRange] = useState(() => {
    const endDate = dayjs();
    const startDate = endDate.subtract(6, 'months');
    return { startDate, endDate };
  });

  const [yearlyDateRange, setYearlyDateRange] = useState(() => {
    const endDate = dayjs();
    const startDate = endDate.subtract(5, 'years');
    return { startDate, endDate };
  });

  // Helper to get current tab's date range
  const getCurrentDateRange = () => {
    switch (activeTab) {
      case 'daily':
        return dailyDateRange;
      case 'monthly':
        return monthlyDateRange;
      case 'yearly':
        return yearlyDateRange;
      default:
        return dailyDateRange;
    }
  };

  // Helper to set current tab's date range
  const setCurrentDateRange = (newRange: { startDate: dayjs.Dayjs; endDate: dayjs.Dayjs }) => {
    switch (activeTab) {
      case 'daily':
        setDailyDateRange(newRange);
        break;
      case 'monthly':
        setMonthlyDateRange(newRange);
        break;
      case 'yearly':
        setYearlyDateRange(newRange);
        break;
    }
  };

  // Sync function to trigger resync based on active tab
  const triggerResync = async () => {
    setSyncing(true);
    setSyncResult(null);

    try {
      let response;

      switch (activeTab) {
        case 'daily':
          response = await hopeCloudService.resyncStationsDailyStats({
            stationIds: [parseInt(stationId)]
          });
          break;
        case 'monthly':
          response = await hopeCloudService.resyncStationsMonthlyStats({
            stationIds: [parseInt(stationId)]
          });
          break;
        case 'yearly':
          response = await hopeCloudService.resyncStationsYearlyStats({
            stationIds: [parseInt(stationId)]
          });
          break;
      }

      setSyncResult(response);

      if (response.status === 'success') {
        message.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} sync completed successfully!`);
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
      const currentRange = getCurrentDateRange();
      const startDate = currentRange.startDate.format('YYYY-MM-DD');
      const endDate = currentRange.endDate.format('YYYY-MM-DD');

      const params = new URLSearchParams({
        siteId: stationId,
        startDate,
        endDate
      });

      console.log(`🔍 Database API Call: /api/site-kpis?${params.toString()}`);
      response = await apiClient.get(`/api/site-kpis?${params.toString()}`);

      if (response?.data && Array.isArray(response.data)) {
        let filteredRecords = [];

        if (activeTab === 'daily') {
          // Filter to only get daily records (stored at 12:00:00 UTC)
          filteredRecords = response.data.filter(item => {
            const measuredAt = item?.measuredAt || '';
            return measuredAt.includes('T12:00:00');
          });
        } else if (activeTab === 'monthly') {
          // For monthly data: get one record per month
          // Complete months are stored at 00:00:00 on the 1st of next month
          // For ongoing month, take the latest record
          const monthlyMap = new Map();

          response.data.forEach(item => {
            if (item?.monthlyYieldKwh && parseFloat(item.monthlyYieldKwh) > 0) {
              const month = item.measuredAt.substring(0, 7); // YYYY-MM
              const existing = monthlyMap.get(month);

              // Keep the record at 00:00:00 on 1st of next month, or latest if ongoing
              if (!existing ||
                  item.measuredAt.includes('T00:00:00.000Z') ||
                  new Date(item.measuredAt) > new Date(existing.measuredAt)) {
                monthlyMap.set(month, item);
              }
            }
          });

          // Fill in missing months with zero values
          const startMonth = dayjs(currentRange.startDate);
          const endMonth = dayjs(currentRange.endDate);
          let currentMonth = startMonth;

          while (currentMonth.isBefore(endMonth) || currentMonth.isSame(endMonth, 'month')) {
            const monthKey = currentMonth.format('YYYY-MM');
            if (!monthlyMap.has(monthKey)) {
              monthlyMap.set(monthKey, {
                measuredAt: currentMonth.format('YYYY-MM-01T00:00:00.000Z'),
                monthlyYieldKwh: '0',
                dailyYieldKwh: '0',
                yearlyYieldKwh: '0',
                currentPowerKw: '0'
              });
            }
            currentMonth = currentMonth.add(1, 'month');
          }

          filteredRecords = Array.from(monthlyMap.values());
        } else if (activeTab === 'yearly') {
          // For yearly data: get one record per year (similar logic to monthly)
          const yearlyMap = new Map();

          response.data.forEach(item => {
            if (item?.yearlyYieldKwh && parseFloat(item.yearlyYieldKwh) > 0) {
              const year = item.measuredAt.substring(0, 4); // YYYY
              const existing = yearlyMap.get(year);

              if (!existing ||
                  item.measuredAt.includes('T00:00:00.000Z') ||
                  new Date(item.measuredAt) > new Date(existing.measuredAt)) {
                yearlyMap.set(year, item);
              }
            }
          });

          // Fill in missing years with zero values
          const startYear = dayjs(currentRange.startDate).year();
          const endYear = dayjs(currentRange.endDate).year();

          for (let year = startYear; year <= endYear; year++) {
            const yearKey = year.toString();
            if (!yearlyMap.has(yearKey)) {
              yearlyMap.set(yearKey, {
                measuredAt: `${year}-01-01T00:00:00.000Z`,
                yearlyYieldKwh: '0',
                monthlyYieldKwh: '0',
                dailyYieldKwh: '0',
                currentPowerKw: '0'
              });
            }
          }

          filteredRecords = Array.from(yearlyMap.values());
        }

        // Sort by date ascending (oldest first) for proper chart display
        const sortedRecords = filteredRecords.sort((a, b) => {
          return new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime();
        });

        console.log(`📊 ${activeTab} Database API: ${response.data.length} total records, ${sortedRecords.length} ${activeTab} records`);
        console.log(`📅 Date range:`, {
          first: sortedRecords[0]?.measuredAt,
          last: sortedRecords[sortedRecords.length - 1]?.measuredAt
        });
        console.log(`📝 Sample data:`, sortedRecords.slice(0, 3).map(r => ({
          date: r.measuredAt,
          daily: r.dailyYieldKwh,
          monthly: r.monthlyYieldKwh,
          yearly: r.yearlyYieldKwh
        })));

        setStatsData(sortedRecords);
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

  // Effect for stats data (when activeTab or date range changes)
  useEffect(() => {
    fetchStatsData();
  }, [activeTab, dailyDateRange, monthlyDateRange, yearlyDateRange, stationId]);

  // Data processing function
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

  // Tab items for sync data (daily, monthly, yearly only)
  const tabItems = [
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
                value={[getCurrentDateRange().startDate, getCurrentDateRange().endDate]}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setCurrentDateRange({
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
                  onClick={triggerResync}
                  loading={syncing}
                >
                  Sync {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
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
                  {activeTab === 'daily' ? (
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any) => [`${value} kWh`, 'Energy']}
                        labelFormatter={(label) => `Date: ${label}`}
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
                  ) : (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any) => [`${value} kWh`, 'Energy']}
                        labelFormatter={(label) => `${activeTab === 'monthly' ? 'Month' : 'Year'}: ${label}`}
                      />
                      <Legend />
                      <Bar
                        dataKey="energy"
                        fill="#52c41a"
                        name="Energy (kWh)"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  )}
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
  };

  return (
    <div style={{ padding: '16px' }}>
      <Alert
        message="HopeCloud Synced Data - Historical Analysis"
        description={`Station ${stationId} - Showing ${activeTab} statistics synced from HopeCloud. Daily data at 12:00 noon, monthly data on 1st of next month, yearly data on Jan 1st. Use the sync button to refresh with latest data.`}
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