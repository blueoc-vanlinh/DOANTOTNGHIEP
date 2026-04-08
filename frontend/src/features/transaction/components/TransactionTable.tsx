import { Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

import BaseTable from "@/components/common/BaseTable";
import type { Transaction, TransactionType } from "../types";

interface TransactionTableProps {
    data: Transaction[];
    loading?: boolean;
}

export default function TransactionTable({
    data,
    loading = false,
}: TransactionTableProps) {
    const columns: ColumnsType<Transaction> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
            align: "center",
        },
        {
            title: "Loại giao dịch",
            dataIndex: "type",
            key: "type",
            width: 160,
            render: (type: TransactionType) => (
                <Tag
                    color={type === "IMPORT" ? "green" : "red"}
                    style={{ fontSize: "13px", padding: "4px 12px" }}
                >
                    {type === "IMPORT" ? "NHẬP KHO" : "XUẤT KHO"}
                </Tag>
            ),
        },
        {
            title: "Sản phẩm",
            dataIndex: "product_id",
            key: "product_id",
            render: (id: number) => <strong>SP#{id}</strong>,
            width: 180,
        },
        {
            title: "Kho hàng",
            dataIndex: "warehouse_id",
            key: "warehouse_id",
            render: (id: number) => <span>Kho#{id}</span>,
            width: 140,
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            width: 140,
            sorter: (a, b) => a.quantity - b.quantity,
            render: (qty: number) => (
                <b style={{ fontSize: "15px", color: "#1677ff" }}>{qty.toLocaleString()}</b>
            ),
            align: "center",
        },
        {
            title: "Ngày giao dịch",
            dataIndex: "created_at",
            key: "created_at",
            width: 180,
            sorter: (a, b) =>
                new Date(a.created_at || "").getTime() - new Date(b.created_at || "").getTime(),
            render: (date: string) =>
                date ? new Date(date).toLocaleString("vi-VN") : "-",
        },
    ];

    return (
        <BaseTable<Transaction>
            columns={columns}
            data={data}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1100 }}
        />
    );
}