import React, { useState, useEffect } from 'react';
import {
  Modal,
  Card,
  Row,
  Col,
  Button,
  DatePicker,
  Space,
  Statistic,
  Table,
  message,
  Spin,
  Empty,
} from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  BuildOutlined,
  TrophyOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import { hopeCloudService } from '../service';

const { RangePicker } = DatePicker;

interface StatsData {
  time: string;
  kwh: number;
  kwhUnit: string;
  earnings: number;
  earningsUnit: string;
}

interface StatisticsDashboardProps {
  open: boolean;
  onClose: () => void;
  stationId?: string;
  equipmentSn?: string;
  title?: string;
}

const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({
  open,
  onClose,
  stationId,
  equipmentSn,
  title = 'Statistics Dashboard'
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [loading, setLoading] = useState(false);
  const [stationData, setStationData] = useState<StatsData[]>([]);
  const [equipmentData, setEquipmentData] = useState<StatsData[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(10, 'day'),
    dayjs()
  ]);

  // Extract data from different API response structures
  const extractStatsData = (response: any, apiType: 'station' | 'equipment'): StatsData[] => {
    if (!response || !response.data) return [];

    if (apiType === 'equipment') {
      // Equipment APIs: daily/monthly have nested result, yearly is direct array  
      if (response.data.result && Array.isArray(response.data.result)) {
        return response.data.result; // Daily/Monthly
      } else if (Array.isArray(response.data)) {
        return response.data; // Yearly
      }
      return [];
    } else {
      // Station APIs: check if it's nested or direct array
      if (response.data.result && Array.isArray(response.data.result)) {
        return response.data.result; // Nested structure
      } else if (Array.isArray(response.data)) {
        return response.data; // Direct array
      }
      return [];
    }
  };

  // Format date range based on timeframe
  const getDateParams = (timeframe: string, range: [dayjs.Dayjs, dayjs.Dayjs]) => {
    const [start, end] = range;
    
    switch (timeframe) {
      case 'daily':
        return {
          startTime: start.format('YYYY-MM-DD'),
          endTime: end.format('YYYY-MM-DD')
        };
      case 'monthly':
        return {
          startTime: start.format('YYYY-MM'),
          endTime: end.format('YYYY-MM')
        };
      case 'yearly':
        return {
          startTime: start.format('YYYY'),
          endTime: end.format('YYYY')
        };
      default:
        return {
          startTime: start.format('YYYY-MM-DD'),
          endTime: end.format('YYYY-MM-DD')
        };
    }
  };

  // Fetch statistics data
  const fetchStats = async () => {
    if (!stationId && !equipmentSn) return;

    setLoading(true);
    const dateParams = getDateParams(activeTab, dateRange);

    try {
      const promises = [];

      // Fetch station data if stationId is provided
      if (stationId) {
        let stationPromise;
        switch (activeTab) {
          case 'daily':
            stationPromise = hopeCloudService.getStationDailyStats(stationId, dateParams);
            break;
          case 'monthly':
            stationPromise = hopeCloudService.getStationMonthlyStats(stationId, dateParams);
            break;
          case 'yearly':
            stationPromise = hopeCloudService.getStationYearlyStats(stationId, dateParams);
            break;
        }
        promises.push(stationPromise);
      }

      // Fetch equipment data if equipmentSn is provided
      if (equipmentSn) {
        let equipmentPromise;
        const equipmentParams = { ...dateParams, type: 'sn' as const };
        switch (activeTab) {
          case 'daily':
            equipmentPromise = hopeCloudService.getEquipmentDailyStats(equipmentSn, equipmentParams);
            break;
          case 'monthly':
            equipmentPromise = hopeCloudService.getEquipmentMonthlyStats(equipmentSn, equipmentParams);
            break;
          case 'yearly':
            equipmentPromise = hopeCloudService.getEquipmentYearlyStats(equipmentSn, equipmentParams);
            break;
        }
        promises.push(equipmentPromise);
      }

      const results = await Promise.allSettled(promises);
      
      const stationIndex = 0;
      const equipmentIndex = stationId ? 1 : 0;

      // Process station results
      if (stationId && results[stationIndex]) {
        const stationResult = results[stationIndex];
        if (stationResult.status === 'fulfilled') {
          const data = extractStatsData(stationResult.value, 'station');
          setStationData(data);
        } else {
          console.error('Station data fetch failed:', stationResult.reason);
          setStationData([]);
        }
      }
      
      // Process equipment results
      if (equipmentSn && results[equipmentIndex]) {
        const equipmentResult = results[equipmentIndex];
        if (equipmentResult.status === 'fulfilled') {
          const data = extractStatsData(equipmentResult.value, 'equipment');
          setEquipmentData(data);
        } else {
          console.error('Equipment data fetch failed:', equipmentResult.reason);
          setEquipmentData([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      message.error('Failed to load statistics data');
      setStationData([]);
      setEquipmentData([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab changes and auto-adjust date ranges
  const handleTabChange = (newTab: 'daily' | 'monthly' | 'yearly') => {
    setActiveTab(newTab);
    
    // Set reasonable default date ranges based on timeframe
    switch (newTab) {
      case 'daily':
        setDateRange([dayjs().subtract(10, 'day'), dayjs()]); // Last 10 days
        break;
      case 'monthly':
        setDateRange([dayjs().subtract(6, 'month').startOf('month'), dayjs().endOf('month')]); // Last 6 months
        break;
      case 'yearly':
        setDateRange([dayjs().subtract(2, 'year').startOf('year'), dayjs().endOf('year')]); // Last 2 years
        break;
    }
  };

  useEffect(() => {
    if (open) {
      fetchStats();
    }
  }, [activeTab, dateRange, open, stationId, equipmentSn]);

  // Calculate totals and statistics
  const calculateStats = (data: StatsData[]) => {
    if (data.length === 0) return { total: 0, average: 0, peak: 0 };
    
    const total = data.reduce((sum, item) => sum + item.kwh, 0);
    const average = total / data.length;
    const peak = Math.max(...data.map(item => item.kwh));
    
    return { total, average, peak };
  };

  const stationStats = calculateStats(stationData);
  const equipmentStats = calculateStats(equipmentData);

  // Prepare chart data
  const chartData = stationData.map((stationItem, index) => {
    const equipmentItem = equipmentData[index];
    let timeFormat = 'MM-DD';
    
    if (activeTab === 'yearly') {
      timeFormat = 'YYYY';
    } else if (activeTab === 'monthly') {
      timeFormat = 'MMM YYYY';
    } else if (activeTab === 'daily') {
      timeFormat = 'MM-DD';
    }
    
    return {
      time: dayjs(stationItem.time).format(timeFormat),
      station: stationItem.kwh,
      equipment: equipmentItem ? equipmentItem.kwh : 0
    };
  });

  // If only equipment data exists, use equipment data for chart
  const finalChartData = chartData.length > 0 ? chartData : 
    equipmentData.map(item => {
      let timeFormat = 'MM-DD';
      
      if (activeTab === 'yearly') {
        timeFormat = 'YYYY';
      } else if (activeTab === 'monthly') {
        timeFormat = 'MMM YYYY';
      } else if (activeTab === 'daily') {
        timeFormat = 'MM-DD';
      }
      
      return {
        time: dayjs(item.time).format(timeFormat),
        station: 0,
        equipment: item.kwh
      };
    });

  // Table columns for detailed view
  const tableColumns = [
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      render: (time: string) => {
        try {
          if (activeTab === 'yearly') {
            const date = dayjs(time);
            return date.isValid() ? date.format('YYYY') : time;
          }
          if (activeTab === 'monthly') {
            const date = dayjs(time);
            return date.isValid() ? date.format('MMM YYYY') : time;
          }
          const date = dayjs(time);
          return date.isValid() ? date.format('MM-DD') : time;
        } catch {
          return time || 'N/A';
        }
      }
    },
    ...(stationId ? [{
      title: 'Station (kWh)',
      dataIndex: 'stationKwh',
      key: 'stationKwh',
      render: (value: number) => value?.toFixed(2) || '0.00'
    }] : []),
    ...(equipmentSn ? [{
      title: 'Equipment (kWh)',
      dataIndex: 'equipmentKwh',
      key: 'equipmentKwh',
      render: (value: number) => value?.toFixed(2) || '0.00'
    }] : []),
    {
      title: 'Earnings',
      dataIndex: 'earnings',
      key: 'earnings',
      render: (value: number, record: any) => `${value?.toFixed(2) || '0.00'} ${record.earningsUnit || 'CNY'}`
    }
  ];

  // Table data source
  const tableData = finalChartData.map((item, index) => ({
    key: index,
    time: item.time,
    stationKwh: item.station,
    equipmentKwh: item.equipment,
    earnings: 0, // This would come from API data
    earningsUnit: 'CNY'
  }));

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BarChartOutlined style={{ marginRight: 8 }} />
          {title}
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width="95%"
      style={{ top: 20 }}
      styles={{ body: { padding: 24 } }}
    >
      <Spin spinning={loading}>
        {/* Controls */}
        <Row gutter={16} align="middle">
          <Col>
            <Space.Compact>
              <Button 
                type={activeTab === 'daily' ? 'primary' : 'default'}
                icon={<CalendarOutlined />}
                onClick={() => handleTabChange('daily')}
              >
                Daily
              </Button>
              <Button 
                type={activeTab === 'monthly' ? 'primary' : 'default'}
                icon={<BarChartOutlined />}
                onClick={() => handleTabChange('monthly')}
              >
                Monthly
              </Button>
              <Button 
                type={activeTab === 'yearly' ? 'primary' : 'default'}
                icon={<LineChartOutlined />}
                onClick={() => handleTabChange('yearly')}
              >
                Yearly
              </Button>
            </Space.Compact>
          </Col>
          <Col>
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && setDateRange([dates[0]!, dates[1]!])}
              picker={activeTab === 'yearly' ? 'year' : activeTab === 'monthly' ? 'month' : 'date'}
            />
          </Col>
          <Col>
            <Button icon={<BarChartOutlined />} onClick={fetchStats} loading={loading}>
              Refresh
            </Button>
          </Col>
          <Col flex="auto" />
          <Col>
            <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
          </Col>
        </Row>

        {/* Statistics Cards */}
        <Row gutter={16} style={{ marginTop: 16 }}>
          {stationId && (
            <>
              <Col span={stationId && equipmentSn ? 6 : 8}>
                <Card size="small" style={{ background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)' }}>
                  <Statistic
                    title="Station Total"
                    value={stationStats.total}
                    suffix="kWh"
                    precision={2}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<ThunderboltOutlined />}
                  />
                </Card>
              </Col>
              <Col span={stationId && equipmentSn ? 6 : 8}>
                <Card size="small" style={{ background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)' }}>
                  <Statistic
                    title="Station Average"
                    value={stationStats.average}
                    suffix={`kWh/${activeTab}`}
                    precision={2}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<BarChartOutlined />}
                  />
                </Card>
              </Col>
              <Col span={stationId && equipmentSn ? 6 : 8}>
                <Card size="small" style={{ background: 'linear-gradient(135deg, #fff2e6 0%, #ffd591 100%)' }}>
                  <Statistic
                    title="Station Peak"
                    value={stationStats.peak}
                    suffix="kWh"
                    precision={2}
                    valueStyle={{ color: '#fa8c16' }}
                    prefix={<TrophyOutlined />}
                  />
                </Card>
              </Col>
            </>
          )}
          {equipmentSn && (
            <>
              <Col span={stationId && equipmentSn ? 6 : 8}>
                <Card size="small" style={{ background: 'linear-gradient(135deg, #f9f0ff 0%, #d3adf7 100%)' }}>
                  <Statistic
                    title="Equipment Total"
                    value={equipmentStats.total}
                    suffix="kWh"
                    precision={2}
                    valueStyle={{ color: '#722ed1' }}
                    prefix={<BuildOutlined />}
                  />
                </Card>
              </Col>
              <Col span={stationId && equipmentSn ? 6 : 8}>
                <Card size="small" style={{ background: 'linear-gradient(135deg, #fffbf0 0%, #ffe7ba 100%)' }}>
                  <Statistic
                    title="Equipment Average"
                    value={equipmentStats.average}
                    suffix={`kWh/${activeTab}`}
                    precision={2}
                    valueStyle={{ color: '#fa541c' }}
                    prefix={<CalendarOutlined />}
                  />
                </Card>
              </Col>
              <Col span={stationId && equipmentSn ? 6 : 8}>
                <Card size="small" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #bfdbfe 100%)' }}>
                  <Statistic
                    title="Equipment Peak"
                    value={equipmentStats.peak}
                    suffix="kWh"
                    precision={2}
                    valueStyle={{ color: '#1677ff' }}
                    prefix={<TrophyOutlined />}
                  />
                </Card>
              </Col>
            </>
          )}
        </Row>

        {/* Chart */}
        <Card 
          title={<><LineChartOutlined /> Energy Production Trend</>} 
          size="small"
          style={{ marginTop: 16 }}
        >
          {finalChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart 
                data={finalChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.7} />
                <XAxis 
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#d9d9d9' }}
                  axisLine={{ stroke: '#d9d9d9' }}
                />
                <YAxis 
                  label={{ 
                    value: 'Energy (kWh)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }}
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#d9d9d9' }}
                  axisLine={{ stroke: '#d9d9d9' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name) => {
                    const powerName = name === 'station' ? 'Station' : 'Equipment';
                    return [`${parseFloat(String(value)).toFixed(2)} kWh`, powerName];
                  }}
                  labelFormatter={(label) => `Period: ${label}`}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="line" />
                {stationId && (
                  <Line
                    type="monotone"
                    dataKey="station"
                    stroke="#1890ff"
                    strokeWidth={2}
                    name="Station"
                    dot={{ r: 3, fill: '#1890ff', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#1890ff', stroke: '#fff', strokeWidth: 2 }}
                    connectNulls={false}
                  />
                )}
                {equipmentSn && (
                  <Line
                    type="monotone"
                    dataKey="equipment"
                    stroke="#722ed1"
                    strokeWidth={2}
                    name="Equipment"
                    dot={{ r: 3, fill: '#722ed1', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#722ed1', stroke: '#fff', strokeWidth: 2 }}
                    connectNulls={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Empty description="No data available for the selected period" />
          )}
        </Card>

        {/* Detailed Table */}
        <Card title={<><BarChartOutlined /> Detailed Statistics</>} size="small" style={{ marginTop: 16 }}>
          <Table
            columns={tableColumns}
            dataSource={tableData}
            size="small"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
          />
        </Card>
      </Spin>
    </Modal>
  );
};

export default StatisticsDashboard;