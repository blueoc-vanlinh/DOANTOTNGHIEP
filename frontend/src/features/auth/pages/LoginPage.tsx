import { Card, Form, Input, Button, Checkbox, Typography, Alert, Row, Col, Space, Tag } from 'antd';
import { BarChartOutlined, EyeInvisibleOutlined, EyeTwoTone, SafetyCertificateOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useLogin } from '../hooks';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { dashboardUrl } from '@/routes/urls';

const { Title, Paragraph, Text } = Typography;

export default function LoginPage() {
  const [error, setError] = useState('');
  const { mutate, isPending } = useLogin();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  useEffect(() => {
    if (isAuthenticated) {
      navigate(dashboardUrl);
    }
  }, [isAuthenticated, navigate]);

  const onFinish = (values: { email: string; password: string }) => {
    setError('');

    mutate(values, {
      onSuccess: () => {
        navigate(dashboardUrl);
      },
      onError: (err: unknown) => {
        const e = err as { message?: string };
        setError(e?.message || 'Login failed');
      },
    });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #eef4fb 0%, #ffffff 54%, #e8f2ff 100%)',
        display: 'flex',
        alignItems: 'center',
        padding: 32,
      }}
    >
      <Row gutter={[32, 32]} align="middle" style={{ width: '100%', maxWidth: 1120, margin: '0 auto' }}>
        <Col xs={24} lg={13}>
          <Tag color="blue" icon={<ThunderboltOutlined />}>AI Warehouse Platform</Tag>
          <Title style={{ marginTop: 16, marginBottom: 16, fontSize: 48, lineHeight: 1.08 }}>
            Đăng nhập hệ thống quản lý kho thông minh
          </Title>
          <Paragraph style={{ fontSize: 17, color: '#526172', lineHeight: 1.75 }}>
            Theo dõi tồn kho, nhập xuất, hóa đơn, MoMo sandbox và AI forecast đã train từ dữ liệu thực tế/public dataset.
          </Paragraph>
          <Space size={12} wrap>
            <Tag icon={<BarChartOutlined />} color="green">Forecast AI</Tag>
            <Tag icon={<SafetyCertificateOutlined />} color="purple">Phân quyền</Tag>
            <Tag color="cyan">Audit log</Tag>
          </Space>
        </Col>

        <Col xs={24} lg={11}>
          <Card style={{ borderRadius: 8, boxShadow: '0 18px 50px rgba(16, 24, 40, 0.12)' }}>
            <div style={{ marginBottom: 20 }}>
              <Title level={3} style={{ marginBottom: 4 }}>Inventory Intelligence</Title>
              <Text type="secondary">Sử dụng tài khoản demo hoặc tài khoản được cấp quyền.</Text>
            </div>
            {error && (
              <Alert
                type="error"
                message={error}
                style={{ marginBottom: 16 }}
              />
            )}

            <Form layout="vertical" onFinish={onFinish} initialValues={{ email: 'admin@inventory.com', password: 'Admin@123' }}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, message: 'Please enter email' }]}
              >
                <Input size="large" placeholder="Enter your email" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please enter password' }]}
              >
                <Input.Password
                  size="large"
                  placeholder="Enter your password"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <Form.Item>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Checkbox>Remember me</Checkbox>
                  <Text type="secondary">Demo: admin@inventory.com</Text>
                </div>
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isPending}
                  block
                  size="large"
                >
                  Login
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
