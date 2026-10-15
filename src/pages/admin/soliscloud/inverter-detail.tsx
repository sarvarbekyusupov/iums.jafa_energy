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
import dayjs from 'dayjs';
import { formatSolisTime, toKw, toKwh } from '../../../helpers/solis-units';
import { isSolisParallelMaster, solisDcPowerKw } from '../../../helpers/solis-fields';
import solisCloudService from '../../../service/soliscloud.service';
import DataAsOf from '../../../components/DataAsOf';
import type { InverterDetail } from '../../../types/soliscloud';

const { Title, Text } = Typography;

// Handle both string and number values from API/DB (decimal columns arrive as strings today)
const parseValue = (val: any): number => {
  if (typeof val === 'string') return parseFloat(val) || 0;
  return val || 0;
};

const formatTs = (ts: any): string | undefined => (ts ? dayjs(ts).format('YYYY-MM-DD HH:mm:ss') : undefined);

// DB row (SolisCloudInverter entity) -> the vendor detail keys this page renders; fields the DB does not hold stay undefined and render as '-'
const normalizeDbInverter = (i: any): InverterDetail => ({
  ...i,
  pac: parseValue(i.pac),
  eToday: parseValue(i.eToday),
  eTotal: parseValue(i.eTotal),
  fullPower: i.ratedPower == null ? undefined : parseValue(i.ratedPower),
  // null from the DB must become undefined so the battery card stays hidden for non-battery inverters
  batteryCapacitySoc: i.batteryCapacitySoc == null ? undefined : parseValue(i.batteryCapacitySoc),
  batteryPower: i.batteryPower == null ? undefined : parseValue(i.batteryPower),
  state: Number(i.state),
  updateDate: formatTs(i.lastSyncedAt),
});

// The newest stored reading fills what the inverter row lacks: strings, grid side, temperature.
const withLatestReading = (inv: InverterDetail, r: any): InverterDetail => {
  if (!r) return inv;
  const fresh: Record<string, unknown> = {
    uPv1: r.uDc1, iPv1: r.iDc1, uPv2: r.uDc2, iPv2: r.iDc2,
    uAc1: r.uAc1, iAc1: r.iAc1, uAc2: r.uAc2, iAc2: r.iAc2, uAc3: r.uAc3, iAc3: r.iAc3,
    fac: r.fAc,
    inverterTemperature: r.temperature,
    // grid, load and battery power are kW in the readings table; pac alone is W
    gridPower: r.gridPower,
    familyLoadPower: r.loadPower,
    batteryPower: r.batteryPower,
    batteryCapacitySoc: r.batterySoc,
    pac: r.pac != null ? parseValue(r.pac) / 1000 : null,
  };
  // Only what the reading actually carries; a null must not hide the vendor detail's value.
  return { ...inv, ...Object.fromEntries(Object.entries(fresh).filter(([, v]) => v !== null && v !== undefined)) } as InverterDetail;
};

// Vendor detail: every energy figure has its own unit string (eTotal 4.49 + "MWh").
const normalizeLiveInverter = (d: any): InverterDetail => ({
  ...d,
  model: d.machine || d.model,
  fullPower: d.power != null ? toKw(d.power, d.powerStr) : undefined, // rated power
  pac: toKw(d.pac, d.pacStr),
  eToday: toKwh(d.eToday, d.eTodayStr),
  eMonth: toKwh(d.eMonth, d.eMonthStr),
  eYear: toKwh(d.eYear, d.eYearStr),
  eTotal: toKwh(d.eTotal, d.eTotalStr),
  familyLoadPower: toKw(d.familyLoadPower, d.familyLoadPowerStr),
  // The doc says pSum; the detail sends psum. Below 0 the site is buying from the grid
  // (night readings on 2026-10-15: pac 0, load 0.54 kW, psum -0.68 kW).
  gridPower: d.psum != null ? toKw(d.psum, d.psumStr) : d.pSum != null ? toKw(d.pSum, d.pSumStr) : undefined,
  batteryPower: d.batteryPower != null ? toKw(d.batteryPower, d.batteryPowerStr) : undefined,
  batteryTodayChargeEnergy: toKwh(d.batteryTodayChargeEnergy, d.batteryTodayChargeEnergyStr),
  batteryTodayDischargeEnergy: toKwh(d.batteryTodayDischargeEnergy, d.batteryTodayDischargeEnergyStr),
  batteryTotalChargeEnergy: toKwh(d.batteryTotalChargeEnergy, d.batteryTotalChargeEnergyStr),
  batteryTotalDischargeEnergy: toKwh(d.batteryTotalDischargeEnergy, d.batteryTotalDischargeEnergyStr),
  dataTimestamp: formatSolisTime(d.dataTimestamp),
  updateDate: formatSolisTime(d.updateDate),
});

const InverterDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<InverterDetail | null>(null);
  const [useDbSource, setUseDbSource] = useState(true);
  // The vendor's own record as one snapshot: DC power and efficiency must come from the same
  // moment, not mix the hourly detail with the 5-minute reading.
  const [snapshot, setSnapshot] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id, useDbSource]);

  const fetchDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      if (useDbSource) {
        const response = await solisCloudService.getDbInverter(id);
        const row = response.data || response;
        setSnapshot(row?.detail ?? null);
        let inverter = normalizeDbInverter(row);
        // The hourly sync keeps the vendor's full detail; show all of it, with our own row and
        // newest reading on top where they are fresher.
        if (row?.detail) {
          inverter = {
            ...normalizeLiveInverter(row.detail),
            ...Object.fromEntries(Object.entries(inverter).filter(([, v]) => v !== undefined && v !== null)),
            model: row.model || row.detail.machine,
            eMonth: toKwh(row.detail.eMonth, row.detail.eMonthStr),
            eYear: toKwh(row.detail.eYear, row.detail.eYearStr),
          } as InverterDetail;
        }
        // lastSyncedAt is when our sync ran; the newest stored reading is the true data time
        try {
          const latest = await solisCloudService.getDbInverterLatestReading(id);
          const ts = latest?.data?.dataTimestamp;
          inverter = withLatestReading(inverter, latest?.data);
          if (ts) inverter.dataTimestamp = formatTs(ts);
        } catch {
          // optional; leave dataTimestamp empty
        }
        setDetail(inverter);
      } else {
        const response = await solisCloudService.getInverterDetail({ id });
        setSnapshot(response as any);
        setDetail(normalizeLiveInverter(response));
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

  const d = detail as any;
  const parallelMaster = isSolisParallelMaster(snapshot);
  const powerTitle = parallelMaster ? 'System power (parallel group)' : 'Current Power';
  const dcPower = solisDcPowerKw(snapshot);
  const snapshotPac = snapshot?.pac != null ? toKw(snapshot.pac, snapshot.pacStr) : undefined;
  // A master's pac covers the whole group while its strings are its own, so the ratio means nothing.
  const efficiency = !parallelMaster && dcPower && dcPower > 0 && snapshotPac !== undefined
    ? ((snapshotPac / dcPower) * 100).toFixed(1)
    : '-';
  // acOutputType 0 is single-phase, anything else three-phase (doc 3.4).
  const threePhase = d.acOutputType != null ? Number(d.acOutputType) !== 0 : parseValue(d.uAc3) > 0;
  const phases = [
    { n: 1, title: 'Phase A', bg: '#fff7e6' },
    ...(threePhase
      ? [
          { n: 2, title: 'Phase B', bg: '#f0f5ff' },
          { n: 3, title: 'Phase C', bg: '#f6ffed' },
        ]
      : []),
  ];
  const gridPower = d.gridPower == null || d.gridPower === '' ? undefined : parseValue(d.gridPower);
  const batteryPower = parseValue(d.batteryPower);

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
                  {useDbSource ? 'Stored data' : 'Live SolisCloud API'}
                </Tag>
                {useDbSource && <DataAsOf label="Synced" timestamp={detail.lastSyncedAt} />}
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
              // An empty value still rendered "0" after the tag ("Online0").
              valueRender={() => getStateTag(detail.state)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={powerTitle}
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
          <Descriptions.Item label="Full Power">{detail.fullPower ? `${detail.fullPower} kW` : '-'}</Descriptions.Item>
          {d.faultCodeDesc && <Descriptions.Item label="Fault / State">{d.faultCodeDesc}</Descriptions.Item>}
          {parallelMaster && (
            <Descriptions.Item label="Parallel Group">
              Master of {d.parallelNumber}; its power is the whole group's
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Power Generation */}
      <Card title={<Space><ThunderboltOutlined />Power Generation</Space>} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Card size="small">
              <Statistic
                title={parallelMaster ? 'AC Power (parallel group)' : 'AC Power'}
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
                value={dcPower !== undefined ? dcPower.toFixed(2) : '-'}
                suffix={dcPower !== undefined ? 'kW' : undefined}
                valueStyle={{ fontSize: 18 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small">
              <Statistic
                title="Efficiency"
                value={efficiency}
                suffix={efficiency === '-' ? undefined : '%'}
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
          <Descriptions.Item label="Family Load">{parseValue(detail.familyLoadPower) > 0 ? `${parseValue(detail.familyLoadPower).toFixed(2)} kW` : '-'}</Descriptions.Item>
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
          {phases.map(({ n, title, bg }) => {
            const u = parseValue(d[`uAc${n}`]);
            const i = parseValue(d[`iAc${n}`]);
            return (
              <Col xs={24} md={24 / phases.length} key={n}>
                <Card size="small" title={title} style={{ background: bg }}>
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="Voltage">{u > 0 ? `${u.toFixed(1)} V` : '-'}</Descriptions.Item>
                    <Descriptions.Item label="Current">{i > 0 ? `${i.toFixed(2)} A` : '-'}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            );
          })}
        </Row>
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Grid Frequency">{parseValue(detail.fac) > 0 ? `${parseValue(detail.fac).toFixed(2)} Hz` : '-'}</Descriptions.Item>
          <Descriptions.Item label="Grid Power">
            {gridPower === undefined
              ? '-'
              : `${Math.abs(gridPower).toFixed(2)} kW ${gridPower < 0 ? '(buying)' : gridPower > 0 ? '(selling)' : ''}`}
          </Descriptions.Item>
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
                  title={batteryPower < 0 ? 'Battery Power (discharging)' : batteryPower > 0 ? 'Battery Power (charging)' : 'Battery Power'}
                  value={Math.abs(batteryPower).toFixed(2)}
                  suffix="kW"
                  valueStyle={{ color: batteryPower >= 0 ? '#52c41a' : '#ff4d4f' }}
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
                  // the vendor key really is spelled "bsttery"
                  value={parseValue(d.bstteryCurrent ?? d.batteryCurrent).toFixed(2)}
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
            <Descriptions.Item label="Battery Health (SOH)">{d.batteryHealthSoh != null && d.batteryHealthSoh !== '' ? `${parseValue(d.batteryHealthSoh)}%` : '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Temperature */}
      <Card title={<Space><FireOutlined />Temperature</Space>} style={{ marginBottom: 16 }}>
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
