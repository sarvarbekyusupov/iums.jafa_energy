import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Button, Spin, message, Row, Col, Statistic, Alert } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ReloadOutlined, ThunderboltOutlined, RiseOutlined } from '@ant-design/icons';
import { hopeCloudService } from '../service';
import type { HopeCloudStationHistoricalPower } from '../types/hopecloud';
import dayjs from 'dayjs';

interface HopeCloudStationHistoryProps {
  stationId: string;
  stationName?: string;
}

interface ChartDataPoint {
  time: string;
  power: number;
}

const HopeCloudStationHistory: React.FC<HopeCloudStationHistoryProps> = ({ 
  stationId, 
  stationName 
}) => {
  const [historicalData, setHistoricalData] = useState<HopeCloudStationHistoricalPower[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = dayjs();
    console.log('Station History initializing with date:', today.format('YYYY-MM-DD'));
    return today;
  });

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

  useEffect(() => {
    fetchHistoricalData();
  }, [stationId, selectedDate]);

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

  const statistics = getStatistics();
  const chartData = prepareChartData();

  return (
    <div>
      <Card
        title={`Historical Power Data - ${stationName || stationId}`}
        extra={
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
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
        }
      >
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
            <div style={{ marginTop: 16 }}>Loading historical data...</div>
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
                  Power Output - {selectedDate.format('YYYY-MM-DD')}
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
                <LineChart data={chartData}>
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
                  <Line
                    type="monotone"
                    dataKey="power"
                    stroke="#1890ff"
                    name="Power (kW)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <div>No historical data available for {selectedDate.format('YYYY-MM-DD')}</div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default HopeCloudStationHistory;