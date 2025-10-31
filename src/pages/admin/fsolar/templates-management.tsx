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
  TimePicker,
  InputNumber,
  Popconfirm,
  Typography,
  Row,
  Col,
  Statistic,
  Select,
} from 'antd';
import {
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { fsolarTemplateService } from '../../../service/fsolar';
import type { EconomicStrategyTemplate, StrategyTimeSlot } from '../../../types/fsolar';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const TemplatesManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<EconomicStrategyTemplate[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedTemplate, setSelectedTemplate] = useState<EconomicStrategyTemplate | null>(null);
  const [form] = Form.useForm();

  // Fetch templates
  const fetchTemplates = async (page: number = 1, pageSize: number = 20) => {
    try {
      setLoading(true);
      const result = await fsolarTemplateService.listTemplates({
        pageNum: page,
        pageSize,
      });
      setTemplates(result.dataList);
      setPagination({
        current: parseInt(result.currentPage),
        pageSize: parseInt(result.pageSize),
        total: parseInt(result.total),
      });
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Handle add/edit template
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // Build strategy slots
      const buildSlot = (slotData: any): StrategyTimeSlot => {
        if (!slotData || !slotData.enabled) {
          return { type: 0 };
        }
        return {
          type: 1,
          startTime: slotData.startTime.format('HH:mm'),
          endTime: slotData.endTime.format('HH:mm'),
          mode: slotData.mode,
          power: slotData.power,
        };
      };

      const templateData = {
        templateName: values.templateName,
        strategy1: buildSlot(values.strategy1),
        strategy2: buildSlot(values.strategy2),
        strategy3: buildSlot(values.strategy3),
        strategy4: buildSlot(values.strategy4),
      };

      if (modalMode === 'add') {
        await fsolarTemplateService.addTemplate(templateData);
        message.success('Template created successfully');
      } else if (modalMode === 'edit' && selectedTemplate) {
        await fsolarTemplateService.updateTemplate(parseInt(selectedTemplate.id), templateData);
        message.success('Template updated successfully');
      }

      setModalVisible(false);
      form.resetFields();
      fetchTemplates(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error?.response?.data?.message || `Failed to ${modalMode} template`);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await fsolarTemplateService.deleteTemplate(parseInt(id));
      message.success('Template deleted successfully');
      fetchTemplates(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to delete template');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = async (template: EconomicStrategyTemplate) => {
    try {
      setLoading(true);
      const details = await fsolarTemplateService.getTemplate(parseInt(template.id));

      const parseSlot = (slot: StrategyTimeSlot) => {
        if (slot.type === 0) return { enabled: false };
        return {
          enabled: true,
          startTime: dayjs(slot.startTime, 'HH:mm'),
          endTime: dayjs(slot.endTime, 'HH:mm'),
          mode: slot.mode,
          power: slot.power,
        };
      };

      form.setFieldsValue({
        templateName: details.templateName,
        strategy1: parseSlot(details.strategy1),
        strategy2: parseSlot(details.strategy2),
        strategy3: parseSlot(details.strategy3),
        strategy4: parseSlot(details.strategy4),
      });

      setSelectedTemplate(details);
      setModalMode('edit');
      setModalVisible(true);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to fetch template details');
    } finally {
      setLoading(false);
    }
  };

  // Handle view
  const handleView = async (template: EconomicStrategyTemplate) => {
    try {
      setLoading(true);
      const details = await fsolarTemplateService.getTemplate(parseInt(template.id));
      setSelectedTemplate(details);
      setModalMode('view');
      setModalVisible(true);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to fetch template details');
    } finally {
      setLoading(false);
    }
  };

  // Columns
  const columns: ColumnsType<EconomicStrategyTemplate> = [
    {
      title: 'Template ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: 'Template Name',
      dataIndex: 'templateName',
      key: 'templateName',
    },
    {
      title: 'Created',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (time: number) => new Date(time).toLocaleString(),
    },
    {
      title: 'Modified',
      dataIndex: 'modifyTime',
      key: 'modifyTime',
      render: (time: number) => new Date(time).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 250,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            View
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Template"
            description="Are you sure you want to delete this template?"
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

  // Render strategy slot form
  const renderStrategySlot = (slotNumber: number) => (
    <Card title={`Strategy ${slotNumber}`} size="small">
      <Form.Item name={[`strategy${slotNumber}`, 'enabled']} valuePropName="checked" initialValue={false}>
        <Select style={{ width: '100%' }} placeholder="Enable this slot?">
          <Select.Option value={false}>Disabled</Select.Option>
          <Select.Option value={true}>Enabled</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item noStyle shouldUpdate={(prevValues, currentValues) =>
        prevValues[`strategy${slotNumber}`]?.enabled !== currentValues[`strategy${slotNumber}`]?.enabled
      }>
        {({ getFieldValue }) => {
          const enabled = getFieldValue(['strategy' + slotNumber, 'enabled']);
          if (!enabled) return null;

          return (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name={[`strategy${slotNumber}`, 'startTime']}
                    label="Start Time"
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <TimePicker format="HH:mm" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={[`strategy${slotNumber}`, 'endTime']}
                    label="End Time"
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <TimePicker format="HH:mm" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name={[`strategy${slotNumber}`, 'mode']}
                    label="Mode"
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <InputNumber placeholder="Mode" style={{ width: '100%' }} min={0} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={[`strategy${slotNumber}`, 'power']}
                    label="Power (W)"
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <InputNumber placeholder="Power" style={{ width: '100%' }} min={0} />
                  </Form.Item>
                </Col>
              </Row>
            </>
          );
        }}
      </Form.Item>
    </Card>
  );

  return (
    <div>
      <Title level={2}>Fsolar Strategy Templates</Title>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Total Templates" value={pagination.total} />
          </Card>
        </Col>
      </Row>

      {/* Main Table */}
      <Card
        title="Templates List"
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchTemplates(pagination.current, pagination.pageSize)}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setModalMode('add');
                setSelectedTemplate(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              Add Template
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={templates}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => fetchTemplates(page, pageSize),
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} templates`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={modalMode === 'add' ? 'Add Template' : modalMode === 'edit' ? 'Edit Template' : 'View Template'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setSelectedTemplate(null);
        }}
        onOk={modalMode !== 'view' ? () => form.submit() : undefined}
        confirmLoading={loading}
        width={800}
        footer={modalMode === 'view' ? [
          <Button key="close" onClick={() => setModalVisible(false)}>Close</Button>
        ] : undefined}
      >
        {modalMode === 'view' && selectedTemplate ? (
          <div>
            <Title level={4}>{selectedTemplate.templateName}</Title>
            {[1, 2, 3, 4].map((num) => {
              const slot = selectedTemplate[`strategy${num}` as keyof EconomicStrategyTemplate] as StrategyTimeSlot;
              if (slot.type === 0) return null;
              return (
                <Card key={num} title={`Strategy ${num}`} size="small" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={6}><Text strong>Start:</Text> {slot.startTime}</Col>
                    <Col span={6}><Text strong>End:</Text> {slot.endTime}</Col>
                    <Col span={6}><Text strong>Mode:</Text> {slot.mode}</Col>
                    <Col span={6}><Text strong>Power:</Text> {slot.power}W</Col>
                  </Row>
                </Card>
              );
            })}
          </div>
        ) : (
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="templateName"
              label="Template Name"
              rules={[{ required: true, message: 'Please enter template name' }]}
            >
              <Input placeholder="Enter template name" />
            </Form.Item>

            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {renderStrategySlot(1)}
              {renderStrategySlot(2)}
              {renderStrategySlot(3)}
              {renderStrategySlot(4)}
            </Space>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default TemplatesManagement;
