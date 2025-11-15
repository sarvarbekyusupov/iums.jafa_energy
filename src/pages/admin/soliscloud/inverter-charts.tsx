import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, DatePicker, message, Button, Space, Typography, Spin, Empty, Row, Col, Statistic, Switch, Tag } from 'antd';
import {
  ArrowLeftOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
  SyncOutlined,
  DatabaseOutlined,
  CloudOutlined,
} from '@ant-design/icons';
import { Line } from '@ant-design/charts';
import dayjs, { Dayjs } from 'dayjs';
import solisCloudService from '../../../service/soliscloud.service';

const { Title, Text } = Typography;

const InverterChartsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [useDbSource, setUseDbSource] = useState(false);
  const [activeTab, setActiveTab] = useState('day');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [dayData, setDayData] = useState<any[]>([]);
  const [monthData, setMonthData] = useState<any[]>([]);
  const [yearData, setYearData] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, activeTab, selectedDate, useDbSource]);

  const parseValue = (val: any): number => {
    if (typeof val === 'string') return parseFloat(val) || 0;
    return val || 0;
  };

  const fetchData = async () => {
    if (!id) return;

    try {
      setLoading(true);

      if (activeTab === 'day') {
        let response;
        if (useDbSource) {
          // Use DB API for readings
          response = await solisCloudService.getDbInverterReadings(id, {
            startDate: selectedDate.startOf('day').toISOString(),
            endDate: selectedDate.endOf('day').toISOString(),
            limit: 500,
          });
          response = response.data || response;
        } else {
          response = await solisCloudService.getInverterDayData({
            id,
            time: selectedDate.format('YYYY-MM-DD'),
          });
        }

        // Transform data for chart
        const chartData: any[] = [];
        response?.forEach((record: any) => {
          chartData.push(
            { time: record.dateStr || record.timestamp || record.dataTimestamp, type: 'Energy (kWh)', value: parseValue(record.energy || record.etoday) },
            { time: record.dateStr || record.timestamp || record.dataTimestamp, type: 'Battery Discharge (kWh)', value: parseValue(record.batteryDischargeEnergy) },
            { time: record.dateStr || record.timestamp || record.dataTimestamp, type: 'Battery Charge (kWh)', value: parseValue(record.batteryChargeEnergy) }
          );
        });
        setDayData(chartData);

      } else if (activeTab === 'month') {
        let response;
        if (useDbSource) {
          response = await solisCloudService.getDbInverterMonths(id, { limit: 100 });
          response = (response.data || response).filter((r: any) =>
            r.month && r.month.startsWith(selectedDate.format('YYYY-MM'))
          );
        } else {
          response = await solisCloudService.getInverterMonthData({
            id,
            month: selectedDate.format('YYYY-MM'),
          });
        }

        const chartData: any[] = [];
        response?.forEach((record: any) => {
          chartData.push(
            { time: record.dateStr || record.month, type: 'Daily Energy (kWh)', value: parseValue(record.energy || record.totalEnergy) },
            { time: record.dateStr || record.month, type: 'Consume Energy (kWh)', value: parseValue(record.consumeEnergy) },
            { time: record.dateStr || record.month, type: 'Produce Energy (kWh)', value: parseValue(record.produceEnergy) }
          );
        });
        setMonthData(chartData);

      } else if (activeTab === 'year') {
        let response;
        if (useDbSource) {
          response = await solisCloudService.getDbInverterYears(id, { limit: 10 });
          response = (response.data || response).filter((r: any) =>
            r.year && r.year.startsWith(selectedDate.format('YYYY'))
          );
        } else {
          response = await solisCloudService.getInverterYearData({
            id,
            year: selectedDate.format('YYYY'),
          });
        }

        const chartData: any[] = [];
        response?.forEach((record: any) => {
          chartData.push(
            { time: record.dateStr || record.year, type: 'Monthly Energy (kWh)', value: parseValue(record.energy || record.totalEnergy) },
            { time: record.dateStr || record.year, type: 'Consume Energy (kWh)', value: parseValue(record.consumeEnergy) },
            { time: record.dateStr || record.year, type: 'Produce Energy (kWh)', value: parseValue(record.produceEnergy) }
          );
        });
        setYearData(chartData);
      }

    } catch (error: any) {
      console.error('Chart data fetch error:', error);
      message.error(error?.response?.data?.msg || 'Failed to fetch chart data');
    } finally {
      setLoading(false);
    }
  };

  const getChartConfig = (data: any[]) => {
    return {
      data,
      xField: 'time',
      yField: 'value',
      seriesField: 'type',
      smooth: true,
      color: ['#52c41a', '#1890ff', '#faad14'],
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
    };
  };

  const getCurrentData = () => {
    if (activeTab === 'day') return dayData;
    if (activeTab === 'month') return monthData;
    return yearData;
  };

  const getDatePickerMode = () => {
    if (activeTab === 'day') return undefined;
    if (activeTab === 'month') return 'month';
    return 'year';
  };

  const getDateFormat = () => {
    if (activeTab === 'day') return 'YYYY-MM-DD';
    if (activeTab === 'month') return 'YYYY-MM';
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
                onClick={() => navigate(`/admin/soliscloud/inverters/${id}`)}

              >
                Back to Details
              </Button>
              <LineChartOutlined style={{ fontSize: 32 }} />
              <Title level={2} style={{ margin: 0 }}>
                Historical Data Charts
              </Title>
            </Space>
            <Space>
              <Space>
                <Switch
                  checked={useDbSource}
                  onChange={setUseDbSource}
                  checkedChildren={<DatabaseOutlined />}
                  unCheckedChildren={<CloudOutlined />}
                />
                <Tag color={useDbSource ? 'blue' : 'green'}>
                  {useDbSource ? 'Database' : 'Real-time API'}
                </Tag>
              </Space>
              <Button
                icon={<SyncOutlined />}
                onClick={fetchData}
                loading={loading}

              >
                Refresh
              </Button>
            </Space>
          </Space>
          <Text style={{ color: 'rgba(0,0,0,0.65)' }}>
            View historical performance data and trends
          </Text>
        </Space>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={activeTab === 'day' ? 'Total Energy' : activeTab === 'month' ? 'Total Monthly' : 'Total Yearly'}
              value={stats.total}
              suffix={activeTab === 'day' ? 'kWh' : 'kWh'}
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
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <DatePicker
            value={selectedDate}
            onChange={(date) => date && setSelectedDate(date)}
            picker={getDatePickerMode() as any}
            format={getDateFormat()}
            allowClear={false}
          />
        </Space>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'day',
              label: 'Day View (5-min intervals)',
              children: loading ? (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                  <Spin size="large">
                    <div style={{ paddingTop: 50 }}>Loading day data...</div>
                  </Spin>
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
                  <Spin size="large">
                    <div style={{ paddingTop: 50 }}>Loading month data...</div>
                  </Spin>
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
                  <Spin size="large">
                    <div style={{ paddingTop: 50 }}>Loading year data...</div>
                  </Spin>
                </div>
              ) : yearData.length > 0 ? (
                <div style={{ height: 500 }}>
                  <Line {...getChartConfig(yearData)} />
                </div>
              ) : (
                <Empty description="No data available for this year" />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default InverterChartsPage;
