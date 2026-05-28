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
import PageHero from "@/components/common/PageHero";
import SearchCombobox from "@/components/common/SearchCombobox";
import { useProducts } from "@/features/products/hooks";
import {
  useAiDataOverview,
  useAiModelBenchmarks,
  useCreateExternalFactor,
  useDeepLearningDataset,
  useExternalFactors,
  useTrainAiForecast,
} from "../hooks";
import type {
  ExternalFactor,
  ExternalFactorInput,
  ProductTrainingQuality,
} from "../types";

const { Text } = Typography;

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

const factorTypeOptions = [
  { value: "WEATHER", label: "Weather / mùa vụ" },
  { value: "CPI", label: "CPI / lạm phát" },
  { value: "FUEL_PRICE", label: "Giá xăng dầu / logistics" },
  { value: "HOLIDAY_VN", label: "Ngày lễ / sự kiện VN" },
  { value: "ECOMMERCE_TREND", label: "Traffic / ecommerce trend" },
  { value: "PROMO", label: "Khuyến mãi" },
  { value: "SCHOOL_HOLIDAY", label: "School holiday" },
  { value: "MARKET", label: "Thị trường" },
  { value: "PRICE", label: "Biến động giá" },
  { value: "SUPPLY", label: "Chuỗi cung ứng" },
  { value: "EVENT", label: "Sự kiện khác" },
];

const factorSourceOptions = [
  { value: "GSO_VN", label: "Tổng cục Thống kê VN (CPI)" },
  { value: "PETROLIMEX", label: "Petrolimex (xăng dầu)" },
  { value: "VN_CALENDAR", label: "Calendar VN nội bộ" },
  { value: "M5_PUBLIC", label: "M5 public dataset" },
  { value: "WALMART_PUBLIC", label: "Walmart public dataset" },
  { value: "ROSSMANN_PUBLIC", label: "Rossmann public dataset" },
  { value: "INTERNAL_LOGS", label: "Real operational logs" },
  { value: "SYNTHETIC_HYBRID", label: "Synthetic hybrid dataset" },
];

export default function AiDataPage() {
  const [form] = Form.useForm<ExternalFactorInput>();
  const [productId, setProductId] = useState<number | undefined>();
  const [productSearch, setProductSearch] = useState("");
  const overview = useAiDataOverview();
  const benchmarks = useAiModelBenchmarks();
  const externalFactors = useExternalFactors();
  const createFactor = useCreateExternalFactor();
  const trainAi = useTrainAiForecast();
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
  const bestBenchmark = useMemo(
    () => {
      if (benchmarks.data?.recommended_model) {
        return benchmarks.data.recommended_model;
      }

      return (benchmarks.data?.datasets || [])
        .flatMap((dataset) =>
          dataset.models.map((model) => ({
            dataset: dataset.dataset,
            train_points: dataset.train_points,
            test_points: dataset.test_points,
            ...model,
          }))
        )
        .find((row) => row.dataset === "M5" && row.model === "Transformer");
    },
    [benchmarks.data]
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
      <PageHero
        eyebrow="AI data platform"
        title="Dữ liệu huấn luyện AI"
        description="Theo dõi dữ liệu vận hành thật, benchmark public dataset, yếu tố ngoại vi và trạng thái sẵn sàng của từng sản phẩm trước khi train forecast."
        actions={
          <Button
            type="primary"
            loading={trainAi.isPending}
            onClick={() =>
              trainAi.mutate(undefined, {
                onSuccess: () => message.success("Đã train lại AI Forecast"),
                onError: (error) => {
                  const err = error as { message?: string };
                  message.error(err.message || "Không train lại được AI");
                },
              })
            }
          >
            Train AI Forecast
          </Button>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={4}>
          <Card className="workflow-card">
            <Statistic title="Sản phẩm" value={counts?.products || 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card className="workflow-card">
            <Statistic title="Dòng tồn kho" value={counts?.inventory_records || 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card className="workflow-card">
            <Statistic title="SL thực tế trong kho" value={counts?.current_stock_quantity || 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card className="workflow-card">
            <Statistic title="Giao dịch" value={counts?.stock_transactions || 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card className="workflow-card">
            <Statistic title="Xuất kho" value={counts?.export_transactions || 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card className="workflow-card">
            <Statistic title="Forecast" value={counts?.forecast_results || 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card className="workflow-card">
            <Statistic title="Yếu tố ngoại vi" value={counts?.external_factors || 0} />
          </Card>
        </Col>
      </Row>

      {overview.data?.recommendation && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
          title="Đánh giá dữ liệu"
          description={overview.data.recommendation}
        />
      )}

      <Alert
        type="success"
        showIcon
        style={{ marginBottom: 24 }}
        title="Hybrid Data Architecture cho AI"
        description="Public dataset + synthetic warehouse data + external factors + real operational logs. Đây là hướng mình đang đẩy vào seed/training pipeline để AI forecast hoạt động thật trên project."
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card className="workflow-card">
            <Statistic title="Model đang ưu tiên" value={bestBenchmark?.model || "Đang cập nhật"} />
            <Text type="secondary">{bestBenchmark?.dataset || "Chưa có dataset"} · ưu tiên dữ liệu lớn</Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="workflow-card">
            <Statistic title="Độ chính xác model ưu tiên" value={bestBenchmark?.accuracy || 0} suffix="%" />
            <Text type="secondary">Train/Test: {bestBenchmark?.train_points || 0}/{bestBenchmark?.test_points || 0}</Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="workflow-card">
            <Statistic title="Pipeline" value="Sẵn sàng train" />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">Dùng sau khi import/export nhiều dữ liệu mới.</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Độ chính xác model AI theo dataset" className="workflow-card" style={{ marginBottom: 24 }}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          title={`Model hệ thống đang dùng: ${bestBenchmark?.dataset || "M5"} ${bestBenchmark?.model || "Transformer"} · ${bestBenchmark?.accuracy || 0}%`}
          description={
            "Hệ thống ưu tiên Transformer trên M5 vì M5 có nhiều điểm train/test hơn Walmart, nên kết quả ổn định hơn khi dùng làm benchmark chính."
          }
        />
        <Table
          rowKey={(record) => `${record.dataset}-${record.model}`}
          loading={benchmarks.isLoading}
          dataSource={(benchmarks.data?.datasets || []).flatMap((dataset) =>
            dataset.models.map((model) => ({
              dataset: dataset.dataset,
              source: dataset.source,
              target: dataset.target,
              train_points: dataset.train_points,
              test_points: dataset.test_points,
              evaluated_points: dataset.evaluated_points,
              ...model,
            }))
          )}
          pagination={false}
          columns={[
            { title: "Dataset", dataIndex: "dataset" },
            { title: "Model", dataIndex: "model" },
            {
              title: "Accuracy",
              dataIndex: "accuracy",
              render: (value: number) => <Tag color={value >= 80 ? "green" : value >= 60 ? "blue" : "orange"}>{value}%</Tag>,
              sorter: (a, b) => a.accuracy - b.accuracy,
            },
            { title: "MAPE", dataIndex: "mape", render: (value: number) => `${value}%` },
            { title: "WMAPE", dataIndex: "wmape", render: (value: number) => `${value}%` },
            { title: "MAE", dataIndex: "mae" },
            { title: "RMSE", dataIndex: "rmse" },
            { title: "Train points", dataIndex: "train_points" },
            { title: "Test points", dataIndex: "test_points" },
            { title: "Target", dataIndex: "target" },
          ]}
        />
      </Card>

      <Card title="Chất lượng dữ liệu theo sản phẩm" className="workflow-card" style={{ marginBottom: 24 }}>
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
          <Card title="Thêm yếu tố ngoại vi" className="workflow-card">
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
                  options={factorTypeOptions}
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
                <Select
                  showSearch
                  allowClear
                  placeholder="Chọn nguồn hoặc để trống"
                  options={factorSourceOptions}
                />
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
          <Card title="Yếu tố ngoại vi đã ghi nhận" className="workflow-card">
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

      <Card title="Dataset LSTM/Transformer" className="workflow-card">
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
