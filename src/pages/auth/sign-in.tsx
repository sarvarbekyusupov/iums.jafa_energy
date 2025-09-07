import { Form, Input, Button, Card, Typography, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { LoginDto } from "../../types/auth";

const { Title, Text } = Typography;

const SignIn = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const onFinish = async (values: LoginDto) => {
    try {
      await login(values);
      navigate('/admin');
    } catch (error) {
      console.error('Login failed:', error);
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
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2}>Sign In</Title>
            <Text type="secondary">Welcome back! Please sign in to your account.</Text>
          </div>
          
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input size="large" placeholder="Enter your email" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password size="large" placeholder="Enter your password" />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large"
                block
                loading={isLoading}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>
          
          <div style={{ textAlign: 'center' }}>
            <Space direction="vertical">
              <a href="/forgot-password">Forgot your password?</a>
              <Text type="secondary">
                Don't have an account? Contact your administrator.
              </Text>
            </Space>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default SignIn;

// import React, { useState } from "react";
// import { Form, Input, Button, Select, message } from "antd";
// import { useNavigate } from "react-router-dom";
// import { authService } from "@service";
// import { setItem } from "../../helpers";

// const { Option } = Select;

// const SignIn = () => {
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const onFinish = async (values: any) => {
//     const { email, password, role } = values;
//     setLoading(true);

//     try {
//       const res = await authService.signIn({ email, password }, role);

//       if (res?.status === 201) {
//         setItem("access_token", res.data.access_token);
//         setItem("role", role);
//         navigate(`/${role}`);
//       } else {
//         message.error("Invalid credentials or role");
//       }
//     } catch (err) {
//       console.error(err);
//       message.error("Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Form
//       layout="vertical"
//       onFinish={onFinish}
//       initialValues={{ role: "student" }}
//       style={{ maxWidth: 400, margin: "auto", marginTop: 40 }}
//     >
//       <Form.Item
//         label="Email"
//         name="email"
//         rules={[
//           { required: true, message: "Please input your email!" },
//           { type: "email", message: "Invalid email format!" },
//         ]}
//       >
//         <Input placeholder="Email" />
//       </Form.Item>

//       <Form.Item
//         label="Password"
//         name="password"
//         rules={[{ required: true, message: "Please input your password!" }]}
//       >
//         <Input.Password placeholder="Password" />
//       </Form.Item>

//       <Form.Item label="Role" name="role" rules={[{ required: true }]}>
//         <Select>
//           <Option value="teacher">Teacher</Option>
//           <Option value="student">Student</Option>
//           <Option value="admin">Admin</Option>
//           <Option value="lid">Lid</Option>
//         </Select>
//       </Form.Item>

//       <Form.Item>
//         <Button type="primary" htmlType="submit" block loading={loading}>
//           Sign In
//         </Button>
//       </Form.Item>
//     </Form>
//   );
// };

// export default SignIn;
