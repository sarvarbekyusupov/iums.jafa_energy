import React from 'react';
import { Card, Row, Col, Button, Space } from 'antd';
import {
  UserAddOutlined,
  MailOutlined,
  DownloadOutlined,
  SettingOutlined,
  FileTextOutlined
} from '@ant-design/icons';


interface QuickActionsProps {
  onAddUser?: () => void;
  onSendEmail?: () => void;
  onExportData?: () => void;
  onViewReports?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onAddUser,
  onSendEmail,
  onExportData,
  onViewReports,
}) => {
  const actions = React.useMemo(() => [
    {
      icon: <UserAddOutlined />,
      title: 'Add User',
      description: 'Create new user account',
      onClick: onAddUser,
      color: '#1890ff',
    },
    {
      icon: <MailOutlined />,
      title: 'Send Email',
      description: 'Send notification to users',
      onClick: onSendEmail,
      color: '#52c41a',
    },
    {
      icon: <DownloadOutlined />,
      title: 'Export Data',
      description: 'Download user reports',
      onClick: onExportData,
      color: '#722ed1',
    },
    {
      icon: <FileTextOutlined />,
      title: 'View Reports',
      description: 'System analytics & reports',
      onClick: onViewReports,
      color: '#fa541c',
    },
  ], [onAddUser, onSendEmail, onExportData, onViewReports]);

  return (
    <Card title={
      <Space>
        <SettingOutlined />
        Quick Actions
      </Space>
    }>
      <Row gutter={[16, 16]}>
        {actions.map((action, index) => (
          <Col xs={12} lg={6} key={index}>
            <Button
              type="text"
              onClick={action.onClick}
              style={{
                height: 'auto',
                padding: '16px',
                width: '100%',
                textAlign: 'left',
                border: '1px solid #f0f0f0',
                borderRadius: '8px',
              }}
              className="quick-action-btn"
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ fontSize: '24px', color: action.color }}>
                  {action.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    {action.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {action.description}
                  </div>
                </div>
              </Space>
            </Button>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default React.memo(QuickActions);