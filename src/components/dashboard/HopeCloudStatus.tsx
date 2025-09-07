import React, { useState, useEffect } from 'react';
import { Card, Space, Typography, Spin, Alert, Button, Tag } from 'antd';
import { 
  CloudServerOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  SyncOutlined,
  ThunderboltOutlined 
} from '@ant-design/icons';
import { hopeCloudService } from '../../service';
import type { HopeCloudHealthStatus, HopeCloudBatchStatus } from '../../types/hopecloud';

const { Text } = Typography;

const HopeCloudStatus: React.FC = () => {
  const [health, setHealth] = useState<HopeCloudHealthStatus | null>(null);
  const [batchStatus, setBatchStatus] = useState<HopeCloudBatchStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [healthData, batchData] = await Promise.all([
        hopeCloudService.getHealth(),
        hopeCloudService.getBatchStatus()
      ]);
      
      setHealth(healthData);
      setBatchStatus(batchData);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch HopeCloud status');
    } finally {
      setLoading(false);
    }
  };

  const triggerRealtimeSync = async () => {
    try {
      setSyncing(true);
      await hopeCloudService.triggerRealtimeSync();
      // Refresh status after sync
      await fetchStatus();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to trigger sync');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !health) {
    return (
      <Card className="glass-card">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '12px' }}>
            <Text>Loading HopeCloud status...</Text>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card">
        <Alert
          message="HopeCloud Status Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={fetchStatus} loading={loading}>
              Retry
            </Button>
          }
        />
      </Card>
    );
  }

  const isHealthy = health?.status === 'healthy';
  const isAuthenticated = health?.details?.authentication?.valid;

  return (
    <Card
      className="glass-card"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
            padding: '8px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CloudServerOutlined style={{ color: 'white', fontSize: '16px' }} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 600, color: 'rgba(0,0,0,0.8)' }}>
            HopeCloud Integration
          </span>
          {isHealthy ? (
            <CheckCircleOutlined style={{ color: '#10b981', fontSize: '16px' }} />
          ) : (
            <ExclamationCircleOutlined style={{ color: '#f59e0b', fontSize: '16px' }} />
          )}
        </div>
      }
      extra={
        <Space>
          <Button 
            size="small" 
            icon={<SyncOutlined />} 
            onClick={triggerRealtimeSync}
            loading={syncing}
            type="text"
            style={{ color: '#f59e0b' }}
          >
            Sync
          </Button>
          <Button 
            size="small" 
            icon={<SyncOutlined />} 
            onClick={fetchStatus}
            loading={loading}
            type="text"
          >
            Refresh
          </Button>
        </Space>
      }
      style={{ height: '280px' }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Authentication Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isAuthenticated 
                ? 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)'
                : 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
              boxShadow: `0 2px 8px ${isAuthenticated ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`
            }} />
            <Text style={{ fontSize: '14px', fontWeight: 500 }}>Authentication</Text>
          </div>
          <Tag color={isAuthenticated ? 'success' : 'warning'}>
            {isAuthenticated ? 'Valid' : 'Invalid'}
          </Tag>
        </div>

        {/* Circuit Breaker Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: health?.details?.circuitBreaker?.state === 'CLOSED'
                ? 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)'
                : 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
              boxShadow: `0 2px 8px ${
                health?.details?.circuitBreaker?.state === 'CLOSED' 
                  ? 'rgba(16, 185, 129, 0.4)' 
                  : 'rgba(245, 158, 11, 0.4)'
              }`
            }} />
            <Text style={{ fontSize: '14px', fontWeight: 500 }}>Circuit Breaker</Text>
          </div>
          <Tag color={health?.details?.circuitBreaker?.state === 'CLOSED' ? 'success' : 'warning'}>
            {health?.details?.circuitBreaker?.state || 'Unknown'}
          </Tag>
        </div>

        {/* Processing Status */}
        {batchStatus && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ThunderboltOutlined style={{ color: batchStatus.realtimeProcessing ? '#10b981' : '#9ca3af', fontSize: '14px' }} />
                <Text style={{ fontSize: '14px', fontWeight: 500 }}>Realtime Processing</Text>
              </div>
              <Tag color={batchStatus.realtimeProcessing ? 'processing' : 'default'}>
                {batchStatus.realtimeProcessing ? 'Active' : 'Idle'}
              </Tag>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ThunderboltOutlined style={{ color: batchStatus.dailyProcessing ? '#10b981' : '#9ca3af', fontSize: '14px' }} />
                <Text style={{ fontSize: '14px', fontWeight: 500 }}>Daily Processing</Text>
              </div>
              <Tag color={batchStatus.dailyProcessing ? 'processing' : 'default'}>
                {batchStatus.dailyProcessing ? 'Active' : 'Idle'}
              </Tag>
            </div>
          </>
        )}

        {/* Overall Status */}
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          background: isHealthy 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%)',
          border: `1px solid ${isHealthy ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
          textAlign: 'center'
        }}>
          <Text style={{ 
            color: isHealthy ? '#10b981' : '#f59e0b',
            fontWeight: 600,
            fontSize: '14px'
          }}>
            {isHealthy ? '✅ Integration Healthy' : '⚠️ Issues Detected'}
          </Text>
        </div>
      </Space>
    </Card>
  );
};

export default HopeCloudStatus;