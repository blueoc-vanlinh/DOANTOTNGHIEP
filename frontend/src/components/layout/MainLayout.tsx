import { Layout } from "antd";
import { useState, type FC } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./slidebar";
import HeaderComponent from "./header";

const { Content } = Layout;

const MainLayout: FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  return (
    <Layout className="app-shell">
      <Sidebar collapsed={collapsed} />

      <Layout
        style={{
          marginLeft: collapsed ? 84 : 280,
          transition: "all 0.25s ease",
          minHeight: "100vh",
          background: "transparent",
        }}
      >
        <HeaderComponent collapsed={collapsed} setCollapsed={setCollapsed} />

        <Content className="app-content">
          <div className="app-page">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
