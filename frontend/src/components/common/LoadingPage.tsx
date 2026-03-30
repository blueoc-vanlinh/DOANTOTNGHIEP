import { Spin } from "antd";

const LoadingPage = () => (
  <div
    style={{
      height: "80vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
    }}
  >
    <Spin size="large" />
    <p style={{ marginTop: 16 }}>Đang tải dữ liệu, vui lòng chờ...</p>
  </div>
);

export default LoadingPage;