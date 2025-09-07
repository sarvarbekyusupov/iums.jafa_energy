import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Button, Table, message, Spin, Badge, Tag } from 'antd';
import { BellOutlined, PlusOutlined, CheckOutlined } from '@ant-design/icons';
import { notificationsService } from '../../../service';

const { Title, Text } = Typography;

const NotificationsManagement: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const notificationsData = await notificationsService.getAllNotifications();
      setNotifications(notificationsData);
    } catch (error: any) {
      message.error('Failed to fetch notifications: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await notificationsService.markAsRead({ notificationIds: [notificationId.toString()] });
      message.success('Notification marked as read');
      fetchNotifications();
    } catch (error: any) {
      message.error('Failed to mark as read: ' + (error?.message || 'Unknown error'));
    }
  };

  const columns = [
    {
      title: 'Status',
      dataIndex: 'isRead',
      key: 'isRead',
      width: 80,
      render: (isRead: boolean) => (
        <Badge 
          status={isRead ? 'default' : 'processing'} 
          text={isRead ? 'Read' : 'Unread'} 
        />
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <Text strong={!record.isRead}>{text}</Text>
      ),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const color = type === 'error' ? 'red' : type === 'warning' ? 'orange' : 'blue';
        return <Tag color={color}>{type?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'User',
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          {!record.isRead && (
            <Button 
              type="link" 
              icon={<CheckOutlined />}
              onClick={() => markAsRead(record.id)}
            >
              Mark as Read
            </Button>
          )}
          <Button type="link" danger>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ padding: '0' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BellOutlined style={{ color: '#fa541c' }} />
            Notifications Management
            {unreadCount > 0 && (
              <Badge count={unreadCount} style={{ marginLeft: '8px' }} />
            )}
          </Title>
          <Text type="secondary">
            Manage system notifications and alerts
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />}>
          Create Notification
        </Button>
      </div>

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text>Loading notifications...</Text>
            </div>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={notifications}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            locale={{
              emptyText: 'No notifications found'
            }}
            rowClassName={(record) => record.isRead ? '' : 'unread-notification'}
          />
        )}
      </Card>
    </div>
  );
};

export default NotificationsManagement;