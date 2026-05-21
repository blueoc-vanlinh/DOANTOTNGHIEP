import { useMemo, useState } from "react";
import {
  Alert,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";

import Button from "@/components/common/button";
import SearchCombobox from "@/components/common/SearchCombobox";
import { useProducts } from "@/features/products/hooks";
import {
  useAiDataOverview,
  useCreateExternalFactor,
  useDeepLearningDataset,
  useExternalFactors,
} from "../hooks";
import type {
  ExternalFactor,
  ExternalFactorInput,
  ProductTrainingQuality,
} from "../types";

const { Title, Text } = Typography;

const readinessColor: Record<ProductTrainingQuality["model_ready"], string> = {
  INSUFFICIENT_DATA: "red",
  PROPHET_READY: "blue",
  LSTM_TRANSFORMER_READY: "green",
};

const readinessLabel: Record<ProductTrainingQuality["model_ready"], string> = {
  INSUFFICIENT_DATA: "Chưa đủ dữ liệu",
  PROPHET_READY: "Đủ chạy Prophet",
  LSTM_TRANSFORMER_READY: "Sẵn sàng LSTM/Transformer",
};

export default function AiDataPage() {
  const [form] = Form.useForm<ExternalFactorInput>();
  const [productId, setProductId] = useState<number | undefined>();
  const [productSearch, setProductSearch] = useState("");
  const overview = useAiDataOverview();
  const externalFactors = useExternalFactors();
  const createFactor = useCreateExternalFactor();
  const dataset = useDeepLearningDataset(productId);
  const { data: productRes } = useProducts({
    page: 1,
    pageSize: 50,
    search: productSearch,
  });

  const products = productRes?.items || [];
  const counts = overview.data?.counts;
  const latestRows = useMemo(
    () => (dataset.data?.rows || []).slice(-12),
    [dataset.data?.rows]
  );

  const handleCreateFactor = async () => {
    const values = await form.validateFields();

    createFactor.mutate(values, {
      onSuccess: () => {
        message.success("Đã thêm yếu tố ngoại vi");
        form.resetFields();
      },
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Dữ liệu huấn luyện AI
        </Title>
        <Text type="secondary">
          Kiểm tra số bản ghi, chất lượng chuỗi thời gian và yếu tố ngoại vi
        </Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic title="Sản phẩm" value={counts?.products || 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic title="Dòng tồn kho" value={counts?.inventory_records || 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic title="SL thực tế trong kho" value={counts?.current_stock_quantity || 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic title="Giao dịch" value={counts?.stock_transactions || 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic title="Xuất kho" value={counts?.export_transactions || 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic title="Forecast" value={counts?.forecast_results || 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic title="Yếu tố ngoại vi" value={counts?.external_factors || 0} />
          </Card>
        </Col>
      </Row>

      {overview.data?.recommendation && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
          message="Đánh giá dữ liệu"
          description={overview.data.recommendation}
        />
      )}

      <Card title="Chất lượng dữ liệu theo sản phẩm" style={{ marginBottom: 24 }}>
        <Table<ProductTrainingQuality>
          rowKey="product_id"
          loading={overview.isLoading}
          dataSource={overview.data?.quality_by_product || []}
          pagination={{ pageSize: 8 }}
          columns={[
            { title: "Sản phẩm", dataIndex: "product_name" },
            { title: "Bản ghi xuất", dataIndex: "transaction_records" },
            { title: "Ngày dữ liệu thực tế", dataIndex: "unique_training_days" },
            { title: "SL còn lại toàn hệ thống", dataIndex: "current_stock_quantity" },
            {
              title: "Accuracy thấp nhất",
              dataIndex: "minimum_accuracy",
              render: (value: number) => `${value}%`,
            },
            { title: "Tổng SL xuất", dataIndex: "total_export_quantity" },
            { title: "Yếu tố ngoại vi", dataIndex: "external_factor_records" },
            {
              title: "Mức sẵn sàng",
              dataIndex: "model_ready",
              render: (value: ProductTrainingQuality["model_ready"]) => (
                <Tag color={readinessColor[value]}>{readinessLabel[value]}</Tag>
              ),
            },
            {
              title: "Thiếu DL deep learning",
              dataIndex: "missing_for_deep_learning_days",
            },
          ]}
        />
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={10}>
          <Card title="Thêm yếu tố ngoại vi">
            <Form form={form} layout="vertical">
              <Form.Item
                name="factor_date"
                label="Ngày"
                rules={[{ required: true, message: "Nhập ngày theo YYYY-MM-DD" }]}
              >
                <Input placeholder="2026-05-20" />
              </Form.Item>
              <Form.Item
                name="factor_type"
                label="Loại yếu tố"
                rules={[{ required: true, message: "Chọn loại yếu tố" }]}
              >
                <Select
                  options={[
                    { value: "PRICE", label: "Giá cả" },
                    { value: "MARKET", label: "Thị trường" },
                    { value: "EVENT", label: "Sự kiện" },
                    { value: "SUPPLY", label: "Chuỗi cung ứng" },
                  ]}
                />
              </Form.Item>
              <Form.Item
                name="name"
                label="Tên yếu tố"
                rules={[{ required: true, message: "Nhập tên yếu tố" }]}
              >
                <Input placeholder="Khuyến mãi, lễ, tăng giá..." />
              </Form.Item>
              <Form.Item name="product_id" label="Sản phẩm áp dụng">
                <SearchCombobox
                  onSearch={(value) => setProductSearch(value)}
                  placeholder="Để trống nếu áp dụng toàn hệ thống"
                  options={products.map((p) => ({
                    value: p.id,
                    label: `${p.name} #${p.id}`,
                    searchText: `${p.id} ${p.name}`,
                  }))}
                />
              </Form.Item>
              <Space size="middle" style={{ width: "100%" }}>
                <Form.Item name="value" label="Giá trị" style={{ flex: 1 }}>
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                  name="impact_score"
                  label="Điểm tác động"
                  initialValue={0}
                  style={{ flex: 1 }}
                >
                  <InputNumber style={{ width: "100%" }} min={-100} max={100} />
                </Form.Item>
              </Space>
              <Form.Item name="source" label="Nguồn">
                <Input placeholder="Nội bộ, thị trường, nhà cung cấp..." />
              </Form.Item>
              <Form.Item name="note" label="Ghi chú">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Button
                type="primary"
                loading={createFactor.isPending}
                onClick={handleCreateFactor}
              >
                Lưu yếu tố ngoại vi
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card title="Yếu tố ngoại vi đã ghi nhận">
            <Table<ExternalFactor>
              rowKey="id"
              loading={externalFactors.isLoading}
              dataSource={externalFactors.data}
              pagination={{ pageSize: 6 }}
              columns={[
                { title: "Ngày", dataIndex: "factor_date" },
                { title: "Loại", dataIndex: "factor_type" },
                { title: "Tên", dataIndex: "name" },
                { title: "Tác động", dataIndex: "impact_score" },
                { title: "Sản phẩm", dataIndex: "product_id", render: (v) => v || "Tất cả" },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Dataset LSTM/Transformer">
        <Space style={{ marginBottom: 16 }}>
          <SearchCombobox
            value={productId}
            onChange={(value) => setProductId(Number(value))}
            onSearch={(value) => setProductSearch(value)}
            placeholder="Chọn sản phẩm để xem dataset"
            style={{ width: 360 }}
            options={products.map((p) => ({
              value: p.id,
              label: `${p.name} #${p.id}`,
              searchText: `${p.id} ${p.name}`,
            }))}
          />
          {dataset.data?.quality.model_ready && (
            <Tag color={readinessColor[dataset.data.quality.model_ready]}>
              {readinessLabel[dataset.data.quality.model_ready]}
            </Tag>
          )}
        </Space>
        <Table
          rowKey="date"
          loading={dataset.isLoading}
          dataSource={latestRows}
          pagination={false}
          columns={[
            { title: "Ngày", dataIndex: "date" },
            { title: "Số lượng xuất", dataIndex: "export_quantity" },
            { title: "Tác động ngoại vi", dataIndex: "external_impact" },
          ]}
        />
      </Card>
    </div>
  );
}
