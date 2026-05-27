import { useState } from "react";
import { Input, Select, Space } from "antd";
import { useDebounce } from "use-debounce";

import TransactionTable from "../components/TransactionTable";
import LoadingPage from "@/components/common/LoadingPage";
import EmptyState from "@/components/common/EmptyState";
import PaginationBar from "@/components/common/PaginationBar";
import PageHero from "@/components/common/PageHero";

import { useTransactions } from "../hooks";
import type { TransactionType } from "../types";

export default function TransactionPage() {

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filter, setFilter] = useState<TransactionType | "ALL">("ALL");
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 500);

    const { data, isLoading } = useTransactions({
        page,
        page_size: pageSize,
        search: debouncedSearch,
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
            <PageHero
                eyebrow="Stock ledger"
                title={`Lịch sử giao dịch (${total})`}
                description="Theo dõi toàn bộ biến động nhập, xuất, điều chỉnh và hoàn/hủy tồn kho."
                actions={
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
                            { label: "Hủy phiếu nhập", value: "IMPORT_CANCEL" },
                            { label: "Hủy phiếu xuất", value: "EXPORT_CANCEL" },
                            { label: "Khách trả hàng", value: "CUSTOMER_RETURN" },
                            { label: "Trả nhà cung cấp", value: "SUPPLIER_RETURN" },
                            { label: "Nhận hàng PO", value: "PO_RECEIVE" },
                        ]}
                    />
                </Space>
                }
            />

            <div className="section-band" style={{ marginBottom: 16, padding: 16 }}>
                <Input.Search
                    allowClear
                    value={search}
                    placeholder="Tìm theo tên sản phẩm trong giao dịch"
                    onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(1);
                    }}
                />
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
