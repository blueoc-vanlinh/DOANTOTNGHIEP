import {
  Layout,
  Button,
  Typography,
  Space,
  Avatar,
  Badge,
  Dropdown,
  Empty,
  List,
  Popover,
  Spin,
} from "antd";
import type { MenuProps } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserOutlined as UserIcon,
} from "@ant-design/icons";
import type { FC } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useNavigate } from "react-router-dom";
import {
  useMarkNotificationAsRead,
  useNotifications,
} from "@/features/notifications/hooks";

const { Header } = Layout;
const { Text } = Typography;

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const HeaderComponent: FC<HeaderProps> = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { data: notifications, isFetching } = useNotifications(isAuthenticated);
  const markAsRead = useMarkNotificationAsRead();
  const notificationItems = notifications?.items ?? [];
  const unreadCount = notifications?.unread_count ?? 0;
  const userMenu: MenuProps["items"] = [
    {
      key: "profile",
      label: "Thông tin cá nhân",
      icon: <UserIcon />,
    },
    {
      key: "settings",
      label: "Cài đặt hệ thống",
      icon: <SettingOutlined />,
    },
    { type: "divider" },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];
  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "logout") {
      logout();
    }

    if (key === "profile") {
      navigate("/profile");
    }

    if (key === "settings") {
      navigate("/settings");
    }
  };

  const notificationContent = (
    <div style={{ width: 360, maxWidth: "calc(100vw - 32px)" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text strong>Thông báo</Text>
        {isFetching && <Spin size="small" />}
      </div>
      {notificationItems.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chưa có thông báo"
          style={{ margin: "20px 0" }}
        />
      ) : (
        <List
          dataSource={notificationItems}
          style={{ maxHeight: 420, overflow: "auto" }}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              onClick={() => {
                if (!item.is_read) {
                  markAsRead.mutate(item.id);
                }
              }}
              style={{
                cursor: item.is_read ? "default" : "pointer",
                padding: "12px 8px",
                background: item.is_read ? "#ffffff" : "#f0f7ff",
                borderRadius: 8,
                marginBottom: 6,
              }}
            >
              <List.Item.Meta
                title={
                  <Space size={8}>
                    {!item.is_read && <Badge status="processing" />}
                    <Text strong={!item.is_read}>{item.title}</Text>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={2}>
                    <Text type="secondary">{item.message}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(item.created_at).toLocaleString("vi-VN")}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

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
      <Space size={24}>
        <Popover
          content={notificationContent}
          trigger="click"
          placement="bottomRight"
        >
          <Badge count={unreadCount} offset={[4, 0]} size="small">
            <Button
              type="text"
              icon={<BellOutlined style={{ fontSize: "20px" }} />}
              style={{ width: 48, height: 48, borderRadius: "8px" }}
            />
          </Badge>
        </Popover>
        <Dropdown
          menu={{ items: userMenu, onClick: handleMenuClick }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Space style={{ cursor: "pointer" }} size={12}>
            {/* 🧾 User info */}
            <div style={{ textAlign: "right", lineHeight: "1.3" }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "15px",
                  color: "#1f1f1f",
                }}
              >
                {user?.name || "User"}
              </div>

              <Text type="secondary" style={{ fontSize: "12.5px" }}>
                {user?.roles?.join(", ") || "No role"}
              </Text>
            </div>
            <Avatar
              size={42}
              style={{
                backgroundColor: "#334371",
                boxShadow: "0 0 0 3px rgba(22, 119, 255, 0.15)",
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default HeaderComponent;
