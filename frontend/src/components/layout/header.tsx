import { Layout, Button, Typography, Space, Avatar, Badge, Dropdown } from "antd";
import type { MenuProps } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  BellOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserOutlined as UserIcon,
} from "@ant-design/icons";
import type { FC } from "react";

const { Header } = Layout;
const { Text } = Typography;

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const HeaderComponent: FC<HeaderProps> = ({ collapsed, setCollapsed }) => {
  const userMenu: MenuProps["items"] = [
    { key: "profile", label: "Thông tin cá nhân", icon: <UserIcon /> },
    { key: "settings", label: "Cài đặt hệ thống", icon: <SettingOutlined /> },
    { type: "divider" as const },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true
    },
  ];

  return (
    <Header
      style={{
        padding: "0 24px",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0, 21, 41, 0.08)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        height: 64,
      }}
    >
      {/* Nút thu gọn Sidebar */}
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{
          fontSize: "20px",
          width: 48,
          height: 48,
          borderRadius: "8px",
        }}
      />

      {/* Phần bên phải */}
      <Space size={24}>
        {/* Notification */}
        <Badge count={5} offset={[4, 0]} size="small">
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: "20px" }} />}
            style={{ width: 48, height: 48, borderRadius: "8px" }}
          />
        </Badge>

        {/* User Section */}
        <Dropdown menu={{ items: userMenu }} trigger={["click"]} placement="bottomRight">
          <Space style={{ cursor: "pointer" }} size={12}>
            <div style={{ textAlign: "right", lineHeight: "1.3" }}>
              <div style={{ fontWeight: 600, fontSize: "15px", color: "#1f1f1f" }}>
                Admin Kho
              </div>
              <Text type="secondary" style={{ fontSize: "12.5px" }}>
                Quản lý hệ thống
              </Text>
            </div>

            <Avatar
              size={42}
              icon={<UserOutlined />}
              style={{
                backgroundColor: "#1677ff",
                boxShadow: "0 0 0 3px rgba(22, 119, 255, 0.15)",
                cursor: "pointer",
              }}
            />
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default HeaderComponent;