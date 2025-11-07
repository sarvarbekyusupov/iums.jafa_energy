import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, DatePicker, message, Button, Space, Typography, Spin, Empty, Row, Col, Statistic } from 'antd';
import {
  ArrowLeftOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Line } from '@ant-design/charts';
import dayjs, { Dayjs } from 'dayjs';
import solisCloudService from '../../../service/soliscloud.service';

const { Title, Text } = Typography;

const EPMChartsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('day');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [dayData, setDayData] = useState<any[]>([]);
  const [monthData, setMonthData] = useState<any[]>([]);
  const [yearData, setYearData] = useState<any[]>([]);
  const [allYearsData, setAllYearsData] = useState<any[]>([]);
  const [sn, setSn] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchEPMDetail();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, activeTab, selectedDate]);

  const fetchEPMDetail = async () => {
    if (!id) return;
    try {
      const detail = await solisCloudService.getEPMDetail({ id });
      setSn(detail.sn || '');
    } catch (error: any) {
      console.error('Failed to fetch EPM detail:', error);
    }
  };

  const fetchData = async () => {
    if (!id) return;

    try {
      setLoading(true);

      if (activeTab === 'day') {
        const response = await solisCloudService.getEPMDayData({
          id,
          time: selectedDate.format('YYYY-MM-DD'),
        });

        const chartData: any[] = [];
        response?.forEach((record: any) => {
          chartData.push(
            { time: record.dataTimestamp, type: 'PAC', value: record.pac || 0 },
            { time: record.dataTimestamp, type: 'Family Load', value: record.familyLoadPower || 0 },
            { time: record.dataTimestamp, type: 'Active Power', value: record.activePower || 0 }
          );
        });
        setDayData(chartData);

      } else if (activeTab === 'month') {
        const response = await solisCloudService.getEPMMonthData({
          id,
          month: selectedDate.format('YYYY-MM'),
        });

        const chartData: any[] = [];
        response?.forEach((record: any) => {
          chartData.push(
            { time: record.date, type: 'Daily Energy', value: record.dayEnergy || 0 },
            { time: record.date, type: 'Daily Consumption', value: record.dayConsumption || 0 }
          );
        });
        setMonthData(chartData);

      } else if (activeTab === 'year') {
        if (!sn) return;
        const response = await solisCloudService.getEpmYearData({
          sn,
          year: selectedDate.format('YYYY'),
        });

        const chartData: any[] = [];
        response?.forEach((record: any) => {
          chartData.push(
            { time: record.dateStr, type: 'Energy', value: record.energy || 0 },
            { time: record.dateStr, type: 'Sell Energy', value: record.epmSellEnergy || 0 },
            { time: record.dateStr, type: 'Buy Energy', value: record.epmBuyEnergy || 0 }
          );
        });
        setYearData(chartData);

      } else if (activeTab === 'all-years') {
        if (!sn) return;
        const response = await solisCloudService.getEpmAllYears({ sn });

        const chartData: any[] = [];
        response?.forEach((record: any) => {
          chartData.push(
            { time: record.year.toString(), type: 'Produced', value: record.produceEnergy || 0 },
            { time: record.year.toString(), type: 'Consumed', value: record.consumeEnergy || 0 },
            { time: record.year.toString(), type: 'Sold', value: record.epmSellEnergy || 0 },
            { time: record.year.toString(), type: 'Purchased', value: record.epmBuyEnergy || 0 }
          );
        });
        setAllYearsData(chartData);
      }

    } catch (error: any) {
      console.error('Chart data fetch error:', error);
      message.error(error?.response?.data?.msg || 'Failed to fetch chart data');
    } finally {
      setLoading(false);
    }
  };

  const getChartConfig = (data: any[]) => ({
    data,
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

  const getCurrentData = () => {
    if (activeTab === 'day') return dayData;
    if (activeTab === 'month') return monthData;
    if (activeTab === 'year') return yearData;
    return allYearsData;
  };

  const getDatePickerMode = () => {
    if (activeTab === 'day') return undefined;
    if (activeTab === 'month') return 'month';
    if (activeTab === 'year') return 'year';
    return undefined;
  };

  const getDateFormat = () => {
    if (activeTab === 'day') return 'YYYY-MM-DD';
    if (activeTab === 'month') return 'YYYY-MM';
    if (activeTab === 'year') return 'YYYY';
    return 'YYYY';
  };

  const calculateStats = () => {
    const data = getCurrentData();
    if (!data || data.length === 0) return { total: 0, avg: 0, max: 0 };

    const values = data.map(d => d.value);
    return {
      total: values.reduce((sum, v) => sum + v, 0).toFixed(2),
      avg: (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2),
      max: Math.max(...values).toFixed(2),
    };
  };

  const stats = calculateStats();

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
                onClick={() => navigate(`/admin/soliscloud/epm/${id}`)}
                
              >
                Back to Details
              </Button>
              <LineChartOutlined style={{ fontSize: 32 }} />
              <Title level={2} style={{ margin: 0 }}>
                EPM Performance Charts
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
            Analyze EPM performance over time
          </Text>
        </Space>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={activeTab === 'day' ? 'Total Power' : 'Total Energy'}
              value={stats.total}
              suffix={activeTab === 'day' ? 'kW' : 'kWh'}
              prefix={<ThunderboltOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Average"
              value={stats.avg}
              suffix={activeTab === 'day' ? 'kW' : 'kWh'}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Peak"
              value={stats.max}
              suffix={activeTab === 'day' ? 'kW' : 'kWh'}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Card>
        {activeTab !== 'all-years' && (
          <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
            <DatePicker
              value={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              picker={getDatePickerMode() as any}
              format={getDateFormat()}
              allowClear={false}
            />
          </Space>
        )}

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'day',
              label: 'Day View (5-min intervals)',
              children: loading ? (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                  <Spin size="large" tip="Loading day data..." />
                </div>
              ) : dayData.length > 0 ? (
                <div style={{ height: 500 }}>
                  <Line {...getChartConfig(dayData)} />
                </div>
              ) : (
                <Empty description="No data available for this day" />
              ),
            },
            {
              key: 'month',
              label: 'Month View (daily)',
              children: loading ? (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                  <Spin size="large" tip="Loading month data..." />
                </div>
              ) : monthData.length > 0 ? (
                <div style={{ height: 500 }}>
                  <Line {...getChartConfig(monthData)} />
                </div>
              ) : (
                <Empty description="No data available for this month" />
              ),
            },
            {
              key: 'year',
              label: 'Year View (monthly)',
              children: loading ? (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                  <Spin size="large" tip="Loading year data..." />
                </div>
              ) : yearData.length > 0 ? (
                <div style={{ height: 500 }}>
                  <Line {...getChartConfig(yearData)} />
                </div>
              ) : (
                <Empty description="No data available for this year" />
              ),
            },
            {
              key: 'all-years',
              label: 'All Years (historical)',
              children: loading ? (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                  <Spin size="large" tip="Loading historical data..." />
                </div>
              ) : allYearsData.length > 0 ? (
                <div style={{ height: 500 }}>
                  <Line {...getChartConfig(allYearsData)} />
                </div>
              ) : (
                <Empty description="No historical data available" />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default EPMChartsPage;
