import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, DatePicker, message, Button, Space, Typography, Spin, Empty, Row, Col, Statistic, Progress } from 'antd';
import {
  ArrowLeftOutlined,
  LineChartOutlined,
  WifiOutlined,
  SyncOutlined,
  SignalFilled,
} from '@ant-design/icons';
import { Line } from '@ant-design/charts';
import dayjs, { Dayjs } from 'dayjs';
import solisCloudService from '../../../service/soliscloud.service';

const { Title, Text } = Typography;

const CollectorDiagnosticsPage: React.FC = () => {
  const { sn } = useParams<{ sn: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (sn) {
      fetchData();
    }
  }, [sn, selectedDate]);

  const fetchData = async () => {
    if (!sn) return;

    try {
      setLoading(true);
      const response = await solisCloudService.getCollectorDayData({
        sn,
        time: selectedDate.format('YYYY-MM-DD'),
        timeZone: 8, // GMT+8
      });

      const transformedData: any[] = [];
      response?.forEach((record: any) => {
        transformedData.push(
          { time: record.dataTimestamp, type: 'Signal Strength', value: record.signalStrength || 0 },
          { time: record.dataTimestamp, type: 'Data Quality', value: record.dataQuality || 0 }
        );
      });
      setChartData(transformedData);

    } catch (error: any) {
      console.error('Collector data fetch error:', error);
      message.error(error?.response?.data?.msg || 'Failed to fetch collector data');
    } finally {
      setLoading(false);
    }
  };

  const getChartConfig = () => ({
    data: chartData,
    xField: 'time',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    xAxis: {
      type: 'time' as const,
      label: {
        autoRotate: true,
        autoHide: true,
      },
    },
    yAxis: {
      label: {
        formatter: (v: string) => `${v}`,
      },
      max: 100,
      min: 0,
    },
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      shared: true,
      showCrosshairs: true,
    },
    point: {
      size: 3,
      shape: 'circle',
    },
  });

  const calculateStats = () => {
    if (!chartData || chartData.length === 0) return { avgSignal: 0, minSignal: 0, maxSignal: 0 };

    const signalData = chartData.filter(d => d.type === 'Signal Strength');
    const values = signalData.map(d => d.value);

    if (values.length === 0) return { avgSignal: 0, minSignal: 0, maxSignal: 0 };

    return {
      avgSignal: (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(1),
      minSignal: Math.min(...values).toFixed(1),
      maxSignal: Math.max(...values).toFixed(1),
    };
  };

  const stats = calculateStats();

  const getSignalStatus = (signal: number) => {
    if (signal >= 80) return { text: 'Excellent', color: '#52c41a' };
    if (signal >= 60) return { text: 'Good', color: '#1890ff' };
    if (signal >= 40) return { text: 'Fair', color: '#faad14' };
    return { text: 'Poor', color: '#ff4d4f' };
  };

  const signalStatus = getSignalStatus(Number(stats.avgSignal));

  return (
    <div>
      {/* Header */}
      <Card
        style={{
          marginBottom: 24,
          
          border: 'none',
        }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Space style={{ justifyContent: 'space-between', width: '100%' }}>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(`/admin/soliscloud/collectors`)}
                
              >
                Back to List
              </Button>
              <LineChartOutlined style={{ fontSize: 32 }} />
              <Title level={2} style={{ margin: 0 }}>
                Collector Signal Diagnostics
              </Title>
            </Space>
            <Button
              icon={<SyncOutlined />}
              onClick={fetchData}
              loading={loading}
              
            >
              Refresh
            </Button>
          </Space>
          <Text style={{ color: 'rgba(0,0,0,0.65)' }}>
            Serial Number: {sn}
          </Text>
        </Space>
      </Card>

      {/* Signal Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Average Signal"
              value={stats.avgSignal}
              suffix="%"
              prefix={<SignalFilled style={{ color: signalStatus.color }} />}
              valueStyle={{ color: signalStatus.color }}
            />
            <Text type="secondary">{signalStatus.text}</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Peak Signal"
              value={stats.maxSignal}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Minimum Signal"
              value={stats.minSignal}
              suffix="%"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">Signal Quality</Text>
              <Progress
                percent={Number(stats.avgSignal)}
                strokeColor={signalStatus.color}
                status="active"
              />
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Signal Chart */}
      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <DatePicker
            value={selectedDate}
            onChange={(date) => date && setSelectedDate(date)}
            format="YYYY-MM-DD"
            allowClear={false}
          />
        </Space>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" tip="Loading signal data..." />
          </div>
        ) : chartData.length > 0 ? (
          <div style={{ height: 500 }}>
            <Line {...getChartConfig()} />
          </div>
        ) : (
          <Empty description="No signal data available for this day" />
        )}
      </Card>
    </div>
  );
};

export default CollectorDiagnosticsPage;
