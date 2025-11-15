import React, { useState, useEffect } from 'react';
import { Card, Table, Space, Tag, message, Button, Input, Row, Col, Statistic, Typography, Badge, Switch } from 'antd';
import {
  BellOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  DatabaseOutlined,
  CloudOutlined,
} from '@ant-design/icons';
import solisCloudService from '../../../service/soliscloud.service';
import type { DeviceAlarm } from '../../../types/soliscloud';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const SolisCloudAlarms: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [alarms, setAlarms] = useState<DeviceAlarm[]>([]);
  const [filteredAlarms, setFilteredAlarms] = useState<DeviceAlarm[]>([]);
  const [searchText, setSearchText] = useState('');
  const [useDbSource, setUseDbSource] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  useEffect(() => {
    fetchAlarms();
  }, [pagination.current, pagination.pageSize, useDbSource]);

  useEffect(() => {
    filterAlarms();
  }, [searchText, alarms]);

  const fetchAlarms = async () => {
    try {
      setLoading(true);
      let response;

      if (useDbSource) {
        response = await solisCloudService.getDbAlarms({
          page: pagination.current,
          limit: pagination.pageSize,
        });
        const dbAlarms = (response.data?.records || response.data || []).map((alarm: any, idx: number) => ({
          ...alarm,
          uniqueIndex: `${pagination.current}-${idx}`,
          alarmLevel: alarm.level?.toString() || alarm.alarmLevel,
          alarmMsg: alarm.message || alarm.alarmMsg,
          alarmCode: alarm.code || alarm.alarmCode,
          alarmBeginTime: alarm.startTime || alarm.alarmBeginTime,
          alarmEndTime: alarm.endTime || alarm.alarmEndTime,
          state: alarm.status?.toString() || alarm.state,
        }));
        setAlarms(dbAlarms);
        setFilteredAlarms(dbAlarms);
        setPagination(prev => ({ ...prev, total: response.data?.total || dbAlarms.length }));
      } else {
        response = await solisCloudService.getAlarmList({
          pageNo: pagination.current,
          pageSize: pagination.pageSize,
        });
        const alarmsWithIndex = (response.records || []).map((alarm, idx) => ({
          ...alarm,
          uniqueIndex: `${pagination.current}-${idx}`,
        }));
        setAlarms(alarmsWithIndex);
        setFilteredAlarms(alarmsWithIndex);
        setPagination(prev => ({ ...prev, total: response.total || 0 }));
      }
    } catch (error: any) {
      message.error(error?.response?.data?.msg || 'Failed to fetch alarms');
    } finally {
      setLoading(false);
    }
  };

  const filterAlarms = () => {
    if (!searchText) {
      setFilteredAlarms(alarms);
      return;
    }

    const filtered = alarms.filter(alarm =>
      alarm.stationName?.toLowerCase().includes(searchText.toLowerCase()) ||
      alarm.alarmDeviceSn?.toLowerCase().includes(searchText.toLowerCase()) ||
      alarm.alarmMsg?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredAlarms(filtered);
  };

  const handleTableChange = (newPagination: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total,
    });
  };

  const getStateTag = (state: string) => {
    return state === '0' ? (
      <Badge status="error" text="Active" />
    ) : (
      <Badge status="success" text="Resolved" />
    );
  };

  const getLevelTag = (level: string) => {
    switch (level) {
      case '1':
        return <Tag color="warning" icon={<InfoCircleOutlined />}>Warning</Tag>;
      case '2':
        return <Tag color="error" icon={<WarningOutlined />}>Fault</Tag>;
      case '3':
        return <Tag color="red" icon={<CloseCircleOutlined />}>Critical</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const columns = [
    {
      title: 'Level',
      dataIndex: 'alarmLevel',
      key: 'alarmLevel',
      width: 100,
      fixed: 'left' as const,
      render: (level: string) => getLevelTag(level),
      filters: [
        { text: 'Warning', value: '1' },
        { text: 'Fault', value: '2' },
        { text: 'Critical', value: '3' },
      ],
      onFilter: (value: any, record: DeviceAlarm) => record.alarmLevel === value,
    },
    {
      title: 'Alarm Message',
      dataIndex: 'alarmMsg',
      key: 'alarmMsg',
      width: 200,
      ellipsis: true,
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: 'Alarm Code',
      dataIndex: 'alarmCode',
      key: 'alarmCode',
      width: 100,
      render: (text: string) => <Text code>{text || '-'}</Text>,
    },
    {
      title: 'Start Time',
      dataIndex: 'alarmBeginTime',
      key: 'alarmBeginTime',
      width: 150,
      render: (time: number) => time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-',
      sorter: (a: DeviceAlarm, b: DeviceAlarm) => (a.alarmBeginTime || 0) - (b.alarmBeginTime || 0),
    },
    {
      title: 'End Time',
      dataIndex: 'alarmEndTime',
      key: 'alarmEndTime',
      width: 150,
      render: (time: number) => time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: 'Advice',
      dataIndex: 'advice',
      key: 'advice',
      width: 300,
      ellipsis: { showTitle: false },
      render: (text: string) => (
        <Text ellipsis={{ tooltip: text }} style={{ maxWidth: 280 }}>
          {text || 'No Action Required'}
        </Text>
      ),
    },
  ];

  const activeAlarms = alarms.filter(a => a.state === '0').length;
  const resolvedAlarms = alarms.filter(a => a.state === '1').length;
  const warningAlarms = alarms.filter(a => a.alarmLevel === '1').length;
  const faultAlarms = alarms.filter(a => a.alarmLevel === '2').length;
  const criticalAlarms = alarms.filter(a => a.alarmLevel === '3').length;

  return (
    <div>
      {/* Header */}
      <Card
        style={{
          marginBottom: 24,
          border: 'none',
        }}
      >
        <Space direction="vertical" size="small">
          <Space>
            <BellOutlined style={{ fontSize: 32 }} />
            <Title level={2} style={{ margin: 0 }}>
              System Alarms
            </Title>
          </Space>
          <Text style={{ color: 'rgba(0,0,0,0.65)' }}>
            {activeAlarms > 0
              ? `⚠️ ${activeAlarms} active alarm${activeAlarms > 1 ? 's' : ''} require attention`
              : '✓ All systems operating normally'}
          </Text>
        </Space>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Alarms"
              value={activeAlarms}
              prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Resolved"
              value={resolvedAlarms}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Critical"
              value={criticalAlarms}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Warnings"
              value={warningAlarms}
              prefix={<InfoCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Alarms Table */}
      <Card
        title={
          <Space>
            <BellOutlined />
            <span>Alarm History</span>
            {activeAlarms > 0 && <Badge count={activeAlarms} />}
          </Space>
        }
        extra={
          <Space>
            <Space>
              <Switch
                checked={useDbSource}
                onChange={setUseDbSource}
                checkedChildren={<DatabaseOutlined />}
                unCheckedChildren={<CloudOutlined />}
              />
              <Tag color={useDbSource ? 'blue' : 'red'}>
                {useDbSource ? 'Database' : 'Real-time API'}
              </Tag>
            </Space>
            <Input
              placeholder="Search by station, device or message"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchAlarms}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredAlarms}
          rowKey={(record: any) => record.uniqueIndex || `${record.id}-${record.alarmDeviceSn}-${record.alarmBeginTime}`}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} alarms`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          rowClassName={(record) => record.state === '0' ? 'active-alarm-row' : ''}
        />
      </Card>

      <style>{`
        .active-alarm-row {
          background-color: #fff1f0 !important;
        }
        .active-alarm-row:hover {
          background-color: #ffe7e6 !important;
        }
      `}</style>
    </div>
  );
};

export default SolisCloudAlarms;
