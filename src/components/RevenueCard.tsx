import React from 'react';
import { Card, Col, Row, Space, Statistic, Tooltip, Typography } from 'antd';
import { DollarOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { formatUzs, formatUzsShort } from '../helpers/currency';
import type { UnifiedSolarRevenue } from '../service/unified-solar.service';

interface RevenueCardProps {
  revenue?: UnifiedSolarRevenue;
  compact?: boolean;
}

/**
 * Revenue in so'm for the plants the viewer can see: produced kWh times the flat tariff the
 * backend applies (1 000 so'm per kWh). Renders nothing for an older backend that sends none.
 */
const RevenueCard: React.FC<RevenueCardProps> = ({ revenue, compact = false }) => {
  if (!revenue) return null;
  const items = [
    { title: 'Bugun', value: revenue.today, short: false },
    { title: 'Shu oy', value: revenue.month, short: true },
    { title: 'Shu yil', value: revenue.year, short: true },
    {
      title: 'Ishga tushgandan beri',
      hint:
        "Har bir stansiya ishga tushgan kunidan bugungacha ishlab chiqargan jami energiya, 1 kVt·soat = 1000 so'm hisobida. " +
        "Bu hisoblangan qiymat, haqiqatda tushgan pul emas.",
      value: revenue.lifetime,
      short: true,
    },
  ];
  return (
    <Card
      size={compact ? 'small' : 'default'}
      title={<Space><DollarOutlined /> <span>Daromad</span></Space>}
      extra={
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          1 kVt·soat = {formatUzs(revenue.pricePerKwhUzs)}
        </Typography.Text>
      }
    >
      <Row gutter={compact ? [12, 12] : [16, 16]}>
        {items.map((item) => (
          <Col xs={12} md={6} key={item.title}>
            <Statistic
              title={
                'hint' in item ? (
                  <Space size={4}>
                    {item.title}
                    <Tooltip title={item.hint}>
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                ) : (
                  item.title
                )
              }
              value={item.short ? formatUzsShort(item.value) : formatUzs(item.value)}
              valueStyle={{ fontSize: compact ? 16 : 18, whiteSpace: 'nowrap' }}
            />
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default RevenueCard;
