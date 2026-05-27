import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Empty,
  Layout,
  List,
  Popover,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  UserOutlined as UserIcon,
} from "@ant-design/icons";
import type { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuthStore } from "@/store/auth.store";
import {
  useMarkNotificationAsRead,
  useNotifications,
} from "@/features/notifications/hooks";
import {
  aiDataUrl,
  auditLogsUrl,
  categoryUrl,
  dashboardUrl,
  exportUrl,
  forecastUrl,
  importUrl,
  inventoryUrl,
  invoicesUrl,
  productsUrl,
  rolesUrl,
  suppliersUrl,
  transactionsUrl,
  usersUrl,
  warehouseAutomationUrl,
  warehouseOperationsUrl,
  warehouseUrl,
} from "@/routes/urls";

const { Header } = Layout;
const { Text } = Typography;

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const routeMeta: Record<string, { title: string; subtitle: string }> = {
  [dashboardUrl]: {
    title: "Tổng quan vận hành",
    subtitle: "Theo dõi sức khỏe kho, dòng nhập xuất và trạng thái AI",
  },
  [inventoryUrl]: {
    title: "Tồn kho",
    subtitle: "Kiểm soát tồn thực tế, hàng giữ chỗ và hàng đang về",
  },
  [importUrl]: {
    title: "Phiếu nhập kho",
    subtitle: "Lập phiếu, duyệt, nhận hàng và cập nhật tồn kho",
  },
  [exportUrl]: {
    title: "Phiếu xuất kho",
    subtitle: "Bán sỉ, bán lẻ, xuất sản xuất, điều chuyển và hủy hao hụt",
  },
  [transactionsUrl]: {
    title: "Giao dịch kho",
    subtitle: "Lịch sử biến động tồn kho theo từng sản phẩm và kho",
  },
  [invoicesUrl]: {
    title: "Hóa đơn",
    subtitle: "Quản lý chứng từ, thanh toán và QR MoMo sandbox",
  },
  [productsUrl]: {
    title: "Sản phẩm",
    subtitle: "Danh mục hàng hóa, SKU, giá bán và dữ liệu nhập Excel",
  },
  [categoryUrl]: {
    title: "Danh mục",
    subtitle: "Chuẩn hóa nhóm sản phẩm cho báo cáo và vận hành",
  },
  [suppliersUrl]: {
    title: "Nhà cung cấp",
    subtitle: "Quản lý đối tác cung ứng và thông tin liên hệ",
  },
  [warehouseUrl]: {
    title: "Kho hàng",
    subtitle: "Danh sách kho, vị trí và cấu trúc lưu trữ",
  },
  [forecastUrl]: {
    title: "Dự báo AI",
    subtitle: "Dự báo nhu cầu, khuyến nghị nhập hàng và độ chính xác model",
  },
  [aiDataUrl]: {
    title: "Dữ liệu AI",
    subtitle: "Benchmark model, train/test dataset và chất lượng dữ liệu",
  },
  [warehouseAutomationUrl]: {
    title: "Tự động kho",
    subtitle: "Gợi ý PO, slotting, barcode và cảnh báo vận hành",
  },
  [warehouseOperationsUrl]: {
    title: "Nghiệp vụ kho",
    subtitle: "Batch, kiểm kê, trả hàng, PO và xử lý vận hành nâng cao",
  },
  [usersUrl]: {
    title: "Nhân viên",
    subtitle: "Quản lý tài khoản và trạng thái người dùng",
  },
  [rolesUrl]: {
    title: "Vai trò & quyền",
    subtitle: "Phân quyền thao tác theo từng nhóm người dùng",
  },
  [auditLogsUrl]: {
    title: "Nhật ký hệ thống",
    subtitle: "Theo dõi thay đổi dữ liệu và hoạt động người dùng",
  },
};

const HeaderComponent: FC<HeaderProps> = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { data: notifications, isFetching } = useNotifications(isAuthenticated);
  const markAsRead = useMarkNotificationAsRead();
  const notificationItems = notifications?.items ?? [];
  const unreadCount = notifications?.unread_count ?? 0;
  const meta = routeMeta[location.pathname] || {
    title: "Inventory Intelligence",
    subtitle: "Website quản lý kho tích hợp AI forecast",
  };

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
    <div style={{ width: 380, maxWidth: "calc(100vw - 32px)" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text strong>Thông báo vận hành</Text>
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
    <Header className="app-header">
      <Space size={16}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            width: 42,
            height: 42,
          }}
        />
        <div className="app-header-meta">
          <h1 className="app-header-title">{meta.title}</h1>
          <div className="app-header-subtitle">{meta.subtitle}</div>
        </div>
      </Space>

      <Space size={14}>
        <Tag color="success" icon={<CheckCircleOutlined />}>
          System online
        </Tag>
        <Popover
          content={notificationContent}
          trigger="click"
          placement="bottomRight"
        >
          <Badge count={unreadCount} offset={[4, 0]} size="small">
            <Button
              type="text"
              icon={<BellOutlined style={{ fontSize: 19 }} />}
              style={{ width: 42, height: 42 }}
            />
          </Badge>
        </Popover>
        <Dropdown
          menu={{ items: userMenu, onClick: handleMenuClick }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Space style={{ cursor: "pointer" }} size={10}>
            <div style={{ textAlign: "right", lineHeight: "1.3" }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 14,
                  color: "#172033",
                }}
              >
                {user?.name || "User"}
              </div>

              <Text type="secondary" style={{ fontSize: 12 }}>
                {user?.roles?.join(", ") || "No role"}
              </Text>
            </div>
            <Avatar
              size={40}
              style={{
                backgroundColor: "#0f766e",
                boxShadow: "0 0 0 3px rgba(15, 118, 110, 0.14)",
                fontWeight: 800,
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
