import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  InboxOutlined,
  UploadOutlined,
  DownloadOutlined,
  LineChartOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { exportUrl, importUrl, inventoryUrl, productsUrl } from "@/routes/urls";

const { Sider } = Layout;

interface Props {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  // Định nghĩa menu items
  const items = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
    },
    {
      key: productsUrl,
      icon: <ShoppingOutlined />,
      label: "Sản phẩm",
    },
    {
      key: inventoryUrl,
      icon: <InboxOutlined />,
      label: "Kho hàng",
    },
    {
      key: importUrl,
      icon: <UploadOutlined />,
      label: "Nhập kho",
    },
    {
      key: exportUrl,
      icon: <DownloadOutlined />,
      label: "Xuất kho",
    },
    {
      key: "/forecast", 
      icon: <LineChartOutlined />,
      label: "Dự báo AI",
    },
  ];

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      width={220}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
      }}
    >
      <div
        style={{
          height: 64,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: collapsed ? "14px" : "18px",
          background: "#002140",
          transition: "all 0.2s"
        }}
      >
        {collapsed ? "INV" : "📦 INVENTORY"}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={(e) => navigate(e.key)}
        items={items}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
}