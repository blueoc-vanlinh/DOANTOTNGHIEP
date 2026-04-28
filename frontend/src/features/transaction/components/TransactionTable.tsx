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

    const getTypeTag = (type: TransactionType) => {
        switch (type) {
            case "IMPORT":
                return <Tag color="green">NHẬP KHO</Tag>;
            case "EXPORT":
                return <Tag color="red">XUẤT KHO</Tag>;
            case "ADJUST":
                return <Tag color="orange">ĐIỀU CHỈNH</Tag>;
            default:
                return <Tag>{type}</Tag>;
        }
    };

    const columns: ColumnsType<Transaction> = [
        {
            title: "ID",
            dataIndex: "id",
            width: 70,
            align: "center",
        },

        {
            title: "Loại",
            dataIndex: "type",
            width: 140,
            align: "center",
            render: (type: TransactionType) => getTypeTag(type),
        },
        {
            title: "Sản phẩm",
            dataIndex: "product_name",
            width: 220,
            render: (name: string) => (
                <strong style={{ color: "#1677ff" }}>{name}</strong>
            ),
        },

        {
            title: "Kho",
            dataIndex: "warehouse_name",
            width: 180,
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            width: 140,
            align: "center",
            sorter: (a, b) => a.quantity - b.quantity,
            render: (qty: number, record) => {
                const isImport = record.type === "IMPORT";
                const isExport = record.type === "EXPORT";

                return (
                    <b
                        style={{
                            fontSize: 15,
                            color: isImport
                                ? "#52c41a"
                                : isExport
                                    ? "#ff4d4f"
                                    : "#fa8c16",
                        }}
                    >
                        {isImport ? "+" : isExport ? "-" : ""}
                        {qty.toLocaleString()}
                    </b>
                );
            },
        },

        // ✅ tồn kho sau giao dịch
        {
            title: "Tồn sau",
            dataIndex: "balance_after",
            width: 140,
            align: "center",
            render: (val: number) => (
                <b
                    style={{
                        color: val > 0 ? "#1677ff" : "#ff4d4f",
                    }}
                >
                    {val.toLocaleString()}
                </b>
            ),
        },

        {
            title: "Ngày",
            dataIndex: "created_at",
            width: 180,
            sorter: (a, b) =>
                new Date(a.created_at || "").getTime() -
                new Date(b.created_at || "").getTime(),
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
            scroll={{ x: 1200 }}
            pagination={false}
        />
    );
}