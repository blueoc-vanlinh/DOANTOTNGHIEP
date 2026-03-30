import { Layout } from "antd";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./slidebar"; 
import Header from "./header";

const { Content } = Layout;

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar collapsed={collapsed} />

      <Layout style={{ transition: "all 0.2s" }}>
        <Header collapsed={collapsed} setCollapsed={setCollapsed} />
        
        <Content style={{ margin: 16 }}>    
          <div
            style={{
              padding: 16,
              background: "#fff",
              minHeight: "calc(100vh - 112px)",
              borderRadius: "8px"
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}