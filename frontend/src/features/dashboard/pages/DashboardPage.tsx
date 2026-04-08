// src/pages/dashboard/DashboardPage.tsx
import { Card, Row, Col, Statistic, Typography } from "antd";
import { ShoppingOutlined, InboxOutlined, UploadOutlined, DownloadOutlined } from "@ant-design/icons";

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

const { Title, Text } = Typography;

export default function DashboardPage() {
    const { data, isLoading } = useDashboardData();

    if (isLoading) return <LoadingPage />;

    const summary = data?.summary || {};
    const chartData = data?.chartData || [];

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <Title level={2} style={{ margin: 0 }}>
                    Dashboard Tổng quan
                </Title>
                <Text type="secondary">Theo dõi hoạt động kho hàng thời gian thực</Text>
            </div>

            {/* Summary Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ borderRadius: "12px" }}>
                        <Statistic
                            title="Tổng sản phẩm"
                            value={summary.total_products || 0}
                            prefix={<ShoppingOutlined style={{ color: "#1677ff" }} />}
                            valueStyle={{ color: "#1677ff", fontWeight: 600 }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ borderRadius: "12px" }}>
                        <Statistic
                            title="Tổng tồn kho"
                            value={summary.total_inventory || 0}
                            prefix={<InboxOutlined style={{ color: "#52c41a" }} />}
                            valueStyle={{ color: "#52c41a", fontWeight: 600 }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ borderRadius: "12px" }}>
                        <Statistic
                            title="Lượt nhập kho"
                            value={summary.total_imports || 0}
                            prefix={<UploadOutlined style={{ color: "#1677ff" }} />}
                            valueStyle={{ color: "#1677ff", fontWeight: 600 }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ borderRadius: "12px" }}>
                        <Statistic
                            title="Lượt xuất kho"
                            value={summary.total_exports || 0}
                            prefix={<DownloadOutlined style={{ color: "#ff4d4f" }} />}
                            valueStyle={{ color: "#ff4d4f", fontWeight: 600 }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Chart Section */}
            <Card
                style={{ marginTop: 24, borderRadius: "12px" }}
                title={
                    <span style={{ fontSize: "18px", fontWeight: 600 }}>
                        So sánh Nhập kho vs Xuất kho theo thời gian
                    </span>
                }
            >
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={420}>
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                                }}
                            />
                            <Legend />

                            <Line
                                type="monotone"
                                dataKey="import"
                                stroke="#52c41a"
                                strokeWidth={3}
                                name="Nhập kho"
                                dot={{ fill: "#52c41a", r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="export"
                                stroke="#ff4d4f"
                                strokeWidth={3}
                                name="Xuất kho"
                                dot={{ fill: "#ff4d4f", r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ padding: "80px 0" }}>
                        <EmptyState
                            description="Chưa có dữ liệu biểu đồ trong kỳ này"
                        />
                    </div>
                )}
            </Card>
        </div>
    );
}