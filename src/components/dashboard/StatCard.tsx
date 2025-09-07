import React from 'react';
import { Card, Statistic, Progress } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface StatCardProps {
  title: string;
  value: number;
  prefix?: React.ReactNode;
  color: string;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
  subtitle?: string;
  showProgress?: boolean;
  progressPercent?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  prefix,
  color,
  trend,
  subtitle,
  showProgress = false,
  progressPercent = 0,
}) => {
  return (
    <Card hoverable style={{ borderRadius: '8px', height: '100%' }}>
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        valueStyle={{ color }}
        suffix={
          trend && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: '12px', 
              marginTop: '4px' 
            }}>
              {trend.direction === 'up' ? (
                <ArrowUpOutlined style={{ color: '#3f8600', marginRight: '4px' }} />
              ) : (
                <ArrowDownOutlined style={{ color: '#cf1322', marginRight: '4px' }} />
              )}
              <span style={{ color: trend.direction === 'up' ? '#3f8600' : '#cf1322' }}>
                {trend.value}
              </span>
            </div>
          )
        }
      />
      {subtitle && (
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
          {subtitle}
        </div>
      )}
      {showProgress && (
        <Progress 
          percent={progressPercent} 
          showInfo={false} 
          size="small"
          style={{ marginTop: '8px' }}
        />
      )}
    </Card>
  );
};

export default StatCard;