import { Layout } from "antd";
import { useState, type FC } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./slidebar";
import HeaderComponent from "./header";

const { Content } = Layout;

const MainLayout: FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <Sidebar collapsed={collapsed} />

      <Layout style={{ marginLeft: collapsed ? 80 : 256, transition: "all 0.3s" }}>
        <HeaderComponent collapsed={collapsed} setCollapsed={setCollapsed} />

        <Content style={{ margin: "24px", overflow: "initial" }}>
          <div
            style={{
              padding: "24px",
              background: "#fff",
              minHeight: "calc(100vh - 112px)",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;