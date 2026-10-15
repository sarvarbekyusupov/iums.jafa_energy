import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Card,
  Col,
  Empty,
  Progress,
  Row,
  Segmented,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { InfoCircleOutlined } from '@ant-design/icons';
import { availabilityService } from '../../../service/availability.service';
import type {
  AvailabilityInverter,
  AvailabilityOutage,
  AvailabilityReport,
  AvailabilityStation,
} from '../../../types/availability';
import { providerTag } from './provider-tag';

const { Text, Paragraph } = Typography;

type Range = '7' | '30' | 'all';

const TASHKENT_MS = 5 * 3_600_000;

/** Tashkent wall time whatever the viewer's own clock is set to: "12.10 14:30". */
const formatTime = (iso: string): string => {
  const d = new Date(new Date(iso).getTime() + TASHKENT_MS).toISOString();
  return `${d.slice(8, 10)}.${d.slice(5, 7)} ${d.slice(11, 16)}`;
};

/**
 * "45 daq", "3 soat 15 daq". Downtime counts daylight only, so it is never shown in days: a
 * three-day stop is about 30 lost hours, and "1 kun" would read as a calendar day.
 */
const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} daq`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest && hours < 10 ? `${hours} soat ${rest} daq` : `${hours} soat`;
};

const formatHours = (minutes: number): string =>
  `${new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 1 }).format(minutes / 60)} soat`;

const pctColor = (pct: number | null): string => {
  if (pct === null) return '#bfbfbf';
  if (pct >= 98) return '#047857';
  if (pct >= 90) return '#d48806';
  return '#cf1322';
};

const PctBar: React.FC<{ pct: number | null }> = ({ pct }) =>
  pct === null ? (
    <Text type="secondary">—</Text>
  ) : (
    <Space size={8} style={{ minWidth: 150 }}>
      <Progress percent={pct} showInfo={false} size="small" strokeColor={pctColor(pct)} style={{ width: 90, margin: 0 }} />
      <Text strong style={{ color: pctColor(pct), fontVariantNumeric: 'tabular-nums' }}>
        {pct.toFixed(1)}%
      </Text>
    </Space>
  );


const OutageList: React.FC<{ outages: AvailabilityOutage[] }> = ({ outages }) => {
  if (!outages.length) return <Text type="secondary">Uzilish bo'lmagan</Text>;
  const sorted = [...outages].sort((a, b) => Date.parse(b.start) - Date.parse(a.start));
  return (
    <Table<AvailabilityOutage>
      size="small"
      pagination={sorted.length > 8 ? { pageSize: 8, size: 'small' } : false}
      rowKey={(o) => o.start}
      dataSource={sorted}
      columns={[
        { title: 'Boshlandi', dataIndex: 'start', width: 110, render: (v: string) => formatTime(v) },
        {
          title: 'Tugadi',
          dataIndex: 'end',
          width: 130,
          render: (v: string | null) => (v ? formatTime(v) : <Tag color="red">davom etmoqda</Tag>),
        },
        {
          title: "Yo'qotilgan vaqt",
          dataIndex: 'downtimeMinutes',
          width: 130,
          render: (v: number) => formatDuration(v),
        },
        {
          title: 'Turi',
          dataIndex: 'kind',
          width: 150,
          render: (v: AvailabilityOutage['kind']) =>
            v === 'silent' ? (
              <Tooltip title="Invertor hech narsa yubormadi: odatda elektr yoki internet uzilishi">
                <Tag>Aloqa yo'q</Tag>
              </Tooltip>
            ) : (
              <Tooltip title="Invertor aloqada edi, lekin ishlab chiqarmadi: nosozlik, tarmoq yoki o'chirilgan avtomat">
                <Tag color="volcano">Ishlab chiqarmadi</Tag>
              </Tooltip>
            ),
        },
        {
          title: 'Vendor alarmi',
          dataIndex: 'causes',
          render: (v: string[]) => (v.length ? v.join(', ') : <Text type="secondary">alarm yo'q</Text>),
        },
      ]}
    />
  );
};

const InverterBlock: React.FC<{ inverter: AvailabilityInverter; single: boolean }> = ({ inverter, single }) => (
  <div style={{ display: 'grid', gap: 8 }}>
    {!single || inverter.neverReported || inverter.connectionOnly || inverter.firstSeen ? (
      <Space wrap size={[12, 4]}>
        <Text strong>Invertor {inverter.sn}</Text>
        {!inverter.neverReported && <PctBar pct={inverter.availabilityPct} />}
        {inverter.neverReported && (
          <Tag color="default">Hech ma'lumot yubormagan, hisobga olinmadi (almashtirilgan bo'lishi mumkin)</Tag>
        )}
        {inverter.connectionOnly && (
          <Tooltip title="Bu qurilma hech qachon ishlab chiqarish quvvatini ko'rsatmagan, shuning uchun faqat aloqada bo'lgan vaqti hisoblanadi">
            <Tag color="purple">Faqat aloqa bo'yicha</Tag>
          </Tooltip>
        )}
        {inverter.firstSeen && <Tag color="cyan">{formatTime(inverter.firstSeen)} dan beri ulangan</Tag>}
      </Space>
    ) : null}
    {!inverter.neverReported && <OutageList outages={inverter.outages} />}
  </div>
);

const AvailabilityPage: React.FC = () => {
  const [range, setRange] = useState<Range>('30');
  const [report, setReport] = useState<AvailabilityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const from =
      range === 'all'
        ? '2000-01-01'
        : new Date(Date.now() + TASHKENT_MS - (Number(range) - 1) * 86_400_000).toISOString().slice(0, 10);
    availabilityService
      .getReport(from)
      .then((data) => {
        if (!cancelled) {
          setReport(data);
          setFailed(false);
        }
      })
      .catch(() => !cancelled && setFailed(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [range]);

  const downNow = useMemo(() => report?.stations.filter((s) => s.downNow).length ?? 0, [report]);

  const columns: ColumnsType<AvailabilityStation> = [
    {
      title: 'Stansiya',
      dataIndex: 'name',
      render: (name: string, s) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          <Space size={4} wrap>
            {providerTag(s.provider)}
            {s.inverters.length > 1 && (
              <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                {s.inverters.length} ta invertor
              </Text>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: 'Ishlash foizi',
      dataIndex: 'availabilityPct',
      sorter: (a, b) => (a.availabilityPct ?? 101) - (b.availabilityPct ?? 101),
      render: (pct: number | null) => <PctBar pct={pct} />,
    },
    {
      title: "To'xtab qolgan vaqt",
      dataIndex: 'downMinutes',
      sorter: (a, b) => a.downMinutes - b.downMinutes,
      render: (v: number) => (v ? formatHours(v) : <Text type="secondary">0</Text>),
    },
    {
      title: 'Uzilishlar',
      dataIndex: 'outageCount',
      sorter: (a, b) => a.outageCount - b.outageCount,
      render: (n: number, s) =>
        n ? (
          <Space direction="vertical" size={0}>
            <Text>{n} ta</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              eng uzuni {formatDuration(s.longestOutageMinutes)}
            </Text>
          </Space>
        ) : (
          <Text type="secondary">0</Text>
        ),
    },
    {
      title: 'Hozir',
      dataIndex: 'downNow',
      filters: [{ text: 'Ishlamayotganlar', value: true }],
      onFilter: (v, s) => s.downNow === v,
      render: (down: boolean) => (down ? <Tag color="red">Ishlamayapti</Tag> : <Tag color="green">Ishlayapti</Tag>),
    },
  ];

  return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1fr)' }}>
      <Space style={{ justifyContent: 'space-between', width: '100%' }} wrap>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Ishlash foizi va to'xtab qolgan vaqt
        </Typography.Title>
        <Segmented<Range>
          value={range}
          onChange={setRange}
          options={[
            { label: '7 kun', value: '7' },
            { label: '30 kun', value: '30' },
            { label: 'Boshidan', value: 'all' },
          ]}
        />
      </Space>

      {failed && <Alert type="error" showIcon message="Ma'lumotni olib bo'lmadi. Sahifani yangilab ko'ring." />}

      <Spin spinning={loading}>
        {report && (
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1fr)' }}>
            <Row gutter={[16, 16]}>
              <Col xs={12} lg={6}>
                <Card size="small">
                  <Statistic
                    title="Butun park"
                    value={report.fleet.availabilityPct ?? '—'}
                    suffix={report.fleet.availabilityPct !== null ? '%' : undefined}
                    precision={1}
                    valueStyle={{ color: pctColor(report.fleet.availabilityPct) }}
                  />
                </Card>
              </Col>
              <Col xs={12} lg={6}>
                <Card size="small">
                  <Statistic title="To'xtab qolgan vaqt (jami)" value={formatHours(report.fleet.downMinutes)} />
                </Card>
              </Col>
              <Col xs={12} lg={6}>
                <Card size="small">
                  <Statistic
                    title="Hozir ishlamayotgan stansiyalar"
                    value={downNow}
                    suffix={`/ ${report.fleet.stations}`}
                    valueStyle={{ color: downNow ? '#cf1322' : undefined }}
                  />
                </Card>
              </Col>
              <Col xs={12} lg={6}>
                <Card size="small">
                  <Statistic
                    title={
                      <Space size={4}>
                        Davr
                        <Tooltip title={`O'lchov ${report.measuredSince} dan boshlangan. Undan oldingi davr uchun 5 daqiqalik ma'lumot saqlanmagan.`}>
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    value={`${report.from.slice(8, 10)}.${report.from.slice(5, 7)} – ${report.to.slice(8, 10)}.${report.to.slice(5, 7)}`}
                  />
                </Card>
              </Col>
            </Row>

            <Card size="small" styles={{ body: { padding: 0 } }}>
              {report.stations.length ? (
                <Table<AvailabilityStation>
                  rowKey={(s) => `${s.provider}:${s.stationId}`}
                  dataSource={report.stations}
                  columns={columns}
                  pagination={false}
                  scroll={{ x: 760 }}
                  expandable={{
                    expandedRowRender: (s) => (
                      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1fr)' }}>
                        {s.inverters.map((inv) => (
                          <InverterBlock key={inv.sn} inverter={inv} single={s.inverters.length === 1} />
                        ))}
                      </div>
                    ),
                  }}
                />
              ) : (
                <Empty style={{ padding: 32 }} description="Stansiya yo'q" />
              )}
            </Card>

            <Paragraph type="secondary" style={{ fontSize: 13, margin: 0 }}>
              Qanday hisoblanadi: kunduzi, quyosh chiqqandan 1 soat keyin va botishidan 1 soat oldingacha bo'lgan vaqt{' '}
              {report.slotMinutes} daqiqalik bo'laklarga bo'linadi. Invertor bo'lakda quvvat bergan bo'lsa, u ishlagan hisoblanadi. Quvvat bermagan yoki
              umuman ma'lumot yubormagan bo'lsa, to'xtagan hisoblanadi. Kechasi hisobga olinmaydi. Quyidagi vaqtlar ham hisobga olinmaydi:
              bizning tizim ma'lumot yig'a olmagan vaqt va butun parkning ko'pi bir vaqtda quvvat bermagan vaqt (bulut yoki tarmoq).
              Bu davr jami {formatHours(report.fleet.unknownMinutes)}. Vendor alarmi uzilish vaqtida ochiq bo'lgan
              ogohlantirishni ko'rsatadi.
            </Paragraph>
          </div>
        )}
      </Spin>
    </div>
  );
};

export default AvailabilityPage;
