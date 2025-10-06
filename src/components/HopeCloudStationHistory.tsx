import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Button, Spin, message, Row, Col, Statistic, Alert, Tabs } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { ReloadOutlined, ThunderboltOutlined, RiseOutlined, ClockCircleOutlined, CalendarOutlined, BarChartOutlined } from '@ant-design/icons';
import { hopeCloudService } from '../service';
import type { HopeCloudStationHistoricalPower, HopeCloudStatistics } from '../types/hopecloud';
import dayjs from 'dayjs';

interface HopeCloudStationHistoryProps {
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
  efficiency?: number;
}

type ViewType = 'hourly' | 'daily' | 'monthly' | 'yearly';

const HopeCloudStationHistory: React.FC<HopeCloudStationHistoryProps> = ({
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

  // Separate date ranges for each tab to prevent conflicts
  const [dailyDateRange, setDailyDateRange] = useState(() => {
    const endDate = dayjs();
    const startDate = endDate.subtract(30, 'days');
    return { startDate, endDate };
  });

  const [monthlyDateRange, setMonthlyDateRange] = useState(() => {
    const endDate = dayjs();
    const startDate = endDate.subtract(12, 'months');
    return { startDate, endDate };
  });

  const [yearlyDateRange, setYearlyDateRange] = useState(() => {
    const endDate = dayjs();
    const startDate = endDate.subtract(5, 'years');
    return { startDate, endDate };
  });

  // Get current date range based on active tab
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

  const setCurrentDateRange = (range: { startDate: dayjs.Dayjs; endDate: dayjs.Dayjs }) => {
    switch (activeTab) {
      case 'daily':
        setDailyDateRange(range);
        break;
      case 'monthly':
        setMonthlyDateRange(range);
        break;
      case 'yearly':
        setYearlyDateRange(range);
        break;
    }
  };

  const fetchHistoricalData = async () => {
    if (!stationId) return;
    
    setLoading(true);
    setError(null);

    try {
      const dateString = selectedDate.format('YYYY-MM-DD');
      const response = await hopeCloudService.getStationHistoricalPower(stationId, dateString);
      
      if (response.status === 'success' && response.data) {
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

  const fetchStatsData = async () => {
    if (!stationId) return;

    setStatsLoading(true);
    setStatsError(null);

    try {
      let response;
      let filters;
      const currentRange = getCurrentDateRange();

      // Use user-selected date range but format appropriately for each tab
      switch (activeTab) {
        case 'daily':
          filters = {
            startTime: currentRange.startDate.format('YYYY-MM-DD'),
            endTime: currentRange.endDate.format('YYYY-MM-DD'),
          };
          response = await hopeCloudService.getStationDailyStats(stationId, filters);
          break;
        case 'monthly':
          filters = {
            startTime: currentRange.startDate.format('YYYY-MM'),
            endTime: currentRange.endDate.format('YYYY-MM'),
          };
          console.log('Monthly date range:', filters);
          response = await hopeCloudService.getStationMonthlyStats(stationId, filters);
          break;
        case 'yearly':
          filters = {
            startTime: currentRange.startDate.format('YYYY'),
            endTime: currentRange.endDate.format('YYYY'),
          };
          response = await hopeCloudService.getStationYearlyStats(stationId, filters);
          break;
        default:
          filters = {
            startTime: currentRange.startDate.format('YYYY-MM-DD'),
            endTime: currentRange.endDate.format('YYYY-MM-DD'),
          };
          response = await hopeCloudService.getStationDailyStats(stationId, filters);
      }

      if (response.status === 'success' && response.data) {
        console.log(`${activeTab} API Response:`, response.data);
        setStatsData(response.data);
      } else {
        throw new Error('Failed to fetch station statistics');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch station statistics';
      setStatsError(errorMessage);
      message.error(errorMessage);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch data when tab changes or stationId changes
  useEffect(() => {
    if (activeTab === 'hourly') {
      fetchHistoricalData();
    } else {
      fetchStatsData();
    }
  }, [stationId, activeTab]);

  // Fetch hourly data when selectedDate changes
  useEffect(() => {
    if (activeTab === 'hourly') {
      fetchHistoricalData();
    }
  }, [selectedDate]);

  // Fetch stats data when date ranges change
  useEffect(() => {
    if (activeTab === 'daily') {
      fetchStatsData();
    }
  }, [dailyDateRange]);

  useEffect(() => {
    if (activeTab === 'monthly') {
      fetchStatsData();
    }
  }, [monthlyDateRange]);

  useEffect(() => {
    if (activeTab === 'yearly') {
      fetchStatsData();
    }
  }, [yearlyDateRange]);

  const prepareChartData = (): ChartDataPoint[] => {
    return historicalData.map(item => ({
      time: dayjs(item.time).format('HH:mm'),
      power: item.nowKw
    }));
  };

  const getStatistics = () => {
    if (!historicalData.length) return null;

    const peakPower = Math.max(...historicalData.map(d => d.nowKw));
    const totalDailyGeneration = historicalData.reduce((sum, d) => sum + d.nowKw, 0);
    const avgPower = historicalData.reduce((sum, d) => sum + d.nowKw, 0) / historicalData.length;

    return {
      peakPower,
      totalDailyGeneration,
      avgPower
    };
  };

  const prepareStatsData = (): StatsDataPoint[] => {
    const result = statsData
      .map((item: any) => {
        let timeFormat = '';
        // The API returns 'time' field instead of 'collectTime'
        switch (activeTab) {
          case 'hourly':
            timeFormat = dayjs(item.time).format('HH:mm');
            break;
          case 'daily':
            timeFormat = dayjs(item.time).format('MMM DD');
            break;
          case 'monthly':
            timeFormat = dayjs(item.time).format('MMM YYYY');
            break;
          case 'yearly':
            timeFormat = dayjs(item.time).format('YYYY');
            break;
          default:
            timeFormat = dayjs(item.time).format('MMM DD');
        }

        return {
          time: timeFormat,
          energy: item.kwh || 0, // API returns 'kwh' field
          power: item.kwh || 0, // Use kwh as power approximation since no separate power field
          efficiency: item.earnings || 0, // Use earnings as efficiency placeholder
        };
      });

    if (activeTab === 'monthly') {
      console.log('Monthly total data count:', result.length);
      console.log('Monthly Chart processed item example:', result[0]);
      console.log('Monthly data with energy:', result.filter(r => r.energy > 0).length);
    }
    return result;
  };

  const getStatsStatistics = () => {
    if (!statsData.length) return null;

    // Use the actual API field names
    const totalEnergy = statsData.reduce((sum, d: any) => sum + (d.kwh || 0), 0);
    const avgPower = statsData.reduce((sum, d: any) => sum + (d.kwh || 0), 0) / statsData.length;
    const maxPower = Math.max(...statsData.map((d: any) => d.kwh || 0));

    return {
      totalEnergy,
      avgPower,
      maxPower,
    };
  };

  const statistics = getStatistics();
  const chartData = prepareChartData();
  const statsChartData = prepareStatsData();
  const statsStatistics = getStatsStatistics();

  const renderTabContent = () => {
    if (activeTab === 'hourly') {
      return (
        <div>
          <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
            <DatePicker
              value={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              format="YYYY-MM-DD"
              disabledDate={(current) => current && current > dayjs()}
              style={{ width: 150 }}
            />
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchHistoricalData}
              loading={loading}
            >
              Refresh
            </Button>
          </div>

          {error && (
            <Alert
              message="Error Loading Historical Data"
              description={error}
              type="error"
              style={{ marginBottom: 16 }}
              showIcon
            />
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>Loading hourly data...</div>
            </div>
          ) : historicalData.length > 0 ? (
            <>
              {statistics && (
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={8}>
                    <Card size="small">
                      <Statistic
                        title="Peak Power"
                        value={statistics.peakPower}
                        suffix="kW"
                        prefix={<ThunderboltOutlined />}
                        precision={2}
                        valueStyle={{ color: '#cf1322' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small">
                      <Statistic
                        title="Total Power"
                        value={statistics.totalDailyGeneration}
                        suffix="kW"
                        prefix={<RiseOutlined />}
                        precision={1}
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small">
                      <Statistic
                        title="Average Power"
                        value={statistics.avgPower}
                        suffix="kW"
                        precision={2}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                </Row>
              )}

              <Card
                title={
                  <span>
                    Hourly Power Output - {selectedDate.format('YYYY-MM-DD')}
                    {selectedDate.isSame(dayjs(), 'day') && (
                      <span style={{ color: '#52c41a', marginLeft: 8, fontSize: '12px' }}>
                        (Live Data)
                      </span>
                    )}
                  </span>
                }
                size="small"
              >
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorHourlyPower" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(2)} kW`,
                        name
                      ]}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="power"
                      stroke="#1890ff"
                      fillOpacity={1}
                      fill="url(#colorHourlyPower)"
                      name="Power (kW)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <div>No hourly data available for {selectedDate.format('YYYY-MM-DD')}</div>
            </div>
          )}
        </div>
      );
    } else {
      // Stats tabs (daily, monthly, yearly)
      return (
        <div>
          <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            {activeTab === 'monthly' ? (
              // Month-Year picker for monthly data
              <DatePicker.RangePicker
                value={[monthlyDateRange.startDate, monthlyDateRange.endDate]}
                onChange={(dates) => {
                  if (dates) {
                    setMonthlyDateRange({
                      startDate: dates[0]!,
                      endDate: dates[1]!,
                    });
                  }
                }}
                picker="month"
                format="YYYY-MM"
                placeholder={['Start Month', 'End Month']}
              />
            ) : activeTab === 'yearly' ? (
              // Year picker for yearly data
              <DatePicker.RangePicker
                value={[yearlyDateRange.startDate, yearlyDateRange.endDate]}
                onChange={(dates) => {
                  if (dates) {
                    setYearlyDateRange({
                      startDate: dates[0]!,
                      endDate: dates[1]!,
                    });
                  }
                }}
                picker="year"
                format="YYYY"
                placeholder={['Start Year', 'End Year']}
              />
            ) : (
              // Default date picker for daily data
              <DatePicker.RangePicker
                value={[dailyDateRange.startDate, dailyDateRange.endDate]}
                onChange={(dates) => {
                  if (dates) {
                    setDailyDateRange({
                      startDate: dates[0]!,
                      endDate: dates[1]!,
                    });
                  }
                }}
                format="YYYY-MM-DD"
                placeholder={['Start Date', 'End Date']}
              />
            )}

            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchStatsData}
              loading={statsLoading}
            >
              Refresh
            </Button>
          </div>

          {statsError && (
            <Alert
              message="Error Loading Station Statistics"
              description={statsError}
              type="error"
              style={{ marginBottom: 16 }}
              showIcon
            />
          )}

          {statsLoading ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>Loading {activeTab} statistics...</div>
            </div>
          ) : statsData.length > 0 ? (
            <>
              {statsStatistics && (
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={8}>
                    <Card size="small">
                      <Statistic
                        title="Total Energy"
                        value={statsStatistics.totalEnergy}
                        suffix="kWh"
                        prefix={<ThunderboltOutlined />}
                        precision={1}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small">
                      <Statistic
                        title="Average Power"
                        value={statsStatistics.avgPower}
                        suffix="kW"
                        prefix={<RiseOutlined />}
                        precision={2}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small">
                      <Statistic
                        title="Peak Power"
                        value={statsStatistics.maxPower}
                        suffix="kW"
                        prefix={<BarChartOutlined />}
                        precision={2}
                        valueStyle={{ color: '#cf1322' }}
                      />
                    </Card>
                  </Col>
                </Row>
              )}

              <Card
                title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Statistics - ${stationName || stationId}`}
                size="small"
              >
                <ResponsiveContainer width="100%" height={400}>
                  {activeTab === 'monthly' || activeTab === 'yearly' ? (
                    <BarChart data={statsChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          name.includes('Energy') ? `${value.toFixed(1)} kWh` : `${value.toFixed(2)} kW`,
                          name
                        ]}
                      />
                      <Legend />
                      <Bar
                        dataKey="energy"
                        fill="#52c41a"
                        name="Energy (kWh)"
                      />
                      <Bar
                        dataKey="power"
                        fill="#1890ff"
                        name="Power (kW)"
                      />
                    </BarChart>
                  ) : (
                    <AreaChart data={statsChartData}>
                      <defs>
                        <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#52c41a" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          name.includes('Energy') ? `${value.toFixed(1)} kWh` : `${value.toFixed(2)} kW`,
                          name
                        ]}
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
                      <Area
                        type="monotone"
                        dataKey="power"
                        stroke="#1890ff"
                        fillOpacity={1}
                        fill="url(#colorPower)"
                        name="Power (kW)"
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </Card>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <div>No {activeTab} statistics available for selected period</div>
            </div>
          )}
        </div>
      );
    }
  };

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

  return (
    <div>
      <Card title={`Station History - ${stationName || stationId}`}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as ViewType)}
          items={tabItems}
        />
        <div style={{ marginTop: 16 }}>
          {renderTabContent()}
        </div>
      </Card>
    </div>
  );
};

export default HopeCloudStationHistory;