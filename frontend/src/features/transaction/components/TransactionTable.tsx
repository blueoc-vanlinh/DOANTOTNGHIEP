import { Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

import BaseTable from "@/components/common/BaseTable";
import type { Transaction, TransactionType } from "../types";
import { getTransactionTypeMeta } from "../utils/transactionLabels";

interface TransactionTableProps {
    data: Transaction[];
    loading?: boolean;
}

export default function TransactionTable({
    data,
    loading = false,
}: TransactionTableProps) {

    const getTypeTag = (type: TransactionType) => {
        const meta = getTransactionTypeMeta(type);
        return <Tag color={meta.color}>{meta.label.toUpperCase()}</Tag>;
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
                <strong style={{ color: "#334371" }}>{name}</strong>
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
                const meta = getTransactionTypeMeta(record.type);

                return (
                    <b
                        style={{
                            fontSize: 15,
                            color: meta.sign === "+"
                                ? "#237804"
                                : meta.sign === "-"
                                    ? "#8b0000"
                                    : "#fa8c16",
                        }}
                    >
                        {meta.sign}
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
                        color: val > 0 ? "#334371" : "#8b0000",
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
