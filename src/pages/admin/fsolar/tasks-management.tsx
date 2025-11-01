import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  message,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Typography,
  Row,
  Col,
  Statistic,
  Tag,
} from 'antd';
import {
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { fsolarTaskService, fsolarTemplateService, fsolarDeviceService } from '../../../service/fsolar';
import type { EconomicTask } from '../../../types/fsolar';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const TasksManagement: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<EconomicTask[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedTask, setSelectedTask] = useState<EconomicTask | null>(null);
  const [form] = Form.useForm();

  // Fetch data
  const fetchTasks = async (page: number = 1, pageSize: number = 20) => {
    try {
      setLoading(true);
      const result = await fsolarTaskService.listTasks({
        pageNum: page,
        pageSize,
      });
      setTasks(result.dataList);
      setPagination({
        current: parseInt(result.currentPage),
        pageSize: parseInt(result.pageSize),
        total: parseInt(result.total),
      });
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const result = await fsolarTemplateService.getAllTemplates();
      setTemplates(result);
    } catch (error) {
      console.error('Failed to fetch templates', error);
    }
  };

  const fetchDevices = async () => {
    try {
      const result = await fsolarDeviceService.getAllDevices();
      setDevices(result);
    } catch (error) {
      console.error('Failed to fetch devices', error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchTemplates();
    fetchDevices();
  }, []);

  // Handle submit
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const taskData = {
        taskName: values.taskName,
        templateId: values.templateId,
        taskType: 'device',
        targetList: values.deviceIdList.map((deviceId: string) => ({ deviceId })),
      };

      if (modalMode === 'add') {
        await fsolarTaskService.addTask(taskData);
        message.success('Task created successfully');
      } else if (modalMode === 'edit' && selectedTask) {
        await fsolarTaskService.updateTask(parseInt(selectedTask.id), taskData);
        message.success('Task updated successfully');
      }

      setModalVisible(false);
      form.resetFields();
      fetchTasks(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error?.response?.data?.message || `Failed to ${modalMode} task`);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await fsolarTaskService.deleteTask(parseInt(id));
      message.success('Task deleted successfully');
      fetchTasks(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (task: EconomicTask) => {
    form.setFieldsValue({
      taskName: task.taskName,
      templateId: parseInt(task.templateId),
    });
    setSelectedTask(task);
    setModalMode('edit');
    setModalVisible(true);
  };

  // Handle run task
  const handleRunTask = async (taskId: string) => {
    try {
      setLoading(true);
      const result = await fsolarTaskService.runTaskNormal(parseInt(taskId));
      message.success('Task started successfully!');
      // Navigate to monitoring page with the run record ID
      navigate('/admin/fsolar/monitor', {
        state: {
          taskId: parseInt(taskId),
          runTaskRecordId: parseInt(result.runTaskRecordId),
        },
      });
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to run task');
    } finally {
      setLoading(false);
    }
  };

  // Columns
  const columns: ColumnsType<EconomicTask> = [
    {
      title: 'Task ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: 'Task Name',
      dataIndex: 'taskName',
      key: 'taskName',
    },
    {
      title: 'Template ID',
      dataIndex: 'templateId',
      key: 'templateId',
      width: 120,
    },
    {
      title: 'Task Type',
      dataIndex: 'taskType',
      key: 'taskType',
      width: 120,
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (time: number) => new Date(time).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 280,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => handleRunTask(record.id)}
            size="small"
          >
            Run
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Task"
            description="Are you sure you want to delete this task?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Fsolar Economic Tasks</Title>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Total Tasks" value={pagination.total} />
          </Card>
        </Col>
      </Row>

      {/* Main Table */}
      <Card
        title="Tasks List"
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchTasks(pagination.current, pagination.pageSize)}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setModalMode('add');
                setSelectedTask(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              Add Task
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => fetchTasks(page, pageSize),
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} tasks`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={modalMode === 'add' ? 'Add Task' : 'Edit Task'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setSelectedTask(null);
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="taskName"
            label="Task Name"
            rules={[{ required: true, message: 'Please enter task name' }]}
          >
            <Input placeholder="Enter task name" />
          </Form.Item>

          <Form.Item
            name="templateId"
            label="Strategy Template"
            rules={[{ required: true, message: 'Please select a template' }]}
          >
            <Select placeholder="Select template">
              {templates.map((template) => (
                <Select.Option key={template.id} value={parseInt(template.id)}>
                  {template.templateName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="deviceIdList"
            label="Devices"
            rules={[{ required: true, message: 'Please select at least one device' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select devices"
              showSearch
              filterOption={(input, option) =>
                String(option?.children)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {devices.map((device) => (
                <Select.Option key={device.id} value={parseInt(device.id)}>
                  {device.deviceName} ({device.deviceSn})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TasksManagement;
