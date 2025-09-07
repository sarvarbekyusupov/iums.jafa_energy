import { Form, Input, Button, Card, Typography, Space, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { CreateUserDto } from "../../types/auth";

const { Title, Text } = Typography;
const { Option } = Select;

const SignUp = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const onFinish = async (values: CreateUserDto) => {
    try {
      await register(values);
      navigate('/auth/sign-in');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 500, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2}>Sign Up</Title>
            <Text type="secondary">Create your account to get started.</Text>
          </div>
          
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            initialValues={{ role: 'user' }}
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input placeholder="Enter your email" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 8, message: 'Password must be at least 8 characters!' }
              ]}
            >
              <Input.Password placeholder="Enter your password" />
            </Form.Item>

            <Form.Item
              label="First Name"
              name="firstName"
              rules={[{ required: true, message: 'Please input your first name!' }]}
            >
              <Input placeholder="Enter your first name" />
            </Form.Item>

            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true, message: 'Please input your last name!' }]}
            >
              <Input placeholder="Enter your last name" />
            </Form.Item>

            <Form.Item
              label="Phone"
              name="phone"
            >
              <Input placeholder="Enter your phone number" />
            </Form.Item>

            <Form.Item
              label="Company"
              name="company"
            >
              <Input placeholder="Enter your company" />
            </Form.Item>

            <Form.Item
              label="Position"
              name="position"
            >
              <Input placeholder="Enter your position" />
            </Form.Item>

            <Form.Item
              label="Role"
              name="role"
            >
              <Select placeholder="Select your role">
                <Option value="user">User</Option>
                <Option value="operator">Operator</Option>
                <Option value="admin">Admin</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isLoading}
                style={{ width: '100%' }}
              >
                Sign Up
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Text>
                Already have an account?{' '}
                <Button type="link" onClick={() => navigate('/auth/sign-in')}>
                  Sign In
                </Button>
              </Text>
            </div>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default SignUp;