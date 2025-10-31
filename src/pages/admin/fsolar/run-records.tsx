import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  message,
  Typography,
  Row,
  Col,
  Statistic,
  Tag,
  Modal,
} from 'antd';
import {
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { fsolarRecordService } from '../../../service/fsolar';
import type { TaskRunRecord, RunRecordDetail } from '../../../types/fsolar';

const { Title, Text } = Typography;

const RunRecords: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<TaskRunRecord[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RunRecordDetail | null>(null);

  // Fetch records
  const fetchRecords = async (page: number = 1, pageSize: number = 20) => {
    try {
      setLoading(true);
      const result = await fsolarRecordService.listRunRecords({
        pageNum: page,
        pageSize,
      });
      setRecords(result.dataList);
      setPagination({
        current: parseInt(result.currentPage),
        pageSize: parseInt(result.pageSize),
        total: parseInt(result.total),
      });
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to fetch run records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Handle view details
  const handleViewDetails = async (record: TaskRunRecord) => {
    try {
      setLoading(true);
      const details = await fsolarRecordService.getRunRecordDetail(parseInt(record.id));
      setSelectedRecord(details);
      setDetailModalVisible(true);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to fetch record details');
    } finally {
      setLoading(false);
    }
  };

  // Handle export
  const handleExport = () => {
    try {
      const csv = fsolarRecordService.exportToCSV(records);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fsolar-run-records-${new Date().toISOString()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      message.success('Records exported successfully');
    } catch (error) {
      message.error('Failed to export records');
    }
  };

  // Table columns
  const columns: ColumnsType<TaskRunRecord> = [
    {
      title: 'Record ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
    },
    {
      title: 'Task Name',
      dataIndex: 'taskName',
      key: 'taskName',
    },
    {
      title: 'Task Type',
      dataIndex: 'taskType',
      key: 'taskType',
      width: 120,
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: 'Run Type',
      dataIndex: 'runType',
      key: 'runType',
      width: 120,
      render: (runType: number) => (
        <Tag color={runType === 0 ? 'blue' : 'orange'}>
          {runType === 0 ? 'Normal' : 'Resend'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'taskStatus',
      key: 'taskStatus',
      width: 120,
      render: (status: number) => (
        <Tag color={status === 1 ? 'success' : 'processing'}>
          {status === 1 ? 'Completed' : 'Running'}
        </Tag>
      ),
    },
    {
      title: 'Success',
      dataIndex: 'successCount',
      key: 'successCount',
      width: 100,
      render: (count: number) => (
        <Text style={{ color: '#3f8600' }}>
          <CheckCircleOutlined /> {count}
        </Text>
      ),
    },
    {
      title: 'Failed',
      dataIndex: 'failCount',
      key: 'failCount',
      width: 100,
      render: (count: number) => (
        <Text style={{ color: count > 0 ? '#cf1322' : '#999' }}>
          <CloseCircleOutlined /> {count}
        </Text>
      ),
    },
    {
      title: 'Success Rate',
      key: 'successRate',
      width: 120,
      render: (_, record) => {
        const summary = fsolarRecordService.getRecordSummary(record);
        return (
          <Text style={{ color: summary.successRate > 80 ? '#3f8600' : '#cf1322' }}>
            {summary.successRate.toFixed(1)}%
          </Text>
        );
      },
    },
    {
      title: 'Created',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (time: number) => new Date(time).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          Details
        </Button>
      ),
    },
  ];

  // Get statistics
  const completedRecords = records.filter(r => r.taskStatus === 1);
  const successfulRecords = completedRecords.filter(r => r.failCount === 0);
  const failedRecords = completedRecords.filter(r => r.failCount > 0);

  return (
    <div>
      <Title level={2}>Fsolar Task Run Records</Title>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Records"
              value={pagination.total}
              prefix={<ReloadOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Completed"
              value={completedRecords.length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Fully Successful"
              value={successfulRecords.length}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="With Failures"
              value={failedRecords.length}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table */}
      <Card
        title="Run Records"
        extra={
          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              disabled={records.length === 0}
            >
              Export CSV
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchRecords(pagination.current, pagination.pageSize)}
            >
              Refresh
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => fetchRecords(page, pageSize),
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} records`,
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Details Modal */}
      <Modal
        title="Run Record Details"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedRecord(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedRecord && (
          <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Text strong>Task Name:</Text>
                <div>{selectedRecord.taskName}</div>
              </Col>
              <Col span={12}>
                <Text strong>Status:</Text>
                <div>
                  <Tag color={selectedRecord.taskStatus === 1 ? 'success' : 'processing'}>
                    {selectedRecord.taskStatus === 1 ? 'Completed' : 'Running'}
                  </Tag>
                </div>
              </Col>
              <Col span={8}>
                <Text strong>Success Count:</Text>
                <div style={{ color: '#3f8600', fontSize: 20 }}>
                  <CheckCircleOutlined /> {selectedRecord.successCount}
                </div>
              </Col>
              <Col span={8}>
                <Text strong>Fail Count:</Text>
                <div style={{ color: '#cf1322', fontSize: 20 }}>
                  <CloseCircleOutlined /> {selectedRecord.failCount}
                </div>
              </Col>
              <Col span={8}>
                <Text strong>Success Rate:</Text>
                <div style={{ fontSize: 20 }}>
                  {fsolarRecordService.getDetailedSummary(selectedRecord).successRate.toFixed(1)}%
                </div>
              </Col>
            </Row>

            <Title level={5}>Device Results</Title>
            <Table
              dataSource={selectedRecord.detailListVOList}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
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
                  render: (status: number) => (
                    <Tag color={status === 1 ? 'success' : 'error'}>
                      {status === 1 ? 'Success' : 'Failed'}
                    </Tag>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RunRecords;
