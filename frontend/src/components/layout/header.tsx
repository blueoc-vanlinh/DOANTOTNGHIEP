import { Layout, Button, Typography, Space, Avatar } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  BellOutlined
} from "@ant-design/icons";

const { Header } = Layout;
const { Text } = Typography;

interface Props {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export default function header({ collapsed, setCollapsed }: Props) {
  return (
    <Header
      style={{
        padding: "0 24px",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 1px 4px rgba(0,21,41,.08)",
        zIndex: 1
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{ fontSize: "18px", width: 64, height: 64 }}
      />

      <Space size="large">
        <Button type="text" icon={<BellOutlined />} style={{ fontSize: '16px' }} />
        <Space>
          <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
            <div style={{ fontWeight: 'bold' }}>Admin Kho</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>Quản lý hệ thống</Text>
          </div>
          <Avatar 
            size="large" 
            icon={<UserOutlined />} 
            style={{ backgroundColor: "#1677ff", cursor: 'pointer' }} 
          />
        </Space>
      </Space>
    </Header>
  );
}