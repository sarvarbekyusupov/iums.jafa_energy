import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Space, Tag, message, Button, Row, Col, Statistic, Typography, Spin, Progress, DatePicker, Empty, Switch } from 'antd';
import {
  DatabaseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
  SyncOutlined,
  SignalFilled,
  WifiOutlined,
  ApiOutlined,
  CodeOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  LineChartOutlined,
  CloudOutlined,
} from '@ant-design/icons';
import { Line } from '@ant-design/charts';
import dayjs, { Dayjs } from 'dayjs';
import solisCloudService from '../../../service/soliscloud.service';
import { formatSolisTime } from '../../../helpers/solis-units';
import type { CollectorDetail } from '../../../types/soliscloud';

const { Title, Text } = Typography;

// Stored row: our columns on top of the vendor record kept in `detail` (collectorList +
// collectorDetail). The page reads the vendor's keys, so map ours onto them.
const normalizeDbCollector = (row: any): CollectorDetail => {
  const own = Object.fromEntries(Object.entries(row || {}).filter(([k, v]) => k !== 'detail' && v !== null && v !== undefined));
  return {
    ...(row?.detail || {}),
    ...own,
    state: Number(row?.state),
    version: row?.firmwareVersion || row?.detail?.version,
    lastCommunication: row?.lastDataTime ?? row?.detail?.dataTimestamp,
  } as CollectorDetail;
};

// factoryTime is "0" in the document's example and we have no real value to check the unit
// against, so accept both epoch seconds and milliseconds.
const formatFactoryTime = (v: unknown): string | undefined => {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return new Date(n > 1e12 ? n : n * 1000).toLocaleDateString();
};

const present = (v: unknown): boolean => v !== null && v !== undefined && v !== '' && v !== '0';

const CollectorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [useDbSource, setUseDbSource] = useState(false);
  const [detail, setDetail] = useState<CollectorDetail | null>(null);
  const [signalLoading, setSignalLoading] = useState(false);
  const [signalData, setSignalData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id, useDbSource]);

  useEffect(() => {
    if (detail?.sn) {
      fetchSignalData();
    }
  }, [detail?.sn, selectedDate]);

  const fetchDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      if (useDbSource) {
        const response = await solisCloudService.getDbCollector(id);
        setDetail(normalizeDbCollector(response.data || response));
      } else {
        const response = await solisCloudService.getCollectorDetail({ id });
        setDetail({ ...response, lastCommunication: (response as any)?.dataTimestamp } as CollectorDetail);
      }
    } catch (error: any) {
      message.error(error?.response?.data?.msg || 'Failed to fetch collector details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSignalData = async () => {
    if (!detail?.sn) return;

    try {
      setSignalLoading(true);
      const response = await solisCloudService.getCollectorSignal({
        sn: detail.sn,
        time: selectedDate.format('YYYY-MM-DD'),
        timeZone: 5, // the plants are in Tashkent, UTC+5
      });

      const chartData: any[] = [];
      response?.forEach((record: any) => {
        // timeStr is only a clock time ("05:03:07"), which a time axis cannot place on the day;
        // dataTimestamp is the epoch.
        const ms = Number(record.dataTimestamp);
        if (!Number.isFinite(ms) || ms <= 0) return;
        const time = new Date(ms).toISOString();
        chartData.push(
          // rssiLevel is 0-5; pec is not a signal reading (it is 0 on every record)
          { time, type: 'Signal (%)', value: (record.rssiLevel || 0) * 20 },
          { time, type: 'Signal Level', value: record.rssiLevel || 0 }
        );
      });
      setSignalData(chartData);
    } catch (error: any) {
      console.error('Failed to fetch signal data:', error);
      message.error(error?.response?.data?.msg || 'Failed to fetch signal data');
    } finally {
      setSignalLoading(false);
    }
  };

  const getStateTag = (state?: number) => {
    switch (state) {
      case 1:
        return <Tag icon={<CheckCircleOutlined />} color="success">Online</Tag>;
      case 2:
        return <Tag icon={<CloseCircleOutlined />} color="error">Offline</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const getSignalStrength = (intensity?: number) => {
    if (!intensity) return { status: 'exception', text: 'No Signal', color: '#ff4d4f' };

    if (intensity > 70) return { status: 'success', text: 'Excellent', color: '#52c41a' };
    if (intensity > 40) return { status: 'normal', text: 'Good', color: '#faad14' };
    return { status: 'exception', text: 'Poor', color: '#ff4d4f' };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large">
          <div style={{ paddingTop: 50 }}>Loading collector details...</div>
        </Spin>
      </div>
    );
  }

  if (!detail) {
    return (
      <Card>
        <Text>No collector details found</Text>
      </Card>
    );
  }

  // rssiLevel runs 0-5, so 20 points per level (it used to be 25, showing 125%).
  const signalInfo = getSignalStrength((detail.rssiLevel || 0) * 20);
  const country = detail.countryStr === '乌兹别克斯坦' ? 'Uzbekistan' : detail.countryStr;
  const installedOn = formatFactoryTime(detail.factoryTime);

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
                onClick={() => navigate('/admin/soliscloud/collectors')}

              >
                Back
              </Button>
              <DatabaseOutlined style={{ fontSize: 32 }} />
              <Title level={2} style={{ margin: 0 }}>
                Collector Details
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
                <Tag color={useDbSource ? 'blue' : 'purple'}>
                  {useDbSource ? 'Database' : 'Real-time API'}
                </Tag>
              </Space>
              <Button
                icon={<SyncOutlined />}
                onClick={fetchDetail}
                loading={loading}

              >
                Refresh
              </Button>
            </Space>
          </Space>
          <Text style={{ color: 'rgba(0,0,0,0.65)' }}>
            Serial Number: <Text strong >{detail.sn}</Text>
          </Text>
        </Space>
      </Card>

      {/* Key Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Status"
              // An empty value still rendered "0" after the tag ("Online0").
              valueRender={() => getStateTag(detail.state)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Signal Strength"
              value={(detail.rssiLevel || 0) * 20}
              suffix="%"
              prefix={<SignalFilled style={{ color: signalInfo.color }} />}
              valueStyle={{ color: signalInfo.color }}
            />
            <div style={{ marginTop: 8 }}>
              <Progress
                percent={(detail.rssiLevel || 0) * 20}
                status={signalInfo.status as any}
                strokeColor={signalInfo.color}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>{signalInfo.text}</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Connected Devices"
              value={detail.actualNumber || 0}
              prefix={<ApiOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Station"
              value={detail.stationName || '-'}
              prefix={<EnvironmentOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ fontSize: 16 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Basic Information */}
      <Card title="Device Information" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Collector ID">{detail.id || '-'}</Descriptions.Item>
          <Descriptions.Item label="Serial Number">{detail.sn || '-'}</Descriptions.Item>
          <Descriptions.Item label="Device Model">{detail.model || '-'}</Descriptions.Item>
          <Descriptions.Item label="Station Name">{detail.stationName || '-'}</Descriptions.Item>
          <Descriptions.Item label="Station ID">{detail.stationId || '-'}</Descriptions.Item>
          <Descriptions.Item label="Status">{getStateTag(detail.state)}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Network & Communication */}
      <Card title={<Space><WifiOutlined />Network & Communication</Space>} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12}>
            <Card
              size="small"
              title="Signal Quality"
              style={{
                background: (detail.rssiLevel || 0) * 20 > 70 ? '#f6ffed' :
                           (detail.rssiLevel || 0) * 20 > 40 ? '#fffbe6' : '#fff1f0',
                borderColor: signalInfo.color,
              }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Progress
                    type="circle"
                    percent={(detail.rssiLevel || 0) * 20}
                    strokeColor={signalInfo.color}
                    status={signalInfo.status as any}
                    size={100}
                  />
                  <div style={{ marginTop: 12 }}>
                    <Text strong style={{ fontSize: 16, color: signalInfo.color }}>
                      {signalInfo.text}
                    </Text>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card size="small" title="Connection Details">
              <Descriptions size="small" column={1}>
                <Descriptions.Item label="Signal Intensity">{(detail.rssiLevel || 0) * 20}%</Descriptions.Item>
                <Descriptions.Item label="Communication Type">{detail.connectionOperator || '-'}</Descriptions.Item>
                <Descriptions.Item label="Network Status">
                  {detail.state === 1 ? (
                    <Tag color="success">Connected</Tag>
                  ) : (
                    <Tag color="error">Disconnected</Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
        {present(detail.lanIp) && (
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="LAN IP">{detail.lanIp}</Descriptions.Item>
          </Descriptions>
        )}
      </Card>

      {/* Firmware & Software */}
      <Card title={<Space><CodeOutlined />Firmware & Software</Space>} style={{ marginBottom: 16 }}>
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Firmware Version">{present(detail.version) ? detail.version : '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Connected Devices */}
      {detail.actualNumber !== undefined && detail.actualNumber > 0 && (
        <Card title={<Space><ApiOutlined />Connected Devices</Space>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Card size="small">
                <Statistic
                  title="Actual Devices"
                  value={detail.actualNumber}
                  prefix={<ApiOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card size="small">
                <Statistic
                  title="Maximum Capacity"
                  value={detail.maximumNumber || 0}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card size="small">
                <Statistic
                  title="Available Slots"
                  value={(detail.maximumNumber || 0) - (detail.actualNumber || 0)}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>
          {detail.deviceList && detail.deviceList.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <Descriptions bordered column={1}>
                {detail.deviceList.map((device: any, index: number) => (
                  <Descriptions.Item key={index} label={`Device ${index + 1}`}>
                    <Space>
                      <Text strong>{device.deviceType || 'Unknown'}</Text>
                      <Text type="secondary">SN: {device.sn || '-'}</Text>
                      {getStateTag(device.state)}
                    </Space>
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </div>
          )}
        </Card>
      )}

      {/* Location & Installation */}
      <Card title={<Space><EnvironmentOutlined />Location & Installation</Space>} style={{ marginBottom: 16 }}>
        <Descriptions bordered column={{ xs: 1, sm: 2 }}>
          {present(detail.addr) && <Descriptions.Item label="Address">{detail.addr}</Descriptions.Item>}
          <Descriptions.Item label="Factory Date">{installedOn || '-'}</Descriptions.Item>
          {present(country) && <Descriptions.Item label="Country">{country}</Descriptions.Item>}
          {present(detail.cityStr) && <Descriptions.Item label="City">{detail.cityStr}</Descriptions.Item>}
          <Descriptions.Item label="Timezone">{detail.timeZoneStr || '-'}</Descriptions.Item>
          <Descriptions.Item label="GMT Offset">
            {detail.timeZone !== undefined ? `GMT ${detail.timeZone > 0 ? '+' : ''}${detail.timeZone}` : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Operational Information */}
      <Card title={<Space><CalendarOutlined />Operational Information</Space>}>
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Last Communication">{formatSolisTime(detail.lastCommunication) || '-'}</Descriptions.Item>
          <Descriptions.Item label="Current Working Time">
            {detail.currentWorkingTime ? `${(parseInt(detail.currentWorkingTime) / 3600).toFixed(1)} hours` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Data Upload Cycle">
            {detail.dataUploadCycle ? `${detail.dataUploadCycle} seconds` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Total Working Time">
            {detail.totalWorkingTime ? `${(parseInt(detail.totalWorkingTime) / 3600).toFixed(1)} hours` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="GPRS Package">
            {detail.gprsPackage || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Signal Strength Chart */}
      <Card
        title={
          <Space>
            <LineChartOutlined />
            Signal Strength History
          </Space>
        }
        extra={
          <DatePicker
            value={selectedDate}
            onChange={(date) => date && setSelectedDate(date)}
            allowClear={false}
            format="YYYY-MM-DD"
          />
        }
        style={{ marginBottom: 16 }}
      >
        {signalLoading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large">
              <div style={{ paddingTop: 50 }}>Loading signal data...</div>
            </Spin>
          </div>
        ) : signalData.length > 0 ? (
          <div style={{ height: 400 }}>
            <Line
              data={signalData}
              xField="time"
              yField="value"
              seriesField="type"
              smooth={true}
              animation={{
                appear: {
                  animation: 'path-in',
                  duration: 1000,
                },
              }}
              xAxis={{
                type: 'time',
                label: {
                  autoRotate: true,
                  autoHide: true,
                },
              }}
              yAxis={{
                label: {
                  formatter: (v: string) => `${v}`,
                },
              }}
              legend={{
                position: 'top',
              }}
              tooltip={{
                shared: true,
                showCrosshairs: true,
              }}
              point={{
                size: 3,
                shape: 'circle',
              }}
            />
          </div>
        ) : (
          <Empty description="No signal data available for this date" />
        )}
      </Card>
    </div>
  );
};

export default CollectorDetailPage;
