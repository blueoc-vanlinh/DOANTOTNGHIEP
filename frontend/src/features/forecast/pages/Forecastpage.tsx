// src/pages/forecast/ForecastPage.tsx
import { useState } from "react";
import { Card, InputNumber, Space, Typography } from "antd";

import Button from "@/components/common/button";
import EmptyState from "@/components/common/EmptyState";

import { useForecast } from "../hooks";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const { Title, Text } = Typography;

export default function ForecastPage() {
  const [productId, setProductId] = useState<number>(1);
  const { data, isLoading } = useForecast(productId);

  const chartData = data?.data || [];

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
            Dự báo tồn kho (AI)
          </Title>
          <Text type="secondary">Dự đoán nhu cầu và tồn kho tương lai bằng trí tuệ nhân tạo</Text>
        </div>
      </div>
      <Card style={{ marginBottom: 24 }}>
        <Space align="center" size="large">
          <div>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Chọn sản phẩm để dự báo
            </Text>
            <Space>
              <InputNumber
                value={productId}
                onChange={(v) => setProductId(Number(v ?? 1))}
                min={1}
                style={{ width: 180 }}
                placeholder="Nhập Product ID"
              />
              <Button
                type="primary"
                onClick={() => { }}
              >
                Xem dự báo
              </Button>
            </Space>
          </div>

          {data && (
            <div>
              <Text type="secondary">Sản phẩm ID: </Text>
              <Text strong>{productId}</Text>
            </div>
          )}
        </Space>
      </Card>
      <Card
        title={`Biểu đồ dự báo tồn kho - Sản phẩm ID ${productId}`}
        loading={isLoading}
      >
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={420}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value?.slice(5) || value} // Hiển thị ngắn gọn hơn
              />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{ value: 'Số lượng dự báo', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#1677ff"
                strokeWidth={3}
                dot={{ fill: "#1677ff", r: 5 }}
                activeDot={{ r: 7 }}
                name="Dự báo tồn kho"
              />
              {'actual' in (data?.data?.[0] || {}) && (
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#52c41a"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Thực tế"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ padding: "60px 0" }}>
            <EmptyState
              description="Chưa có dữ liệu dự báo cho sản phẩm này"
            />
          </div>
        )}
      </Card>

      {/* Legend / Info */}
      {chartData.length > 0 && (
        <Card style={{ marginTop: 16 }}>
          <Space size="large">
            <Space>
              <div style={{ width: 16, height: 3, background: "#1677ff" }} />
              <Text>Dự báo AI (Predicted)</Text>
            </Space>
            {'actual' in (data?.data?.[0] || {}) && (
              <Space>
                <div style={{ width: 16, height: 3, background: "#52c41a", border: "1px dashed" }} />
                <Text>Thực tế (Actual)</Text>
              </Space>
            )}
          </Space>
        </Card>
      )}
    </div>
  );
}