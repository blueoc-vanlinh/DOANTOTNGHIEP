import { useState } from "react";
import {
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";

import Button from "@/components/common/button";
import EmptyState from "@/components/common/EmptyState";
import PageHero from "@/components/common/PageHero";
import {
  useAutoPoRecommendations,
  useBarcodeLookup,
  useSlottingSuggestions,
} from "../hooks";
import type {
  AutoPoRecommendation,
  SlottingSuggestion,
} from "../types";

const { Title, Text } = Typography;

export default function WarehouseAutomationPage() {
  const [leadTimeDays, setLeadTimeDays] = useState(7);
  const [coverageDays, setCoverageDays] = useState(30);
  const [slottingDays, setSlottingDays] = useState(30);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcode, setBarcode] = useState("");

  const autoPo = useAutoPoRecommendations({
    lead_time_days: leadTimeDays,
    coverage_days: coverageDays,
  });
  const slotting = useSlottingSuggestions(slottingDays);
  const barcodeLookup = useBarcodeLookup(barcode);

  return (
    <div>
      <PageHero
        eyebrow="Warehouse optimization"
        title="Tự động hóa kho"
        description="Gợi ý đơn mua hàng, vị trí lưu trữ, barcode và các quyết định vận hành dựa trên dữ liệu tồn kho."
      />

      <Card
        title="Tự động gợi ý lập đơn mua hàng"
        style={{ marginBottom: 24 }}
        extra={
          <Space>
            <span>Lead time</span>
            <InputNumber
              min={1}
              max={90}
              value={leadTimeDays}
              onChange={(value) => setLeadTimeDays(Number(value || 1))}
            />
            <span>Coverage</span>
            <InputNumber
              min={1}
              max={365}
              value={coverageDays}
              onChange={(value) => setCoverageDays(Number(value || 1))}
            />
          </Space>
        }
      >
        <Table<AutoPoRecommendation>
          rowKey={(row) => `${row.product_id}-${row.warehouse_id}`}
          loading={autoPo.isLoading}
          dataSource={autoPo.data || []}
          pagination={{ pageSize: 8 }}
          columns={[
            { title: "Sản phẩm", dataIndex: "product_name" },
            { title: "SKU", dataIndex: "sku" },
            { title: "Kho", dataIndex: "warehouse_name" },
            { title: "Tồn khả dụng", dataIndex: "available_stock" },
            { title: "Ngưỡng đặt lại", dataIndex: "reorder_point" },
            { title: "Đề xuất mua", dataIndex: "recommended_quantity" },
            {
              title: "Ưu tiên",
              dataIndex: "priority",
              render: (value: AutoPoRecommendation["priority"]) => (
                <Tag color={value === "HIGH" ? "red" : "orange"}>{value}</Tag>
              ),
            },
          ]}
        />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title="Gợi ý sắp xếp vị trí hàng"
            extra={
              <Space>
                <span>Số ngày</span>
                <InputNumber
                  min={1}
                  max={365}
                  value={slottingDays}
                  onChange={(value) => setSlottingDays(Number(value || 1))}
                />
              </Space>
            }
          >
            <Table<SlottingSuggestion>
              rowKey="product_id"
              loading={slotting.isLoading}
              dataSource={slotting.data || []}
              pagination={{ pageSize: 8 }}
              columns={[
                { title: "Sản phẩm", dataIndex: "product_name" },
                { title: "SL xuất", dataIndex: "export_quantity" },
                {
                  title: "Khu vực",
                  dataIndex: "suggested_zone",
                  render: (value: string) => (
                    <Tag color={value === "A" ? "green" : value === "B" ? "blue" : "default"}>
                      Zone {value}
                    </Tag>
                  ),
                },
                { title: "Vị trí gợi ý", dataIndex: "suggested_location" },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Tra cứu QR/Barcode">
            <Form layout="vertical">
              <Form.Item label="Mã barcode">
                <Input
                  value={barcodeInput}
                  onChange={(event) => setBarcodeInput(event.target.value)}
                  onPressEnter={() => setBarcode(barcodeInput.trim())}
                  placeholder="Quét hoặc nhập mã barcode"
                />
              </Form.Item>
              <Button type="primary" onClick={() => setBarcode(barcodeInput.trim())}>
                Tra cứu
              </Button>
            </Form>

            <div style={{ marginTop: 24 }}>
              {barcodeLookup.data ? (
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <Card size="small">
                    <Title level={4} style={{ marginTop: 0 }}>
                      {barcodeLookup.data.product.name}
                    </Title>
                    <Text type="secondary">
                      SKU {barcodeLookup.data.product.sku} • Barcode{" "}
                      {barcodeLookup.data.product.barcode || "Chưa có"}
                    </Text>
                  </Card>
                  <Table
                    rowKey="warehouse_id"
                    pagination={false}
                    dataSource={barcodeLookup.data.inventory}
                    columns={[
                      { title: "Kho", dataIndex: "warehouse_name" },
                      { title: "Tồn", dataIndex: "quantity" },
                      { title: "Khả dụng", dataIndex: "available_quantity" },
                    ]}
                  />
                </Space>
              ) : (
                <div style={{ padding: "32px 0" }}>
                  <EmptyState description="Chưa có dữ liệu quét" />
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
