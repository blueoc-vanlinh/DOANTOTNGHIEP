import { useState } from "react";

import {
  Card,
  Space,
  Typography,
  Alert,
  Statistic,
  Row,
  Col,
} from "antd";

import Button from "@/components/common/button";
import EmptyState from "@/components/common/EmptyState";
import SearchCombobox from "@/components/common/SearchCombobox";
import { useProducts } from "@/features/products/hooks";
import { useForecast } from "../hooks";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const { Title, Text } = Typography;

export default function ForecastPage() {
  const [productId, setProductId] = useState<number | undefined>();
  const [search, setSearch] = useState("");
  const { data, isLoading } = useForecast(productId || 0);
  const { data: productsRes } = useProducts({
    page: 1,
    pageSize: 20,
    search,
  });

  const products = productsRes?.items || [];
  const chartData = [
    ...(data?.history || []),
    ...(data?.data || []),
  ];

  return (
    <div>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Dự báo tồn kho AI
          </Title>

          <Text type="secondary">
            Dự đoán nhu cầu nhập hàng bằng AI Forecasting
          </Text>
        </div>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Space size="large" align="end">
          <div>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Product ID
            </Text>

            <SearchCombobox
              value={productId}
              onChange={(value) => setProductId(Number(value))}
              onSearch={(value) => setSearch(value)}
              placeholder="Tìm kiếm sản phẩm"
              style={{ width: 380 }}
              options={products.map((p) => ({
                value: p.id,

                label: (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{p.name}</span>

                    <span
                      style={{
                        color: "#999",
                        fontSize: 12,
                      }}
                    >
                      #{p.id}
                    </span>
                  </div>
                ),

                searchText: `${p.id} ${p.name}`,
              }))}
            />
          </div>

          <Button type="primary">
            Xem dự báo
          </Button>
        </Space>
      </Card>

      {data?.warning && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
          message={data.warning}
          description="AI chưa đủ dữ liệu lịch sử để huấn luyện chính xác. Hệ thống đang dùng chế độ dự đoán tạm thời."
        />
      )}

      {data?.deep_learning_status && (
        <Alert
          type={data.external_factors_used ? "success" : "info"}
          showIcon
          style={{ marginBottom: 24 }}
          message={`Mô hình hiện tại: ${data.model_used || "Prophet"}`}
          description={`${data.external_factors_used
            ? "Dự báo đã sử dụng yếu tố ngoại vi."
            : "Chưa có yếu tố ngoại vi phù hợp cho sản phẩm này."
            } ${data.deep_learning_status}`}
        />
      )}

      {data && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Sản phẩm"
                value={data.product_name}
              />
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Số ngày dự báo"
                value={data.forecast_days}
              />
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Đề xuất nhập hàng"
                value={data.recommended_import}
              />
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Yếu tố ngoại vi"
                value={data.external_factors_used ? "Có" : "Chưa có"}
              />
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Ngày dữ liệu thực tế"
                value={data.history?.length || 0}
              />
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Tồn kho thực tế"
                value={data.current_inventory}
              />
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Tồn khả dụng"
                value={data.available_quantity}
              />
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Hàng chờ nhập"
                value={data.oncoming_quantity}
              />
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Đã giữ chỗ"
                value={data.reserved_quantity}
              />
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Ngưỡng tối thiểu"
                value={data.min_threshold}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card
        title={`Biểu đồ AI Forecast`}
        loading={isLoading}
      >
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={450}>
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  value?.slice(5)
                }
              />

              <YAxis />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="actual"
                stroke="#1677ff"
                strokeWidth={3}
                name="Thực tế"
                connectNulls={false}
              />

              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#334371"
                strokeWidth={3}
                name="Dự đoán AI"
              />

              <Line
                type="monotone"
                dataKey="trend"
                stroke="#52c41a"
                strokeWidth={2}
                name="Xu hướng"
              />

              <Line
                type="monotone"
                dataKey="upper_bound"
                stroke="#faad14"
                strokeDasharray="5 5"
                dot={false}
                name="Giới hạn trên"
              />

              <Line
                type="monotone"
                dataKey="lower_bound"
                stroke="#8b0000"
                strokeDasharray="5 5"
                dot={false}
                name="Giới hạn dưới"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ padding: "60px 0" }}>
            <EmptyState
              description="Không có dữ liệu forecast"
            />
          </div>
        )}
      </Card>
    </div>
  );
}
