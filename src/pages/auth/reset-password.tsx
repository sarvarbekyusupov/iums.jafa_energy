import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Space, Alert, Spin } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import type { ResetPasswordDto } from '../../types/auth';

const { Title, Text } = Typography;

const ResetPassword = () => {
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword, isLoading } = useAuth();
  const [resetStatus, setResetStatus] = useState<'loading' | 'valid' | 'invalid' | 'success'>('loading');
  const [resetToken, setResetToken] = useState<string>('');

  useEffect(() => {
    // Get reset token from URL params
    const tokenParam = searchParams.get('token') || searchParams.get('reset_token');
    
    if (tokenParam) {
      setResetToken(tokenParam);
      setResetStatus('valid');
    } else {
      setResetStatus('invalid');
    }
  }, [searchParams]);

  const onFinish = async (values: { password: string; confirm_password: string }) => {
    if (!resetToken) {
      return;
    }

    try {
      const resetData: ResetPasswordDto = {
        token: resetToken,
        password: values.password,
        confirm_password: values.confirm_password,
      };

      await resetPassword(resetData);
      setResetStatus('success');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Password reset failed:', error);
    }
  };

  const validatePassword = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Please input your password!'));
    }
    if (value.length < 8) {
      return Promise.reject(new Error('Password must be at least 8 characters long!'));
    }
    if (!/(?=.*[a-z])/.test(value)) {
      return Promise.reject(new Error('Password must contain at least one lowercase letter!'));
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      return Promise.reject(new Error('Password must contain at least one uppercase letter!'));
    }
    if (!/(?=.*\d)/.test(value)) {
      return Promise.reject(new Error('Password must contain at least one number!'));
    }
    if (!/(?=.*[@$!%*?&])/.test(value)) {
      return Promise.reject(new Error('Password must contain at least one special character!'));
    }
    return Promise.resolve();
  };

  const validateConfirmPassword = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Please confirm your password!'));
    }
    if (value !== form.getFieldValue('password')) {
      return Promise.reject(new Error('Passwords do not match!'));
    }
    return Promise.resolve();
  };

  if (resetStatus === 'loading') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f0f2f5'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (resetStatus === 'invalid') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f0f2f5'
      }}>
        <Card style={{ width: 500, textAlign: 'center' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <ExclamationCircleOutlined style={{ fontSize: 64, color: '#ff4d4f' }} />
            <Title level={2}>Invalid Reset Link</Title>
            <Text type="secondary">
              The password reset link you used is invalid or has expired. 
              Please request a new password reset from the login page.
            </Text>
            <Button type="primary" onClick={() => navigate('/')}>
              Go to Login
            </Button>
          </Space>
        </Card>
      </div>
    );
  }

  if (resetStatus === 'success') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f0f2f5'
      }}>
        <Card style={{ width: 500, textAlign: 'center' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />
            <Title level={2}>Password Reset Successfully!</Title>
            <Text type="secondary">
              Your password has been reset successfully. 
              You will be redirected to the login page shortly.
            </Text>
            <Spin />
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2}>Reset Your Password</Title>
            <Text type="secondary">
              Please enter your new password below.
            </Text>
          </div>
          
          <Alert
            message="Password Requirements"
            description={
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>At least 8 characters long</li>
                <li>Contains uppercase and lowercase letters</li>
                <li>Contains at least one number</li>
                <li>Contains at least one special character (@$!%*?&)</li>
              </ul>
            }
            type="info"
            showIcon
          />
          
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="New Password"
              name="password"
              rules={[{ validator: validatePassword }]}
            >
              <Input.Password 
                size="large" 
                placeholder="Enter your new password"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              label="Confirm New Password"
              name="confirm_password"
              dependencies={['password']}
              rules={[{ validator: validateConfirmPassword }]}
            >
              <Input.Password 
                size="large" 
                placeholder="Confirm your new password"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large"
                block
                loading={isLoading}
              >
                Reset Password
              </Button>
            </Form.Item>
          </Form>
          
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              Remember your password? <a href="/">Sign in here</a>
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default ResetPassword;