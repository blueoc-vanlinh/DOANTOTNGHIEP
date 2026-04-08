// src/pages/transactions/TransactionPage.tsx
import { useState } from "react";
import { Select, Space } from "antd";

import TransactionTable from "../components/TransactionTable";
import LoadingPage from "@/components/common/LoadingPage";
import EmptyState from "@/components/common/EmptyState";

import { useTransactions } from "../hooks";
import type { TransactionType } from "../types";

export default function TransactionPage() {
    const { data, isLoading } = useTransactions();
    const [filter, setFilter] = useState<TransactionType | "ALL">("ALL");

    const filteredData =
        filter === "ALL"
            ? data
            : data?.filter((t) => t.type === filter) || [];

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
                <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 600 }}>
                    Lịch sử Giao dịch
                </h2>
                <Space>
                    <span style={{ fontWeight: 500, color: "#666" }}>Lọc theo loại:</span>
                    <Select
                        value={filter}
                        onChange={(value) => setFilter(value as TransactionType | "ALL")}
                        style={{ width: 180 }}
                        options={[
                            { label: "Tất cả giao dịch", value: "ALL" },
                            { label: "Nhập kho", value: "IMPORT" },
                            { label: "Xuất kho", value: "EXPORT" },
                        ]}
                    />
                </Space>
            </div>
            {filteredData && filteredData.length > 0 ? (
                <TransactionTable
                    data={filteredData}
                />
            ) : (
                <EmptyState
                    description={
                        filter === "ALL"
                            ? "Chưa có giao dịch nào"
                            : `Chưa có giao dịch ${filter === "IMPORT" ? "nhập kho" : "xuất kho"} nào`
                    }
                />
            )}
        </div>
    );
}