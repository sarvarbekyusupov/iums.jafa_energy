import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Space, Tag, message, Button, Row, Col, Statistic, Typography, Progress, Spin, Divider, Switch } from 'antd';
import {
  ThunderboltOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  ArrowLeftOutlined,
  SyncOutlined,
  ThunderboltFilled,
  DashboardOutlined,
  FireOutlined,
  BulbOutlined,
  LineChartOutlined,
  DatabaseOutlined,
  CloudOutlined,
} from '@ant-design/icons';
import solisCloudService from '../../../service/soliscloud.service';
import type { InverterDetail } from '../../../types/soliscloud';

const { Title, Text } = Typography;

const InverterDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<InverterDetail | null>(null);
  const [useDbSource, setUseDbSource] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id, useDbSource]);

  const parseValue = (val: any): number => {
    if (typeof val === 'string') return parseFloat(val) || 0;
    return val || 0;
  };

  const fetchDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      if (useDbSource) {
        const response = await solisCloudService.getDbInverter(id);
        setDetail(response.data || response);
      } else {
        const response = await solisCloudService.getInverterDetail({ id });
        setDetail(response);
      }
    } catch (error: any) {
      message.error(error?.response?.data?.msg || 'Failed to fetch inverter details');
    } finally {
      setLoading(false);
    }
  };

  const getStateTag = (state?: number) => {
    switch (state) {
      case 1:
        return <Tag icon={<CheckCircleOutlined />} color="success">Online</Tag>;
      case 2:
        return <Tag icon={<CloseCircleOutlined />} color="error">Offline</Tag>;
      case 3:
        return <Tag icon={<WarningOutlined />} color="warning">Alarm</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large">
          <div style={{ paddingTop: 50 }}>Loading inverter details...</div>
        </Spin>
      </div>
    );
  }

  if (!detail) {
    return (
      <Card>
        <Text>No inverter details found</Text>
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
                onClick={() => navigate('/admin/soliscloud/inverters')}
                style={{
                  background: '#fff',
                  color: '#667eea',
                  fontWeight: 500
                }}
              >
                Back
              </Button>
              <ThunderboltOutlined style={{ fontSize: 32 }} />
              <Title level={2} style={{ margin: 0 }}>
                Inverter Details
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
                icon={<LineChartOutlined />}
                onClick={() => navigate(`/admin/soliscloud/inverters/${id}/charts`)}
                style={{
                  background: '#fff',
                  color: '#667eea',
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
                  color: '#667eea',
                  fontWeight: 500
                }}
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
              value=""
              prefix={getStateTag(detail.state)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Current Power"
              value={parseValue(detail.pac).toFixed(2)}
              suffix="kW"
              prefix={<ThunderboltOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Today's Energy"
              value={parseValue(detail.eToday).toFixed(2)}
              suffix="kWh"
              prefix={<ThunderboltOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Energy"
              value={parseValue(detail.eTotal).toFixed(2)}
              suffix="kWh"
              prefix={<DashboardOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Basic Information */}
      <Card title="Basic Information" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Serial Number">{detail.sn || '-'}</Descriptions.Item>
          <Descriptions.Item label="Station Name">{detail.stationName || '-'}</Descriptions.Item>
          <Descriptions.Item label="Model">{detail.model || '-'}</Descriptions.Item>
          <Descriptions.Item label="Station ID">{detail.stationId || '-'}</Descriptions.Item>
          <Descriptions.Item label="Inverter Type">{detail.inverterType || '-'}</Descriptions.Item>
          <Descriptions.Item label="Full Power">{detail.fullPower ? `${detail.fullPower} kW` : '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Power Generation */}
      <Card title={<Space><ThunderboltOutlined />Power Generation</Space>} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Card size="small">
              <Statistic
                title="AC Power"
                value={parseValue(detail.pac).toFixed(2)}
                suffix="kW"
                valueStyle={{ fontSize: 18 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small">
              <Statistic
                title="DC Power"
                value={parseValue(detail.pdc).toFixed(2)}
                suffix="kW"
                valueStyle={{ fontSize: 18 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small">
              <Statistic
                title="Efficiency"
                value={(() => {
                  const pac = parseValue(detail.pac);
                  const pdc = parseValue(detail.pdc);
                  return pdc > 0 ? ((pac / pdc) * 100).toFixed(1) : '0.0';
                })()}
                suffix="%"
                valueStyle={{ fontSize: 18, color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Today's Energy">{parseValue(detail.eToday) > 0 ? `${parseValue(detail.eToday).toFixed(2)} kWh` : '-'}</Descriptions.Item>
          <Descriptions.Item label="This Month">{parseValue(detail.eMonth) > 0 ? `${parseValue(detail.eMonth).toFixed(2)} kWh` : '-'}</Descriptions.Item>
          <Descriptions.Item label="This Year">{parseValue(detail.eYear) > 0 ? `${parseValue(detail.eYear).toFixed(2)} kWh` : '-'}</Descriptions.Item>
          <Descriptions.Item label="Total Energy">{parseValue(detail.eTotal) > 0 ? `${parseValue(detail.eTotal).toFixed(2)} kWh` : '-'}</Descriptions.Item>
          <Descriptions.Item label="Family Load Today">{parseValue(detail.familyLoadPower) > 0 ? `${parseValue(detail.familyLoadPower).toFixed(2)} kW` : '-'}</Descriptions.Item>
          <Descriptions.Item label="Power Factor">{detail.powerFactor !== undefined ? detail.powerFactor : '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* DC Input (PV Strings) */}
      <Card title={<Space><BulbOutlined />DC Input (PV Strings)</Space>} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map(num => {
            const voltage = parseValue(detail[`uPv${num}` as keyof InverterDetail]);
            const current = parseValue(detail[`iPv${num}` as keyof InverterDetail]);
            const power = voltage && current ? (voltage * current / 1000).toFixed(2) : '0.00';

            return (
              <Col xs={24} sm={12} md={6} key={num}>
                <Card
                  size="small"
                  title={`String ${num}`}
                  style={{ background: voltage && voltage > 0 ? '#f0f9ff' : '#fafafa' }}
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>
                      <Text type="secondary">Voltage:</Text>{' '}
                      <Text strong>{voltage > 0 ? `${voltage.toFixed(1)} V` : '-'}</Text>
                    </div>
                    <div>
                      <Text type="secondary">Current:</Text>{' '}
                      <Text strong>{current > 0 ? `${current.toFixed(2)} A` : '-'}</Text>
                    </div>
                    <Divider style={{ margin: '8px 0' }} />
                    <div>
                      <Text type="secondary">Power:</Text>{' '}
                      <Text strong style={{ color: '#1890ff' }}>{power} kW</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Card>

      {/* Grid AC Output */}
      <Card title={<Space><ThunderboltFilled />Grid AC Output</Space>} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12}>
            <Card size="small" title="Phase A" style={{ background: '#fff7e6' }}>
              <Descriptions size="small" column={1}>
                <Descriptions.Item label="Voltage">{parseValue(detail.uAc1) > 0 ? `${parseValue(detail.uAc1).toFixed(1)} V` : '-'}</Descriptions.Item>
                <Descriptions.Item label="Current">{parseValue(detail.iAc1) > 0 ? `${parseValue(detail.iAc1).toFixed(2)} A` : '-'}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card size="small" title="Phase B" style={{ background: '#f0f5ff' }}>
              <Descriptions size="small" column={1}>
                <Descriptions.Item label="Voltage">{parseValue(detail.uAc2) > 0 ? `${parseValue(detail.uAc2).toFixed(1)} V` : '-'}</Descriptions.Item>
                <Descriptions.Item label="Current">{parseValue(detail.iAc2) > 0 ? `${parseValue(detail.iAc2).toFixed(2)} A` : '-'}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Grid Frequency">{parseValue(detail.fac) > 0 ? `${parseValue(detail.fac).toFixed(2)} Hz` : '-'}</Descriptions.Item>
          <Descriptions.Item label="Grid Power">{parseValue(detail.gridPower) > 0 ? `${parseValue(detail.gridPower).toFixed(2)} kW` : '-'}</Descriptions.Item>
          <Descriptions.Item label="Power Factor">{detail.powerFactor !== undefined ? detail.powerFactor : '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Battery Information */}
      {(detail.batteryPower !== undefined || detail.batteryCapacitySoc !== undefined) && (
        <Card title={<Space><ThunderboltFilled style={{ color: '#722ed1' }} />Battery System</Space>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Battery SOC"
                  value={parseValue(detail.batteryCapacitySoc)}
                  suffix="%"
                  prefix={
                    <Progress
                      type="circle"
                      percent={parseValue(detail.batteryCapacitySoc)}
                      size={50}
                      strokeColor={
                        parseValue(detail.batteryCapacitySoc) > 80 ? '#52c41a' :
                        parseValue(detail.batteryCapacitySoc) > 50 ? '#faad14' : '#ff4d4f'
                      }
                    />
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Battery Power"
                  value={parseValue(detail.batteryPower).toFixed(2)}
                  suffix="kW"
                  valueStyle={{ color: parseValue(detail.batteryPower) > 0 ? '#52c41a' : '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Battery Voltage"
                  value={parseValue(detail.batteryVoltage).toFixed(1)}
                  suffix="V"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Battery Current"
                  value={parseValue(detail.batteryCurrent).toFixed(2)}
                  suffix="A"
                />
              </Card>
            </Col>
          </Row>
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="Battery Type">{detail.batteryType || '-'}</Descriptions.Item>
            <Descriptions.Item label="Today's Charge">{parseValue(detail.batteryTodayChargeEnergy) > 0 ? `${parseValue(detail.batteryTodayChargeEnergy).toFixed(2)} kWh` : '-'}</Descriptions.Item>
            <Descriptions.Item label="Today's Discharge">{parseValue(detail.batteryTodayDischargeEnergy) > 0 ? `${parseValue(detail.batteryTodayDischargeEnergy).toFixed(2)} kWh` : '-'}</Descriptions.Item>
            <Descriptions.Item label="Total Charge">{parseValue(detail.batteryTotalChargeEnergy) > 0 ? `${parseValue(detail.batteryTotalChargeEnergy).toFixed(2)} kWh` : '-'}</Descriptions.Item>
            <Descriptions.Item label="Total Discharge">{parseValue(detail.batteryTotalDischargeEnergy) > 0 ? `${parseValue(detail.batteryTotalDischargeEnergy).toFixed(2)} kWh` : '-'}</Descriptions.Item>
            <Descriptions.Item label="Remaining Capacity">{parseValue(detail.batteryCapacityRemain) > 0 ? `${parseValue(detail.batteryCapacityRemain).toFixed(2)} kWh` : '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Temperature & Environment */}
      <Card title={<Space><FireOutlined />Temperature & Environment</Space>} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card size="small">
              <Statistic
                title="Inverter Temperature"
                value={parseValue(detail.inverterTemperature) > 0 ? parseValue(detail.inverterTemperature).toFixed(1) : '-'}
                suffix="°C"
                valueStyle={{
                  color: parseValue(detail.inverterTemperature) > 60 ? '#ff4d4f' :
                         parseValue(detail.inverterTemperature) > 45 ? '#faad14' : '#52c41a'
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small">
              <Statistic
                title="Module Temperature"
                value={parseValue(detail.moduleTemperature) > 0 ? parseValue(detail.moduleTemperature).toFixed(1) : '-'}
                suffix="°C"
                valueStyle={{
                  color: parseValue(detail.moduleTemperature) > 60 ? '#ff4d4f' :
                         parseValue(detail.moduleTemperature) > 45 ? '#faad14' : '#52c41a'
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small">
              <Statistic
                title="Ambient Temperature"
                value={parseValue(detail.ambientTemperature) > 0 ? parseValue(detail.ambientTemperature).toFixed(1) : '-'}
                suffix="°C"
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Timestamps */}
      <Card title="Data Information">
        <Descriptions bordered column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="Data Timestamp">{detail.dataTimestamp || '-'}</Descriptions.Item>
          <Descriptions.Item label="Last Update">{detail.updateDate || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default InverterDetailPage;
