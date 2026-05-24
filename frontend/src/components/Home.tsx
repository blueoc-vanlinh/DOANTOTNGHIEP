import {
  ArrowRightOutlined,
  BarChartOutlined,
  CloudSyncOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Button, Col, Row, Space, Table, Tag, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import heroImage from "@/assets/hero.png";
import apiClient from "@/lib/api";
import { dashboardUrl, loginUrl } from "@/routes/urls";

const { Title, Paragraph, Text } = Typography;

interface BenchmarkModel {
  model: string;
  accuracy: number;
  mape: number;
  wmape: number;
  mae: number;
  rmse: number;
}

interface BenchmarkDataset {
  dataset: string;
  target?: string | null;
  train_points: number;
  test_points: number;
  models: BenchmarkModel[];
}

interface BenchmarkResponse {
  metric_note: string;
  best_accuracy: number;
  datasets: BenchmarkDataset[];
}

const capabilities = [
  {
    icon: <DatabaseOutlined />,
    title: "Quản lý tồn kho đa kho",
    description: "Theo dõi sản phẩm, tồn thực tế, tồn khả dụng, hàng giữ chỗ và hàng chờ nhập theo từng kho.",
  },
  {
    icon: <CloudSyncOutlined />,
    title: "Nhập xuất có hóa đơn",
    description: "Chuẩn hóa phiếu nhập, phiếu xuất, giao dịch kho, hóa đơn và thanh toán MoMo sandbox.",
  },
  {
    icon: <BarChartOutlined />,
    title: "Dự báo AI đã train",
    description: "Sử dụng dữ liệu giao dịch, public dataset, external factors và forecast_results đã được train.",
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: "Phân quyền vận hành",
    description: "Tách vai trò admin, manager, staff, audit log và các trang nghiệp vụ có kiểm soát truy cập.",
  },
];

export default function Home() {
  const benchmarks = useQuery({
    queryKey: ["public-ai-model-benchmarks"],
    queryFn: async () => {
      const res = await apiClient.get<BenchmarkResponse>("/ai-data/public/model-benchmarks");
      return res.data;
    },
  });

  const benchmarkRows = (benchmarks.data?.datasets || []).flatMap((dataset) =>
    dataset.models.map((model) => ({
      key: `${dataset.dataset}-${model.model}`,
      dataset: dataset.dataset,
      target: dataset.target,
      train_points: dataset.train_points,
      test_points: dataset.test_points,
      ...model,
    }))
  );

  return (
    <main style={{ minHeight: "100vh", background: "#f7f9fc", color: "#172033" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          borderBottom: "1px solid rgba(20, 34, 58, 0.08)",
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(14px)",
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <Link to="/" style={{ color: "#172033", fontWeight: 800, fontSize: 20 }}>
            Inventory Intelligence
          </Link>
          <Space size={20}>
            <a href="#platform">Nền tảng</a>
            <a href="#ai">AI Forecast</a>
            <a href="#workflow">Quy trình</a>
            <a href="#operations">Vận hành</a>
            <Link to={loginUrl}>Đăng nhập</Link>
            <Button type="primary" href={dashboardUrl}>
              Vào hệ thống
            </Button>
          </Space>
        </div>
      </header>

      <section
        style={{
          minHeight: "calc(100vh - 72px)",
          display: "flex",
          alignItems: "center",
          backgroundImage: `linear-gradient(90deg, rgba(247,249,252,0.98) 0%, rgba(247,249,252,0.88) 42%, rgba(247,249,252,0.35) 100%), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center right",
        }}
      >
        <div style={{ width: "100%", maxWidth: 1180, margin: "0 auto", padding: "56px 24px" }}>
          <div style={{ maxWidth: 690 }}>
            <Text
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "#0b6bcb",
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              <ThunderboltOutlined /> AI-powered warehouse management
            </Text>
            <Title
              style={{
                margin: 0,
                fontSize: 56,
                lineHeight: 1.04,
                letterSpacing: 0,
                color: "#101828",
              }}
            >
              Inventory Intelligence Platform
            </Title>
            <Paragraph
              style={{
                marginTop: 22,
                marginBottom: 30,
                fontSize: 18,
                lineHeight: 1.75,
                color: "#465568",
              }}
            >
              Website quản lý kho tích hợp nhập xuất, hóa đơn, MoMo sandbox, dữ liệu vận hành và AI forecast đã train từ
              lịch sử giao dịch cùng bộ dữ liệu bán lẻ thực tế.
            </Paragraph>
            <Space size={12} wrap>
              <Button type="primary" size="large" href={dashboardUrl} icon={<ArrowRightOutlined />}>
                Mở dashboard
              </Button>
              <Button size="large" href="#ai">
                Xem năng lực AI
              </Button>
            </Space>
          </div>
        </div>
      </section>

      <section id="workflow" style={{ background: "#ffffff", padding: "72px 24px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <Title level={2} style={{ marginTop: 0 }}>Quy trình hoạt động</Title>
          <Row gutter={[16, 16]}>
            {[
              ["1", "Nhập hàng", "Tạo phiếu nhập, tự điền đơn giá và số lượng AI đề xuất."],
              ["2", "Tồn kho", "Cập nhật tồn thực tế, tồn khả dụng, hàng giữ chỗ và ngưỡng tối thiểu."],
              ["3", "Xuất hàng", "Ghi nhận xuất kho, giao dịch và biến động số lượng theo từng kho."],
              ["4", "Hóa đơn", "Sinh hóa đơn, in chứng từ và tạo QR MoMo sandbox."],
              ["5", "Forecast AI", "Train model, so sánh benchmark và khuyến nghị nhập hàng."],
            ].map(([step, title, description]) => (
              <Col xs={24} md={12} lg={8} key={step}>
                <div style={{ height: "100%", padding: 22, border: "1px solid #e6ebf2", borderRadius: 8 }}>
                  <Text strong style={{ color: "#0b6bcb" }}>Bước {step}</Text>
                  <Title level={4} style={{ margin: "8px 0" }}>{title}</Title>
                  <Paragraph style={{ margin: 0, color: "#58667a" }}>{description}</Paragraph>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <section style={{ padding: "64px 24px", background: "#f7f9fc" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Title level={2} style={{ marginTop: 0 }}>Vai trò người dùng</Title>
              <Paragraph style={{ color: "#58667a", fontSize: 16 }}>
                Hệ thống hỗ trợ nhiều vai trò để mô phỏng vận hành thực tế: Admin quản trị dữ liệu và AI, Manager theo dõi dashboard,
                Staff nhập/xuất kho, Auditor xem log và Finance theo dõi hóa đơn.
              </Paragraph>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ padding: 24, background: "#ffffff", borderRadius: 8, border: "1px solid #e6ebf2" }}>
                <Text strong>Demo account</Text>
                <Paragraph style={{ margin: "8px 0 0", color: "#58667a" }}>
                  Admin: <Text code>admin@inventory.com</Text> · Password: <Text code>000000</Text>
                </Paragraph>
                <Paragraph style={{ margin: "8px 0 0", color: "#58667a" }}>
                  Manager: <Text code>manager@inventory.com</Text> · Password: <Text code>000000</Text>
                </Paragraph>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      <section id="platform" style={{ background: "#ffffff", padding: "72px 24px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} lg={9}>
              <Title level={2} style={{ marginTop: 0, color: "#101828" }}>
                Một website sản phẩm, không chỉ là bảng công cụ
              </Title>
              <Paragraph style={{ fontSize: 16, lineHeight: 1.75, color: "#58667a" }}>
                Trang chủ định vị rõ hệ thống, còn dashboard phía sau phục vụ vận hành hằng ngày cho kho, kế toán,
                nhập hàng, xuất hàng và quản trị.
              </Paragraph>
            </Col>
            <Col xs={24} lg={15}>
              <Row gutter={[16, 16]}>
                {capabilities.map((item) => (
                  <Col xs={24} md={12} key={item.title}>
                    <div
                      style={{
                        height: "100%",
                        padding: 24,
                        border: "1px solid #e6ebf2",
                        borderRadius: 8,
                        background: "#fbfcfe",
                      }}
                    >
                      <div style={{ fontSize: 26, color: "#0b6bcb", marginBottom: 14 }}>{item.icon}</div>
                      <Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>
                        {item.title}
                      </Title>
                      <Paragraph style={{ margin: 0, color: "#5c6b7d", lineHeight: 1.65 }}>
                        {item.description}
                      </Paragraph>
                    </div>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </div>
      </section>

      <section id="ai" style={{ padding: "72px 24px", background: "#eef4fb" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <Row gutter={[32, 24]} align="middle">
            <Col xs={24} md={12}>
              <Title level={2} style={{ marginTop: 0 }}>
                AI Forecast dùng model đã train
              </Title>
              <Paragraph style={{ fontSize: 16, lineHeight: 1.75, color: "#465568" }}>
                Forecast ưu tiên đọc kết quả từ bảng <Text code>forecast_results</Text>. Khi bạn train lại sau các đợt
                import/xuất kho lớn, trang dự báo sẽ hiển thị nguồn mô hình là <Text strong>Đã train</Text> cùng số
                dòng forecast đã lưu.
              </Paragraph>
            </Col>
            <Col xs={24} md={12}>
              <div
                style={{
                  padding: 18,
                  background: "#ffffff",
                  borderRadius: 8,
                  border: "1px solid #d9e5f2",
                }}
              >
                <Space align="center" style={{ width: "100%", justifyContent: "space-between", marginBottom: 12 }}>
                  <Text strong>Benchmark train/test</Text>
                  <Tag color="blue">Best {benchmarks.data?.best_accuracy || 0}%</Tag>
                </Space>
                <Table
                  size="small"
                  rowKey="key"
                  loading={benchmarks.isLoading}
                  dataSource={benchmarkRows}
                  pagination={false}
                  columns={[
                    { title: "Dataset", dataIndex: "dataset" },
                    { title: "Model", dataIndex: "model" },
                    { title: "Train", dataIndex: "train_points" },
                    { title: "Test", dataIndex: "test_points" },
                    {
                      title: "Accuracy",
                      dataIndex: "accuracy",
                      render: (value: number) => (
                        <Tag color={value >= 80 ? "green" : value >= 60 ? "blue" : "orange"}>{value}%</Tag>
                      ),
                    },
                    { title: "WMAPE", dataIndex: "wmape", render: (value: number) => `${value}%` },
                  ]}
                />
              </div>
            </Col>
          </Row>
        </div>
      </section>

      <section id="operations" style={{ padding: "56px 24px", background: "#172033", color: "#ffffff" }}>
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <Title level={2} style={{ color: "#ffffff", margin: 0 }}>
              Sẵn sàng vận hành kho
            </Title>
            <Paragraph style={{ color: "#cbd5e1", margin: "10px 0 0", fontSize: 16 }}>
              Đăng nhập để quản lý sản phẩm, tồn kho, nhập xuất, hóa đơn, AI data và dự báo.
            </Paragraph>
          </div>
          <Button type="primary" size="large" href={loginUrl}>
            Đăng nhập
          </Button>
        </div>
      </section>
      <footer style={{ background: "#101828", color: "#cbd5e1", padding: "28px 24px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <Text style={{ color: "#ffffff" }}>Inventory Intelligence Platform</Text>
          <Text style={{ color: "#cbd5e1" }}>FastAPI · PostgreSQL · React · Ant Design · AI Forecast · DATN 2026</Text>
        </div>
      </footer>
    </main>
  );
}
