import React, { useEffect, useState } from 'react';
import { Card, Descriptions, message, Button, Space, Tag, Typography, Spin, Row, Col, Statistic } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  ThunderboltOutlined,
  LineChartOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import solisCloudService from '../../../service/soliscloud.service';

const { Title, Text } = Typography;

interface EPMDetail {
  id: string;
  stationId: string;
  stationName: string;
  sn: string;
  dataTimestamp: string;
  pac: number;
  familyLoadPower: number;
  activePower: number;
  reactivePower: number;
  apparentPower: number;
  gridFrequency: number;
  status: number;
  [key: string]: any;
}

const EPMDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<EPMDetail | null>(null);

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const fetchDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await solisCloudService.getEPMDetail({ id });
      setDetail(response as any);
    } catch (error: any) {
      message.error(error?.response?.data?.msg || 'Failed to fetch EPM details');
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

  if (loading && !detail) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading EPM details..." />
      </div>
    );
  }

  if (!detail) {
    return (
      <Card>
        <Text>No EPM device found</Text>
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
                onClick={() => navigate('/admin/soliscloud/epm')}
                style={{
                  background: '#fff',
                  color: '#f5576c',
                  fontWeight: 500
                }}
              >
                Back
              </Button>
              <ThunderboltOutlined style={{ fontSize: 32 }} />
              <Title level={2} style={{ margin: 0 }}>
                EPM Device Details
              </Title>
            </Space>
            <Space>
              <Button
                icon={<LineChartOutlined />}
                onClick={() => navigate(`/admin/soliscloud/epm/${id}/charts`)}
                style={{
                  background: '#fff',
                  color: '#f5576c',
                  fontWeight: 500
                }}
              >
                View Charts
              </Button>
              <Button
                icon={<SyncOutlined />}
                onClick={fetchDetail}
                loading={loading}
                style={{
                  background: '#fff',
                  color: '#f5576c',
                  fontWeight: 500
                }}
              >
                Refresh
              </Button>
            </Space>
          </Space>
          <Text style={{ color: 'rgba(0,0,0,0.65)' }}>
            Serial Number: {detail.sn}
          </Text>
        </Space>
      </Card>

      {/* Real-time Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="PAC"
              value={detail.pac || 0}
              precision={2}
              suffix="kW"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Family Load Power"
              value={detail.familyLoadPower || 0}
              precision={2}
              suffix="kW"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Active Power"
              value={detail.activePower || 0}
              precision={2}
              suffix="kW"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Basic Information */}
      <Card title="Basic Information" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Device ID">{detail.id}</Descriptions.Item>
          <Descriptions.Item label="Serial Number">{detail.sn}</Descriptions.Item>
          <Descriptions.Item label="Status">{getStatusTag(detail.status)}</Descriptions.Item>
          <Descriptions.Item label="Station">{detail.stationName}</Descriptions.Item>
          <Descriptions.Item label="Station ID">{detail.stationId}</Descriptions.Item>
          <Descriptions.Item label="Last Update">{detail.dataTimestamp}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Power Metrics */}
      <Card title="Power Metrics" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="PAC">{(detail.pac || 0).toFixed(2)} kW</Descriptions.Item>
          <Descriptions.Item label="Active Power">{(detail.activePower || 0).toFixed(2)} kW</Descriptions.Item>
          <Descriptions.Item label="Reactive Power">{(detail.reactivePower || 0).toFixed(2)} kVar</Descriptions.Item>
          <Descriptions.Item label="Apparent Power">{(detail.apparentPower || 0).toFixed(2)} kVA</Descriptions.Item>
          <Descriptions.Item label="Family Load Power">{(detail.familyLoadPower || 0).toFixed(2)} kW</Descriptions.Item>
          <Descriptions.Item label="Grid Frequency">{(detail.gridFrequency || 0).toFixed(2)} Hz</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default EPMDetailPage;
