import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  InboxOutlined,
  UploadOutlined,
  DownloadOutlined,
  LineChartOutlined,
  RobotOutlined,
  BarcodeOutlined,
  FileTextOutlined,
  TagsOutlined,
  UserSwitchOutlined,
  SafetyCertificateOutlined,
  HomeOutlined,
  SwapOutlined,
  HistoryOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { aiDataUrl, auditLogsUrl, categoryUrl, dashboardUrl, exportUrl, forecastUrl, importUrl, inventoryUrl, invoicesUrl, productsUrl, rolesUrl, suppliersUrl, transactionsUrl, usersUrl, warehouseAutomationUrl, warehouseOperationsUrl, warehouseUrl } from "@/routes/urls";
import type { FC } from "react";
import { useAuthStore } from "@/store/auth.store";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.roles?.includes("Admin");

  const menuItems = [
    { key: dashboardUrl, icon: <DashboardOutlined />, label: "Tổng quan" },
    { key: productsUrl, icon: <ShoppingOutlined />, label: "Sản phẩm" },
    { key: inventoryUrl, icon: <InboxOutlined />, label: "Kho hàng" },
    { key: categoryUrl, icon: <TagsOutlined />, label: "Danh mục" },
    { key: suppliersUrl, icon: <UserSwitchOutlined />, label: "Nhà cung cấp" },
    { key: warehouseUrl, icon: <HomeOutlined />, label: "Kho" },
    { key: transactionsUrl, icon: <SwapOutlined />, label: "Giao dịch" },
    { key: importUrl, icon: <UploadOutlined />, label: "Nhập kho" },
    { key: exportUrl, icon: <DownloadOutlined />, label: "Xuất kho" },
    { key: invoicesUrl, icon: <FileTextOutlined />, label: "Hóa đơn" },
    { key: forecastUrl, icon: <LineChartOutlined />, label: "Dự báo AI" },
    { key: aiDataUrl, icon: <RobotOutlined />, label: "Dữ liệu AI", adminOnly: true },
    { key: warehouseAutomationUrl, icon: <BarcodeOutlined />, label: "Tự động kho", adminOnly: true },
    { key: warehouseOperationsUrl, icon: <ToolOutlined />, label: "Nghiệp vụ kho", adminOnly: true },
    { key: usersUrl, icon: <UserSwitchOutlined />, label: "Nhân viên", adminOnly: true },
    { key: rolesUrl, icon: <SafetyCertificateOutlined />, label: "Vai trò", adminOnly: true },
    { key: auditLogsUrl, icon: <HistoryOutlined />, label: "Nhật ký", adminOnly: true },
  ].filter((item) => isAdmin || !item.adminOnly);
  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={256}
      collapsedWidth={80}
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        boxShadow: "2px 0 12px rgba(0, 21, 41, 0.12)",
        zIndex: 999,
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #334371 0%, #4096ff 100%)",
          color: "#fff",
          fontWeight: 700,
          fontSize: collapsed ? "22px" : "21px",
          letterSpacing: "0.5px",
          transition: "all 0.3s ease",
        }}
      >
        {collapsed ? (
          <img src="/2825346-200.png" alt="Logo" style={{ width: "40px", height: "40px" }} />
        ) : (
          <>
            <img src="/2825346-200.png" alt="Logo" style={{ width: "40px", height: "40px", marginRight: "10px" }} />
            INVENTORY
          </>
        )}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        items={menuItems}
        style={{ borderRight: 0, background: "#001529" }}
      />
    </Sider>
  );
};

export default Sidebar;
