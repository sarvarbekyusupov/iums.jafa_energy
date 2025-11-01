import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Progress,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Space,
  message,
  Alert,
  Spin,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  SyncOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { fsolarMonitorService } from '../../../service/fsolar';
import type { TaskRuntimeDetail, DeviceCommandStatus } from '../../../types/fsolar';
import { useLocation, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const TaskMonitoring: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<TaskRuntimeDetail | null>(null);
  const [taskId, setTaskId] = useState<string | number | null>(null);
  const [runTaskRecordId, setRunTaskRecordId] = useState<string | number | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Get task info from navigation state or localStorage
    const state = location.state as any;
    if (state?.taskId && state?.runTaskRecordId) {
      setTaskId(state.taskId);
      setRunTaskRecordId(state.runTaskRecordId);
      startMonitoring(state.taskId, state.runTaskRecordId);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const startMonitoring = (tId: string | number, recordId: string | number) => {
    setIsMonitoring(true);

    // Wait 2 seconds before first poll to let server process the task
    setTimeout(() => {
      fetchStatus(tId, recordId);
    }, 2000);

    const id = setInterval(async () => {
      fetchStatus(tId, recordId);
    }, 5000); // Poll every 5 seconds

    setIntervalId(id);
  };

  const fetchStatus = async (tId: string | number, recordId: string | number) => {
    try {
      setLoading(true);
      const result = await fsolarMonitorService.getTaskRuntimeDetail({
        taskId: tId,
        runTaskRecordId: recordId,
      });
      setStatus(result);

      // Stop monitoring if task is complete
      if (result.taskStatus === 1 && intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
        setIsMonitoring(false);
        message.success('Task completed!');
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Failed to fetch task status';
      const statusCode = error?.response?.data?.statusCode;

      // Silently retry "Server busy" errors - this is expected while Fsolar processes the task
      const isServerBusy = errorMsg === 'Server busy' || statusCode === 400;

      if (!isServerBusy) {
        console.error('Task monitoring error:', errorMsg, error?.response?.data);
        message.error(errorMsg);
        if (intervalId) {
          clearInterval(intervalId);
          setIntervalId(null);
          setIsMonitoring(false);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (): number => {
    if (!status) return 0;
    return fsolarMonitorService.getProgressPercentage(status);
  };

  const getStatusColor = (commandStatus: number): string => {
    if (commandStatus === 1) return 'success';
    if (commandStatus === 0) return 'error';
    return 'processing';
  };

  const getStatusIcon = (commandStatus: number) => {
    if (commandStatus === 1) return <CheckCircleOutlined />;
    if (commandStatus === 0) return <CloseCircleOutlined />;
    return <ClockCircleOutlined />;
  };

  const columns: ColumnsType<DeviceCommandStatus> = [
    {
      title: 'Device SN',
      dataIndex: 'deviceSn',
      key: 'deviceSn',
    },
    {
      title: 'Alias',
      dataIndex: 'alias',
      key: 'alias',
    },
    {
      title: 'Command ID',
      dataIndex: 'commandId',
      key: 'commandId',
    },
    {
      title: 'Status',
      dataIndex: 'commandStatus',
      key: 'commandStatus',
      render: (commandStatus: number) => {
        const statusText = commandStatus === 1 ? 'Success' : commandStatus === 0 ? 'Failed' : 'Waiting';
        return (
          <Tag color={getStatusColor(commandStatus)} icon={getStatusIcon(commandStatus)}>
            {statusText}
          </Tag>
        );
      },
    },
  ];

  if (!taskId || !runTaskRecordId) {
    return (
      <Card>
        <Alert
          message="No Task Selected"
          description="Please start a task from the Tasks Management page to monitor it here."
          type="info"
          showIcon
          action={
            <Button type="primary" onClick={() => navigate('/admin/fsolar/tasks')}>
              Go to Tasks
            </Button>
          }
        />
      </Card>
    );
  }

  const summary = status ? fsolarMonitorService.getTaskSummary(status) : null;

  // Show loading state while waiting for initial data
  if (!status && isMonitoring) {
    return (
      <div>
        <Title level={2}>Task Execution Monitoring</Title>
        <Card>
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" indicator={<SyncOutlined spin style={{ fontSize: 48 }} />} />
            <div style={{ marginTop: 24 }}>
              <Title level={4}>
                <RocketOutlined style={{ marginRight: 8 }} />
                Task Execution Started
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Waiting for Fsolar API to process the task...
              </Text>
              <div style={{ marginTop: 16 }}>
                <Alert
                  message="Please Wait"
                  description="The task has been sent to the devices. It may take 2-10 seconds for the monitoring data to become available. This page will automatically update."
                  type="info"
                  showIcon
                  icon={<ClockCircleOutlined />}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>Task Execution Monitoring</Title>

      {status && (
        <>
          {/* Overall Progress */}
          <Card style={{ marginBottom: 16 }}>
            <Row gutter={16} align="middle">
              <Col span={12}>
                <Title level={4}>Overall Progress</Title>
                <Progress
                  percent={getProgressPercentage()}
                  status={status.taskStatus === 1 ? 'success' : 'active'}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </Col>
              <Col span={12}>
                <Space direction="vertical">
                  <Text strong>
                    Status: <Tag color={status.taskStatus === 1 ? 'success' : 'processing'}>
                      {status.taskStatus === 1 ? 'Completed' : 'Running'}
                    </Tag>
                  </Text>
                  <Text strong>
                    Remaining Time: {fsolarMonitorService.formatRemainingTime(status)}
                  </Text>
                  {isMonitoring && (
                    <Tag color="blue">
                      <ClockCircleOutlined spin /> Monitoring...
                    </Tag>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Statistics */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Devices"
                  value={summary?.total || 0}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Successful"
                  value={summary?.success || 0}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Failed"
                  value={summary?.failed || 0}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<CloseCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Success Rate"
                  value={summary?.successRate || 0}
                  precision={2}
                  suffix="%"
                  valueStyle={{ color: summary && summary.successRate > 80 ? '#3f8600' : '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Device Status Table */}
          <Card
            title="Device Execution Status"
            extra={
              <Button
                icon={<ReloadOutlined />}
                onClick={() => taskId && runTaskRecordId && fetchStatus(taskId, runTaskRecordId)}
                loading={loading}
              >
                Refresh
              </Button>
            }
          >
            <Table
              columns={columns}
              dataSource={status.detailListVOList}
              rowKey={(record) => `${record.deviceSn}-${record.commandId}`}
              pagination={false}
              loading={loading}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default TaskMonitoring;
