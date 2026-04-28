import { useState } from "react";
import { Select, Space } from "antd";

import TransactionTable from "../components/TransactionTable";
import LoadingPage from "@/components/common/LoadingPage";
import EmptyState from "@/components/common/EmptyState";
import PaginationBar from "@/components/common/PaginationBar";

import { useTransactions } from "../hooks";
import type { TransactionType } from "../types";

export default function TransactionPage() {

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filter, setFilter] = useState<TransactionType | "ALL">("ALL");

    const { data, isLoading } = useTransactions({
        page,
        page_size: pageSize,
        type: filter === "ALL" ? undefined : filter,
    });
    const transactions = data?.items || [];
    const total = data?.meta?.total || 0;

    const handlePageChange = (page: number, pageSize: number) => {
        setPage(page);
        setPageSize(pageSize);
    };

    if (isLoading) return <LoadingPage />;

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
                <h2 style={{ fontSize: 24, fontWeight: 600 }}>
                    Lịch sử Giao dịch ({total})
                </h2>

                <Space>
                    <span style={{ fontWeight: 500, color: "#666" }}>
                        Lọc theo loại:
                    </span>

                    <Select
                        value={filter}
                        onChange={(value) => {
                            setFilter(value);
                            setPage(1); // 🔥 reset page
                        }}
                        style={{ width: 180 }}
                        options={[
                            { label: "Tất cả giao dịch", value: "ALL" },
                            { label: "Nhập kho", value: "IMPORT" },
                            { label: "Xuất kho", value: "EXPORT" },
                            { label: "Điều chỉnh", value: "ADJUST" },
                        ]}
                    />
                </Space>
            </div>

            {transactions.length > 0 ? (
                <>
                    <TransactionTable data={transactions} />
                    <PaginationBar
                        current={page}
                        pageSize={pageSize}
                        total={total}
                        onChange={handlePageChange}
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total) => `Tổng cộng ${total} giao dịch`}
                    />
                </>
            ) : (
                <EmptyState description="Chưa có giao dịch nào" />
            )}
        </div>
    );
}