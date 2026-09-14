import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Card, Col, Empty, Row, Segmented, Space, Spin, Statistic, Tag, Tooltip, Typography } from 'antd';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CloudOutlined, InfoCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import forecastService from '../../service/forecast.service';
import type { ForecastDay, ForecastSummary } from '../../types/forecast';
import { formatKwh, formatUzs, formatUzsShort } from '../../helpers/currency';

const { Text } = Typography;

/** WMO weather codes, grouped to the handful of words that matter for a solar day. */
const weatherLabel = (code?: number): string => {
  if (code === undefined || code === null) return '';
  if (code === 0) return 'Ochiq';
  if (code <= 2) return 'Kam bulut';
  if (code === 3) return 'Bulutli';
  if (code <= 48) return 'Tuman';
  if (code <= 67) return 'Yomg\'ir';
  if (code <= 77) return 'Qor';
  if (code <= 82) return 'Jala';
  return 'Momaqaldiroq';
};

interface ForecastCardProps {
  /** Compact drops the chart, for the narrow mobile monitor page. */
  compact?: boolean;
}

const ForecastCard: React.FC<ForecastCardProps> = ({ compact = false }) => {
  const [summary, setSummary] = useState<ForecastSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [days, setDays] = useState<7 | 15>(7);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    forecastService
      .getSummary()
      .then((data) => {
        if (!cancelled) {
          setSummary(data);
          setFailed(false);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const totals = summary ? (days === 7 ? summary.next7 : summary.next15) : null;

  const chartData = useMemo(() => {
    if (!summary) return [];
    return summary.perDay.slice(0, days).map((d: ForecastDay) => ({
      kun: dayjs(d.date).format('DD MMM'),
      kWh: Math.round(d.predictedKwh ?? 0),
      somm: Math.round(d.predictedRevenueUzs ?? 0),
      obHavo: weatherLabel(d.weatherCode),
      harorat: d.tempMax,
      ishonch: d.confidence,
    }));
  }, [summary, days]);

  const header = (
    <Space>
      <CloudOutlined />
      Ob-havo bo'yicha prognoz
    </Space>
  );

  if (loading) {
    return (
      <Card title={header}>
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <Spin />
        </div>
      </Card>
    );
  }

  if (failed || !summary || summary.stations === 0 || summary.perDay.length === 0) {
    return (
      <Card title={header}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            failed
              ? 'Prognozni olishda xato. Keyinroq urinib ko\'ring.'
              : 'Prognoz hali hisoblanmagan. U har kuni soat 5:00 va 17:00 da yangilanadi.'
          }
        />
      </Card>
    );
  }

  return (
    <Card
      title={header}
      extra={
        <Segmented
          value={days}
          onChange={(v) => setDays(v as 7 | 15)}
          options={[
            { label: '7 kun', value: 7 },
            { label: '15 kun', value: 15 },
          ]}
        />
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Statistic
            title={`${days} kunda ishlab chiqarish`}
            value={formatKwh(totals?.kwh)}
            prefix={<ThunderboltOutlined style={{ color: '#faad14' }} />}
          />
        </Col>
        <Col xs={24} sm={8}>
          {/* Shortened so the tile holds a 15-day total; the exact figure is one hover away. */}
          <Tooltip title={formatUzs(totals?.revenueUzs)}>
            <div>
              <Statistic
                title={`${days} kunda daromad`}
                value={formatUzsShort(totals?.revenueUzs)}
                valueStyle={{ color: '#389e0d' }}
              />
            </div>
          </Tooltip>
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title="Kuniga o'rtacha"
            value={formatKwh((totals?.kwh ?? 0) / Math.max(1, totals?.days ?? 1))}
          />
        </Col>
      </Row>

      <Space size={[6, 6]} wrap style={{ marginTop: 14 }}>
        <Tag>{formatUzs(summary.pricePerKwhUzs)}/kWh</Tag>
        <Tag color="blue">{summary.stations} ta stansiya</Tag>
        {days === 15 && <Tag color="gold">8-15 kun aniqligi pastroq</Tag>}
        {summary.issuedAt && (
          <Tag>Hisoblangan: {dayjs(summary.issuedAt).format('DD MMM HH:mm')}</Tag>
        )}
        {summary.coordinatesApproximate && (
          <Tooltip title="Stansiyalarning aniq koordinatasi kiritilmagan, Toshkent markazi olingan.">
            <Tag icon={<InfoCircleOutlined />}>Koordinata taxminiy</Tag>
          </Tooltip>
        )}
      </Space>

      {summary.anyDefaultRatio && (
        <Alert
          style={{ marginTop: 14 }}
          type="info"
          showIcon
          message="Ba'zi stansiyalar uchun taxminiy koeffitsiyent ishlatilgan"
          description="Stansiyaning o'z tarixi yetarli bo'lsa, koeffitsiyent uning haqiqiy ishlab chiqarishidan o'lchanadi. Yetarli bo'lmaganda sozlamadagi qiymat olinadi va bu raqam haqiqatdan farq qilishi mumkin."
        />
      )}

      {!compact && (
        <div style={{ marginTop: 18, height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="kun" tick={{ fontSize: 12 }} />
              {/* Bare numbers on the axis: the unit is in the tooltip and the tile above,
                  and a " kWh" suffix on every tick wraps the labels onto two lines. */}
              <YAxis tick={{ fontSize: 12 }} width={46} tickFormatter={(v: number) => String(Math.round(v))} />
              <ChartTooltip
                formatter={(value: any, name: string) =>
                  name === 'kWh' ? [`${value} kWh`, 'Ishlab chiqarish'] : [value, name]
                }
                labelFormatter={(label: string) => {
                  const row = chartData.find((r) => r.kun === label);
                  return row ? `${label} - ${row.obHavo}, ${row.harorat ?? '-'} C` : label;
                }}
              />
              <Bar dataKey="kWh" fill="#52c41a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 10 }}>
        Ustunlar kunlik ishlab chiqarish, kWh. Prognoz Open-Meteo quyosh radiatsiyasi modeliga asoslanadi. Daromad narxi sozlamada
        belgilanadi va hozir {formatUzs(summary.pricePerKwhUzs)} / kWh.
      </Text>
    </Card>
  );
};

export default ForecastCard;
