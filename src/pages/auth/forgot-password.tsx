import { useState } from "react";
import { Form, Input, Button, Card, Typography, Space, Alert } from "antd";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useAuth } from "../../helpers/hooks/useAuth";

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [form] = Form.useForm();
  const { forgotPassword, isLoading } = useAuth();
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");

  const onFinish = async (values: { email: string }) => {
    try {
      await forgotPassword(values.email);
      setEmail(values.email);
      setEmailSent(true);
    } catch (error) {
      console.error("Forgot password failed:", error);
    }
  };

  if (emailSent) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#f0f2f5",
        }}
      >
        <Card style={{ width: 500, textAlign: "center" }}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <MailOutlined style={{ fontSize: 64, color: "#1890ff" }} />
            <Title level={2}>Check Your Email</Title>
            <Alert
              message="Password reset link sent"
              description={
                <Text>
                  If an account with the email <strong>{email}</strong> exists,
                  we've sent you a password reset link. Please check your email
                  and follow the instructions to reset your password.
                </Text>
              }
              type="success"
              showIcon
              style={{ textAlign: "left" }}
            />
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => (window.location.href = "/")}
              >
                Back to Login
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  setEmailSent(false);
                  form.resetFields();
                }}
              >
                Try Another Email
              </Button>
            </Space>
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f0f2f5",
      }}
    >
      <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <Title level={2}>Forgot Password</Title>
            <Text type="secondary">
              Enter your email address and we'll send you a link to reset your
              password.
            </Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input
                size="large"
                placeholder="Enter your email address"
                prefix={<MailOutlined />}
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
                Send Reset Link
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center" }}>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => (window.location.href = "/")}
            >
              Back to Login
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default ForgotPassword;
