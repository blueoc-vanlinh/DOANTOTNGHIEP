import { useState } from "react";
import {
  Card,
  Col,
  DatePicker,
  Row,
  Segmented,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  AlertOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  DownloadOutlined,
  InboxOutlined,
  RiseOutlined,
  ShoppingOutlined,
  UploadOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import EmptyState from "@/components/common/EmptyState";
import LoadingPage from "@/components/common/LoadingPage";
import { useDashboardData } from "../hooks";
import type {
  ChartData,
  DashboardSummary,
  LowStockProduct,
  RecentTransaction,
} from "../types";

const { Title, Text } = Typography;

type DashboardPeriod = "day" | "month" | "year";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("vi-VN");

const periodLabels: Record<DashboardPeriod, string> = {
  day: "Hôm nay",
  month: "Tháng này",
  year: "Năm nay",
};

export default function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>("day");
  const [targetDate, setTargetDate] = useState<string | undefined>();
  const [targetMonth, setTargetMonth] = useState<string | undefined>();
  const [targetYear, setTargetYear] = useState<number | undefined>();

  const handlePeriodChange = (value: DashboardPeriod) => {
    setPeriod(value);
    if (value !== "day") {
      setTargetDate(undefined);
    }
    if (value !== "month") {
      setTargetMonth(undefined);
    }
    if (value !== "year") {
      setTargetYear(undefined);
    }
  };

  const { data, isLoading } = useDashboardData({
    period,
    target_date: period === "day" ? targetDate : undefined,
    target_month: period === "month" ? targetMonth : undefined,
    target_year: period === "year" ? targetYear : undefined,
  });

  if (isLoading) return <LoadingPage />;

  const summary: DashboardSummary =
    data?.summary || {
      total_products: 0,
      total_warehouses: 0,
      total_inventory: 0,
      total_import_orders: 0,
      total_export_orders: 0,
      import_today: 0,
      export_today: 0,
      total_import_value: 0,
      total_export_value: 0,
      monthly_import_value: 0,
      monthly_export_value: 0,
      period_import_orders: 0,
      period_export_orders: 0,
      period_import_value: 0,
      period_export_value: 0,
      period_profit: 0,
      inventory_value: 0,
      low_stock_count: 0,
      out_of_stock_count: 0,
    };

  const chartData: ChartData[] = data?.transaction_chart || [];
  const lowStockProducts: LowStockProduct[] = data?.low_stock_products || [];
  const recentTransactions: RecentTransaction[] = data?.recent_transactions || [];
  const topExportProducts = data?.top_export_products || [];
  const topImportProducts = data?.top_import_products || [];

  return (
    <div>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Dashboard Tổng quan
          </Title>
          <Text type="secondary">
            Theo dõi vận hành kho theo ngày, tháng và năm
          </Text>
        </div>

        <Segmented
          value={period}
          onChange={(value) => handlePeriodChange(value as DashboardPeriod)}
          options={[
            { label: "Ngày", value: "day" },
            { label: "Tháng", value: "month" },
            { label: "Năm", value: "year" },
          ]}
        />
        {period === "day" && (
          <DatePicker
            placeholder="Chọn ngày"
            format="YYYY-MM-DD"
            onChange={(_, value) => setTargetDate(String(value || "") || undefined)}
          />
        )}
        {period === "month" && (
          <DatePicker
            picker="month"
            placeholder="Chọn tháng"
            format="YYYY-MM"
            onChange={(_, value) => setTargetMonth(String(value || "") || undefined)}
          />
        )}
        {period === "year" && (
          <DatePicker
            picker="year"
            placeholder="Chọn năm"
            format="YYYY"
            onChange={(_, value) => {
              const text = String(value || "");
              setTargetYear(text ? Number(text) : undefined);
            }}
          />
        )}
      </div>

      <Row gutter={[16, 16]}>
        <StatCard title="Tổng sản phẩm" value={summary.total_products} icon={<ShoppingOutlined />} color="#334371" />
        <StatCard title="Tổng tồn kho" value={summary.total_inventory} icon={<InboxOutlined />} color="#237804" />
        <StatCard title="Giá trị tồn kho" value={summary.inventory_value} icon={<DatabaseOutlined />} color="#08979c" money />
        <StatCard title="Kho đang dùng" value={summary.total_warehouses} icon={<BarChartOutlined />} color="#531dab" />
        <StatCard title={`Đơn nhập ${periodLabels[period].toLowerCase()}`} value={summary.period_import_orders} icon={<UploadOutlined />} color="#1677ff" />
        <StatCard title={`Đơn xuất ${periodLabels[period].toLowerCase()}`} value={summary.period_export_orders} icon={<DownloadOutlined />} color="#a8071a" />
        <StatCard title="Doanh thu kỳ này" value={summary.period_export_value} icon={<RiseOutlined />} color="#389e0d" money />
        <StatCard title="Chi phí nhập kỳ này" value={summary.period_import_value} icon={<UploadOutlined />} color="#d48806" money />
        <StatCard title="Lãi tạm tính" value={summary.period_profit} icon={<RiseOutlined />} color={summary.period_profit >= 0 ? "#237804" : "#cf1322"} money />
        <StatCard title="Sắp hết hàng" value={summary.low_stock_count} icon={<WarningOutlined />} color="#faad14" />
        <StatCard title="Hết hàng" value={summary.out_of_stock_count} icon={<AlertOutlined />} color="#cf1322" />
        <StatCard title="Tổng đơn xuất" value={summary.total_export_orders} icon={<DownloadOutlined />} color="#722ed1" />
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} xl={14}>
          <Card title={`Biểu đồ nhập/xuất - ${data?.period?.chart_label || periodLabels[period]}`}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={360}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => numberFormatter.format(Number(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="import" stroke="#1677ff" strokeWidth={3} name="Lượt nhập" />
                  <Line type="monotone" dataKey="export" stroke="#a8071a" strokeWidth={3} name="Lượt xuất" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState description="Chưa có dữ liệu biểu đồ" />
            )}
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card title="Giá trị nhập/xuất">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000000)}tr`} />
                  <Tooltip formatter={(value) => currencyFormatter.format(Number(value))} />
                  <Legend />
                  <Bar dataKey="import_value" fill="#d48806" name="Chi phí nhập" />
                  <Bar dataKey="export_value" fill="#389e0d" name="Doanh thu xuất" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState description="Chưa có dữ liệu giá trị" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Top sản phẩm xuất nhiều">
            <Table
              rowKey="product_id"
              pagination={false}
              dataSource={topExportProducts}
              columns={[
                { title: "Sản phẩm", dataIndex: "product_name" },
                { title: "Số lượng xuất", dataIndex: "total_export", align: "right" },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top sản phẩm nhập nhiều">
            <Table
              rowKey="product_id"
              pagination={false}
              dataSource={topImportProducts}
              columns={[
                { title: "Sản phẩm", dataIndex: "product_name" },
                { title: "Số lượng nhập", dataIndex: "total_import", align: "right" },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }} title="Sản phẩm sắp hết hàng">
        <Table<LowStockProduct>
          rowKey="inventory_id"
          pagination={false}
          dataSource={lowStockProducts}
          columns={[
            { title: "Sản phẩm", dataIndex: "product_name" },
            { title: "Kho", dataIndex: "warehouse_name" },
            {
              title: "Tồn kho",
              dataIndex: "quantity",
              render: (value: number) => <Tag color="red">{value}</Tag>,
            },
            { title: "Ngưỡng tối thiểu", dataIndex: "min_threshold" },
          ]}
        />
      </Card>

      <Card style={{ marginTop: 24 }} title="Giao dịch gần đây">
        <Table<RecentTransaction>
          rowKey="id"
          pagination={false}
          dataSource={recentTransactions}
          columns={[
            { title: "ID", dataIndex: "id" },
            { title: "Sản phẩm", dataIndex: "product_name" },
            { title: "Kho", dataIndex: "warehouse_name" },
            {
              title: "Loại",
              dataIndex: "type",
              render: (val: string) => (
                <Tag color={val === "IMPORT" ? "green" : "red"}>
                  {val === "IMPORT" ? "Nhập" : "Xuất"}
                </Tag>
              ),
            },
            { title: "Số lượng", dataIndex: "quantity" },
            {
              title: "Thời gian",
              dataIndex: "created_at",
              render: (value: string) => new Date(value).toLocaleString("vi-VN"),
            },
          ]}
        />
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  money = false,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  money?: boolean;
}) {
  return (
    <Col xs={24} sm={12} lg={6} xl={4}>
      <Card>
        <Statistic
          title={title}
          value={money ? currencyFormatter.format(value) : value}
          prefix={<Space style={{ color }}>{icon}</Space>}
          valueStyle={{ color, fontWeight: 600, fontSize: money ? 20 : 24 }}
        />
      </Card>
    </Col>
  );
}
