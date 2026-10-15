import React, { useEffect, useState } from 'react';
import { Alert, Card, Empty, Segmented, Space, Spin, Table, Tag, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { availabilityService } from '../../../service/availability.service';
import type { InverterTemperature, TemperatureReport } from '../../../types/availability';
import { providerTag } from './provider-tag';

const { Text, Paragraph } = Typography;

const TASHKENT_MS = 5 * 3_600_000;

/** Tashkent wall time whatever the viewer's own clock is set to: "12.10 14:30". */
const formatTime = (iso: string): string => {
  const d = new Date(new Date(iso).getTime() + TASHKENT_MS).toISOString();
  return `${d.slice(8, 10)}.${d.slice(5, 7)} ${d.slice(11, 16)}`;
};

const Temp: React.FC<{ value: number | null; warn: number }> = ({ value, warn }) => {
  if (value === null) return <Text type="secondary">—</Text>;
  const color = value >= warn ? '#cf1322' : value >= warn - 5 ? '#d48806' : undefined;
  return (
    <Text strong={value >= warn - 5} style={{ color, fontVariantNumeric: 'tabular-nums' }}>
      {value.toFixed(1)}°C
    </Text>
  );
};

const TemperaturePage: React.FC = () => {
  const [days, setDays] = useState<7 | 30>(30);
  const [report, setReport] = useState<TemperatureReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    availabilityService
      .getTemperatures(days)
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
  }, [days]);

  const warnOf = (i: InverterTemperature) => report?.warnCelsius[i.provider] ?? 62;
  const columns: ColumnsType<InverterTemperature> = [
    {
      title: 'Stansiya / invertor',
      dataIndex: 'station',
      sorter: (a, b) => a.station.localeCompare(b.station),
      render: (station: string, i) => (
        <Space direction="vertical" size={0}>
          <Text strong>{station}</Text>
          <Space size={4} wrap>
            {providerTag(i.provider)}
            <Text type="secondary" style={{ fontSize: 12 }}>
              {i.sn}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Hozir',
      dataIndex: 'currentCelsius',
      sorter: (a, b) => (a.currentCelsius ?? -99) - (b.currentCelsius ?? -99),
      render: (v: number | null, i) =>
        v === null ? (
          <Tooltip title="Oxirgi 30 daqiqada o'lchov kelmagan: kechasi yoki invertor aloqasiz">
            <Text type="secondary">—</Text>
          </Tooltip>
        ) : (
          <Tooltip title={i.currentAt ? formatTime(i.currentAt) : undefined}>
            <span>
              <Temp value={v} warn={warnOf(i)} />
            </span>
          </Tooltip>
        ),
    },
    {
      title: 'Bugun eng yuqori',
      dataIndex: 'todayMaxCelsius',
      sorter: (a, b) => (a.todayMaxCelsius ?? -99) - (b.todayMaxCelsius ?? -99),
      render: (v: number | null, i) => <Temp value={v} warn={warnOf(i)} />,
    },
    {
      title: `${report?.windowDays ?? days} kunda eng yuqori`,
      dataIndex: 'windowMaxCelsius',
      defaultSortOrder: 'descend',
      sorter: (a, b) => (a.windowMaxCelsius ?? -99) - (b.windowMaxCelsius ?? -99),
      render: (v: number | null, i) => (
        <Space direction="vertical" size={0}>
          <Temp value={v} warn={warnOf(i)} />
          {i.windowMaxAt && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatTime(i.windowMaxAt)}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Holat',
      dataIndex: 'hotNow',
      render: (hot: boolean, i) =>
        hot ? (
          <Tag color="red">Qizib ketgan</Tag>
        ) : i.hotMinutes ? (
          <Tooltip title={`Chegaradan yuqori bo'lgan vaqt: ${Math.round(i.hotMinutes / 6) / 10} soat`}>
            <Tag color="orange">Qizigan payti bo'lgan</Tag>
          </Tooltip>
        ) : (
          <Tag color="green">Me'yorda</Tag>
        ),
    },
  ];

  return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1fr)' }}>
      <Space style={{ justifyContent: 'space-between', width: '100%' }} wrap>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Invertor harorati
        </Typography.Title>
        <Segmented<7 | 30>
          value={days}
          onChange={setDays}
          options={[
            { label: '7 kun', value: 7 },
            { label: '30 kun', value: 30 },
          ]}
        />
      </Space>

      {failed && <Alert type="error" showIcon message="Ma'lumotni olib bo'lmadi. Sahifani yangilab ko'ring." />}

      <Spin spinning={loading}>
        <Card size="small" styles={{ body: { padding: 0 } }}>
          {report && report.inverters.length ? (
            <Table<InverterTemperature>
              rowKey={(i) => `${i.provider}:${i.sn}`}
              dataSource={report.inverters}
              columns={columns}
              pagination={false}
              scroll={{ x: 700 }}
            />
          ) : (
            <Empty style={{ padding: 32 }} description={loading ? ' ' : "Harorat ma'lumoti yo'q"} />
          )}
        </Card>
      </Spin>

      <Paragraph type="secondary" style={{ fontSize: 13, margin: 0 }}>
        Ogohlantirish chegarasi: HopeCloud {report?.warnCelsius.hopecloud ?? 60}°C, SolisCloud {report?.warnCelsius.soliscloud ?? 62}°C,
        Huawei {report?.warnCelsius.huawei ?? 65}°C.
        Invertor harorati ketma-ket ikki o'lchovda (10 daqiqa) chegaradan yuqori bo'lsa, Telegram'ga xabar ketadi. Chegaradan 5°C pastga
        tushganda yana xabar keladi. HopeCloud invertorlari 55°C da ventilyatorni yoqib, haroratni darhol 43°C gacha tushiradi. Shuning
        uchun 60°C dan yuqori harorat ventilyator ishlamayotganini bildiradi. Katta SolisCloud invertorlari xuddi shunday 58,4°C dan
        oshmaydi, kichiklari 51°C dan oshmaydi. Qizigan invertor quvvatini o'zi kamaytiradi, keyin o'chib qolishi mumkin. Odatiy sabablar: ventilyator ishlamay
        qolgan, radiatorda chang, invertor to'g'ridan-to'g'ri quyosh ostida. Haroratlar 10-sentabrdan beri saqlanmoqda.
      </Paragraph>
    </div>
  );
};

export default TemperaturePage;
