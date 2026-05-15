import {
    Card,
    Row,
    Col,
    Statistic,
    Typography,
    Table,
    Tag,
} from "antd";

import {
    ShoppingOutlined,
    InboxOutlined,
    UploadOutlined,
    DownloadOutlined,
    WarningOutlined,
    DatabaseOutlined,
} from "@ant-design/icons";

import LoadingPage from "@/components/common/LoadingPage";

import EmptyState from "@/components/common/EmptyState";

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

import { useDashboardData } from "../hooks";

import type {
    DashboardSummary,
    LowStockProduct,
    RecentTransaction,
    ChartData,
} from "../types";

const { Title, Text } =
    Typography;

export default function DashboardPage() {
    const { data, isLoading } =
        useDashboardData();

    if (isLoading)
        return <LoadingPage />;

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

            low_stock_count: 0,

            out_of_stock_count: 0,
        };

    const chartData: ChartData[] =
        data?.transaction_chart ||
        [];

    const lowStockProducts: LowStockProduct[] =
        data?.low_stock_products ||
        [];

    const recentTransactions: RecentTransaction[] =
        data?.recent_transactions ||
        [];

    return (
        <div>
            {/* HEADER */}
            <div
                style={{
                    marginBottom: 32,
                }}
            >
                <Title
                    level={2}
                    style={{ margin: 0 }}
                >
                    Dashboard Tổng quan
                </Title>

                <Text type="secondary">
                    Theo dõi hoạt động kho
                    hàng thời gian thực
                </Text>
            </div>

            {/* SUMMARY */}
            <Row gutter={[16, 16]}>
                <Col
                    xs={24}
                    sm={12}
                    lg={6}
                >
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 12,
                        }}
                    >
                        <Statistic
                            title="Tổng sản phẩm"
                            value={
                                summary.total_products
                            }
                            prefix={
                                <ShoppingOutlined
                                    style={{
                                        color: "#334371",
                                    }}
                                />
                            }
                            valueStyle={{
                                color: "#334371",
                                fontWeight: 600,
                            }}
                        />
                    </Card>
                </Col>

                <Col
                    xs={24}
                    sm={12}
                    lg={6}
                >
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 12,
                        }}
                    >
                        <Statistic
                            title="Tổng tồn kho"
                            value={
                                summary.total_inventory
                            }
                            prefix={
                                <InboxOutlined
                                    style={{
                                        color: "#52c41a",
                                    }}
                                />
                            }
                            valueStyle={{
                                color: "#52c41a",
                                fontWeight: 600,
                            }}
                        />
                    </Card>
                </Col>

                <Col
                    xs={24}
                    sm={12}
                    lg={6}
                >
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 12,
                        }}
                    >
                        <Statistic
                            title="Đơn nhập"
                            value={
                                summary.total_import_orders
                            }
                            prefix={
                                <UploadOutlined
                                    style={{
                                        color: "#1677ff",
                                    }}
                                />
                            }
                            valueStyle={{
                                color: "#1677ff",
                                fontWeight: 600,
                            }}
                        />
                    </Card>
                </Col>

                <Col
                    xs={24}
                    sm={12}
                    lg={6}
                >
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 12,
                        }}
                    >
                        <Statistic
                            title="Đơn xuất"
                            value={
                                summary.total_export_orders
                            }
                            prefix={
                                <DownloadOutlined
                                    style={{
                                        color: "#ff4d4f",
                                    }}
                                />
                            }
                            valueStyle={{
                                color: "#ff4d4f",
                                fontWeight: 600,
                            }}
                        />
                    </Card>
                </Col>

                <Col
                    xs={24}
                    sm={12}
                    lg={6}
                >
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 12,
                        }}
                    >
                        <Statistic
                            title="Sắp hết hàng"
                            value={
                                summary.low_stock_count
                            }
                            prefix={
                                <WarningOutlined
                                    style={{
                                        color: "#faad14",
                                    }}
                                />
                            }
                            valueStyle={{
                                color: "#faad14",
                                fontWeight: 600,
                            }}
                        />
                    </Card>
                </Col>

                <Col
                    xs={24}
                    sm={12}
                    lg={6}
                >
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 12,
                        }}
                    >
                        <Statistic
                            title="Hết hàng"
                            value={
                                summary.out_of_stock_count
                            }
                            prefix={
                                <DatabaseOutlined
                                    style={{
                                        color: "#722ed1",
                                    }}
                                />
                            }
                            valueStyle={{
                                color: "#722ed1",
                                fontWeight: 600,
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* CHART */}
            <Card
                style={{
                    marginTop: 24,
                    borderRadius: 12,
                }}
                title="Biểu đồ nhập/xuất 7 ngày"
            >
                {chartData.length >
                    0 ? (
                    <ResponsiveContainer
                        width="100%"
                        height={420}
                    >
                        <LineChart
                            data={chartData}
                        >
                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis
                                dataKey="date"
                            />

                            <YAxis />

                            <Tooltip />

                            <Legend />

                            <Line
                                type="monotone"
                                dataKey="import"
                                stroke="#52c41a"
                                strokeWidth={3}
                                name="Nhập"
                            />

                            <Line
                                type="monotone"
                                dataKey="export"
                                stroke="#ff4d4f"
                                strokeWidth={3}
                                name="Xuất"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div
                        style={{
                            padding:
                                "80px 0",
                        }}
                    >
                        <EmptyState description="Chưa có dữ liệu biểu đồ" />
                    </div>
                )}
            </Card>

            {/* LOW STOCK */}
            <Card
                style={{
                    marginTop: 24,
                    borderRadius: 12,
                }}
                title="Sản phẩm sắp hết hàng"
            >
                <Table<LowStockProduct>
                    rowKey="inventory_id"
                    pagination={false}
                    dataSource={
                        lowStockProducts
                    }
                    columns={[
                        {
                            title:
                                "Sản phẩm",

                            dataIndex:
                                "product_name",
                        },

                        {
                            title: "Kho",

                            dataIndex:
                                "warehouse_name",
                        },

                        {
                            title:
                                "Tồn kho",

                            dataIndex:
                                "quantity",

                            render: (
                                value: number
                            ) => (
                                <Tag color="red">
                                    {value}
                                </Tag>
                            ),
                        },

                        {
                            title:
                                "Ngưỡng tối thiểu",

                            dataIndex:
                                "min_threshold",
                        },
                    ]}
                />
            </Card>

            {/* RECENT TRANSACTIONS */}
            <Card
                style={{
                    marginTop: 24,
                    borderRadius: 12,
                }}
                title="Giao dịch gần đây"
            >
                <Table<RecentTransaction>
                    rowKey="id"
                    pagination={false}
                    dataSource={
                        recentTransactions
                    }
                    columns={[
                        {
                            title: "ID",

                            dataIndex: "id",
                        },

                        {
                            title:
                                "Sản phẩm",

                            dataIndex:
                                "product_name",
                        },

                        {
                            title: "Kho",

                            dataIndex:
                                "warehouse_name",
                        },

                        {
                            title:
                                "Loại",

                            dataIndex:
                                "type",

                            render: (
                                val: string
                            ) => (
                                <Tag
                                    color={
                                        val ===
                                            "IMPORT"
                                            ? "green"
                                            : "red"
                                    }
                                >
                                    {val}
                                </Tag>
                            ),
                        },

                        {
                            title:
                                "Số lượng",

                            dataIndex:
                                "quantity",
                        },

                        {
                            title:
                                "Thời gian",

                            dataIndex:
                                "created_at",

                            render: (
                                value: string
                            ) =>
                                new Date(
                                    value
                                ).toLocaleString(),
                        },
                    ]}
                />
            </Card>
        </div>
    );
}