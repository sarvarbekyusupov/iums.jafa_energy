import React from 'react';
import { Card, Row, Col, Typography, Space, Button } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface WelcomeCardProps {
  userName: string;
  onAddUser?: () => void;
  onSettings?: () => void;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ userName, onAddUser, onSettings }) => {
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <Card
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '12px'
      }}
    >
      <Row align="middle">
        <Col flex="auto">
          <Title level={2} style={{ color: 'white', margin: 0 }}>
            {greeting}, {userName}! 👋
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.8)', margin: '8px 0 0 0' }}>
            Here's what's happening with your ERP system today.
          </Paragraph>
        </Col>
        <Col>
          <Space>
            <Button
              type="primary"
              ghost
              icon={<PlusOutlined />}
              href="/admin/users"
              onClick={onAddUser}
            >
              Add User
            </Button>
            <Button
              type="primary"
              ghost
              icon={<SettingOutlined />}
              onClick={onSettings}
            >
              Settings
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default React.memo(WelcomeCard);