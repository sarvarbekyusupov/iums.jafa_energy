import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Space, Tag, message, Button, Row, Col, Statistic, Typography, Spin, Progress, DatePicker, Empty } from 'antd';
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
} from '@ant-design/icons';
import { Line } from '@ant-design/charts';
import dayjs, { Dayjs } from 'dayjs';
import solisCloudService from '../../../service/soliscloud.service';
import type { CollectorDetail } from '../../../types/soliscloud';

const { Title, Text } = Typography;

const CollectorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<CollectorDetail | null>(null);
  const [signalLoading, setSignalLoading] = useState(false);
  const [signalData, setSignalData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  useEffect(() => {
    if (detail?.sn) {
      fetchSignalData();
    }
  }, [detail?.sn, selectedDate]);

  const fetchDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await solisCloudService.getCollectorDetail({ id });
      setDetail(response);
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
        timeZone: 8, // GMT+8
      });

      const chartData: any[] = [];
      response?.forEach((record: any) => {
        chartData.push(
          { time: record.timeStr, type: 'Signal (%)', value: record.pec || 0 },
          { time: record.timeStr, type: 'Signal Level', value: record.rssiLevel || 0 }
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

  const signalInfo = getSignalStrength((detail.rssiLevel || 0) * 25);

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
            <Button
              icon={<SyncOutlined />}
              onClick={fetchDetail}
              loading={loading}
              
            >
              Refresh
            </Button>
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
              value=""
              prefix={getStateTag(detail.state)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Signal Strength"
              value={(detail.rssiLevel || 0) * 25}
              suffix="%"
              prefix={<SignalFilled style={{ color: signalInfo.color }} />}
              valueStyle={{ color: signalInfo.color }}
            />
            <div style={{ marginTop: 8 }}>
              <Progress
                percent={(detail.rssiLevel || 0) * 25}
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
                background: detail.signalIntensity && detail.signalIntensity > 70 ? '#f6ffed' :
                           detail.signalIntensity && detail.signalIntensity > 40 ? '#fffbe6' : '#fff1f0',
                borderColor: signalInfo.color,
              }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Progress
                    type="circle"
                    percent={(detail.rssiLevel || 0) * 25}
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
                <Descriptions.Item label="Signal Intensity">{(detail.rssiLevel || 0) * 25}%</Descriptions.Item>
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
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="IP Address">{'-'}</Descriptions.Item>
          <Descriptions.Item label="MAC Address">{'-'}</Descriptions.Item>
          <Descriptions.Item label="Port">{'-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Firmware & Software */}
      <Card title={<Space><CodeOutlined />Firmware & Software</Space>} style={{ marginBottom: 16 }}>
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Firmware Version">{detail.version || '-'}</Descriptions.Item>
          <Descriptions.Item label="Software Version">{'-'}</Descriptions.Item>
          <Descriptions.Item label="Hardware Version">{'-'}</Descriptions.Item>
          <Descriptions.Item label="Protocol Version">{'-'}</Descriptions.Item>
          <Descriptions.Item label="Last Upgrade">
            {'-'}
          </Descriptions.Item>
          <Descriptions.Item label="Upgrade Available">
            <Tag color="success">Up to date</Tag>
          </Descriptions.Item>
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
          <Descriptions.Item label="Installation Location">{'-'}</Descriptions.Item>
          <Descriptions.Item label="Installation Date">{detail.factoryTime ? new Date(parseInt(detail.factoryTime) * 1000).toLocaleDateString() : '-'}</Descriptions.Item>
          <Descriptions.Item label="Country">{'-'}</Descriptions.Item>
          <Descriptions.Item label="City">{'-'}</Descriptions.Item>
          <Descriptions.Item label="Timezone">{detail.timeZoneStr || '-'}</Descriptions.Item>
          <Descriptions.Item label="GMT Offset">
            {detail.timeZone !== undefined ? `GMT ${detail.timeZone > 0 ? '+' : ''}${detail.timeZone}` : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Operational Information */}
      <Card title={<Space><CalendarOutlined />Operational Information</Space>}>
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="First Connection">{'-'}</Descriptions.Item>
          <Descriptions.Item label="Last Communication">{detail.dataTimestamp ? new Date(parseInt(detail.dataTimestamp)).toLocaleString() : '-'}</Descriptions.Item>
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
