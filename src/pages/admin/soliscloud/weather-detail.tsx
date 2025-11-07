import React, { useEffect, useState } from 'react';
import { Card, Descriptions, message, Button, Space, Tag, Typography, Spin, Row, Col, Statistic } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  CloudOutlined,
  SyncOutlined,
  DashboardOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import solisCloudService from '../../../service/soliscloud.service';

const { Title, Text } = Typography;

interface WeatherDetail {
  sn: string;
  stationId: string;
  stationName: string;
  dataTimestamp: string;
  temperature: number;
  humidity: number;
  irradiance: number;
  windSpeed: number;
  windDirection: number;
  airPressure: number;
  rainFall: number;
  moduleTemperature: number;
  status: number;
  [key: string]: any;
}

const WeatherDetailPage: React.FC = () => {
  const { sn } = useParams<{ sn: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<WeatherDetail | null>(null);

  useEffect(() => {
    if (sn) {
      fetchDetail();
    }
  }, [sn]);

  const fetchDetail = async () => {
    if (!sn) return;

    try {
      setLoading(true);
      const response = await solisCloudService.getWeatherStationDetail({ sn });
      setDetail(response as any);
    } catch (error: any) {
      message.error(error?.response?.data?.msg || 'Failed to fetch weather station details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: number) => {
    switch (status) {
      case 1:
        return <Tag color="success">Online</Tag>;
      case 2:
        return <Tag color="error">Offline</Tag>;
      case 3:
        return <Tag color="warning">Alarm</Tag>;
      default:
        return <Tag color="default">Unknown</Tag>;
    }
  };

  const getWindDirection = (degree: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degree / 45) % 8;
    return `${directions[index]} (${degree}°)`;
  };

  if (loading && !detail) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading weather station details..." />
      </div>
    );
  }

  if (!detail) {
    return (
      <Card>
        <Text>No weather station found</Text>
      </Card>
    );
  }

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
                onClick={() => navigate('/admin/soliscloud/weather')}
                style={{
                  background: '#fff',
                  color: '#66a6ff',
                  fontWeight: 500
                }}
              >
                Back
              </Button>
              <CloudOutlined style={{ fontSize: 32 }} />
              <Title level={2} style={{ margin: 0 }}>
                Weather Station Details
              </Title>
            </Space>
            <Button
              icon={<SyncOutlined />}
              onClick={fetchDetail}
              loading={loading}
              style={{
                background: '#fff',
                color: '#66a6ff',
                fontWeight: 500
              }}
            >
              Refresh
            </Button>
          </Space>
          <Text style={{ color: 'rgba(0,0,0,0.65)' }}>
            Serial Number: {detail.sn}
          </Text>
        </Space>
      </Card>

      {/* Real-time Weather Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Temperature"
              value={detail.temperature || 0}
              precision={1}
              suffix="°C"
              valueStyle={{ color: '#ff7875' }}
              prefix={<DashboardOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Humidity"
              value={detail.humidity || 0}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#40a9ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Irradiance"
              value={detail.irradiance || 0}
              precision={0}
              suffix="W/m²"
              valueStyle={{ color: '#ffc53d' }}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Wind Speed"
              value={detail.windSpeed || 0}
              precision={1}
              suffix="m/s"
              valueStyle={{ color: '#95de64' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Basic Information */}
      <Card title="Basic Information" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Serial Number">{detail.sn}</Descriptions.Item>
          <Descriptions.Item label="Status">{getStatusTag(detail.status)}</Descriptions.Item>
          <Descriptions.Item label="Station">{detail.stationName}</Descriptions.Item>
          <Descriptions.Item label="Station ID">{detail.stationId}</Descriptions.Item>
          <Descriptions.Item label="Last Update">{detail.dataTimestamp}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Environmental Metrics */}
      <Card title="Environmental Metrics" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Temperature">
            {(detail.temperature || 0).toFixed(1)} °C
          </Descriptions.Item>
          <Descriptions.Item label="Module Temperature">
            {(detail.moduleTemperature || 0).toFixed(1)} °C
          </Descriptions.Item>
          <Descriptions.Item label="Humidity">
            {(detail.humidity || 0).toFixed(1)} %
          </Descriptions.Item>
          <Descriptions.Item label="Irradiance">
            {(detail.irradiance || 0).toFixed(0)} W/m²
          </Descriptions.Item>
          <Descriptions.Item label="Air Pressure">
            {(detail.airPressure || 0).toFixed(1)} hPa
          </Descriptions.Item>
          <Descriptions.Item label="Rainfall">
            {(detail.rainFall || 0).toFixed(1)} mm
          </Descriptions.Item>
          <Descriptions.Item label="Wind Speed">
            {(detail.windSpeed || 0).toFixed(1)} m/s
          </Descriptions.Item>
          <Descriptions.Item label="Wind Direction">
            {getWindDirection(detail.windDirection || 0)}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default WeatherDetailPage;
