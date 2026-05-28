import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import {
  BarcodeOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  DownloadOutlined,
  FileTextOutlined,
  HistoryOutlined,
  HomeOutlined,
  InboxOutlined,
  LineChartOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  ShoppingOutlined,
  SwapOutlined,
  TagsOutlined,
  ToolOutlined,
  UploadOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import type { FC } from "react";

import { useAuthStore } from "@/store/auth.store";
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

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.roles?.includes("Admin");

  const operationsItems: MenuProps["items"] = [
    { key: dashboardUrl, icon: <DashboardOutlined />, label: "Tổng quan" },
    { key: inventoryUrl, icon: <InboxOutlined />, label: "Tồn kho" },
    { key: importUrl, icon: <UploadOutlined />, label: "Phiếu nhập" },
    { key: exportUrl, icon: <DownloadOutlined />, label: "Phiếu xuất" },
    { key: transactionsUrl, icon: <SwapOutlined />, label: "Giao dịch kho" },
    { key: invoicesUrl, icon: <FileTextOutlined />, label: "Hóa đơn" },
  ];

  const catalogItems: MenuProps["items"] = [
    { key: productsUrl, icon: <ShoppingOutlined />, label: "Sản phẩm" },
    { key: categoryUrl, icon: <TagsOutlined />, label: "Danh mục" },
    { key: suppliersUrl, icon: <UserSwitchOutlined />, label: "Nhà cung cấp" },
    { key: warehouseUrl, icon: <HomeOutlined />, label: "Kho hàng" },
  ];

  const intelligenceItems: MenuProps["items"] = [
    { key: forecastUrl, icon: <LineChartOutlined />, label: "Dự báo AI" },
    ...(isAdmin
      ? [
          { key: aiDataUrl, icon: <RobotOutlined />, label: "Dữ liệu AI" },
          { key: warehouseAutomationUrl, icon: <BarcodeOutlined />, label: "Tự động kho" },
          { key: warehouseOperationsUrl, icon: <ToolOutlined />, label: "Nghiệp vụ kho" },
        ]
      : []),
  ];

  const adminItems: MenuProps["items"] = isAdmin
    ? [
        { key: usersUrl, icon: <UserSwitchOutlined />, label: "Nhân viên" },
        { key: rolesUrl, icon: <SafetyCertificateOutlined />, label: "Vai trò" },
        { key: auditLogsUrl, icon: <HistoryOutlined />, label: "Nhật ký" },
      ]
    : [];

  const menuItems: MenuProps["items"] = [
    {
      type: "group",
      label: collapsed ? "" : "Vận hành",
      children: operationsItems,
    },
    {
      type: "group",
      label: collapsed ? "" : "Dữ liệu nền",
      children: catalogItems,
    },
    {
      type: "group",
      label: collapsed ? "" : "Dự báo & tối ưu",
      children: intelligenceItems,
    },
    ...(adminItems.length
      ? [
          {
            type: "group" as const,
            label: collapsed ? "" : "Quản trị",
            children: adminItems,
          },
        ]
      : []),
  ];

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={280}
      collapsedWidth={84}
      className="app-sidebar"
      style={{
        overflow: "hidden",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 30,
      }}
    >
      <div className="app-brand">
        <div className="app-brand-mark">
          <img src="/2825346-200.png" alt="Inventory" />
        </div>
        {!collapsed && (
          <div className="app-brand-text">
            <div className="app-brand-title">Inventory Intelligence</div>
            <div className="app-brand-subtitle">Warehouse AI Platform</div>
          </div>
        )}
      </div>

      {!collapsed && (
        <div
          style={{
            margin: "14px 16px 4px",
            padding: "12px",
            borderRadius: 8,
            background: "#f7faf9",
            border: "1px solid #dfe7ee",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <DatabaseOutlined style={{ color: "#0f766e" }} />
            <div>
              <div style={{ fontWeight: 800, color: "#172033", fontSize: 13 }}>Production workspace</div>
              <div style={{ color: "#667085", fontSize: 12, marginTop: 2 }}>Kho · Hóa đơn · AI forecast</div>
            </div>
          </div>
        </div>
      )}

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        items={menuItems}
      />
    </Sider>
  );
};

export default Sidebar;
