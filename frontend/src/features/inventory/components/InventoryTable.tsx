// src/pages/inventory/components/InventoryTable.tsx
import { Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

import BaseTable from "@/components/common/BaseTable";
import Button from "@/components/common/button";
import type { Inventory } from "../types";

interface InventoryTableProps {
    data: Inventory[];
    loading?: boolean;
    onEdit: (record: Inventory) => void;
}

export default function InventoryTable({
    data,
    loading = false,
    onEdit,
}: InventoryTableProps) {
    const columns: ColumnsType<Inventory> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
            align: "center",
        },
        {
            title: "Sản phẩm",
            dataIndex: "product_name",
            key: "product_name",
            width: 260,
            render: (name: string, record) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{name}</div>
                    <Tag color="blue">ID: {record.product_id}</Tag>
                </div>
            ),
        },
        {
            title: "Kho",
            dataIndex: "warehouse_name",
            key: "warehouse_name",
            width: 200,
            render: (name: string, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{name}</div>
                    <Tag color="green">ID: {record.warehouse_id}</Tag>
                </div>
            ),
        },
        {
            title: "Số lượng tồn",
            dataIndex: "quantity",
            key: "quantity",
            width: 160,
            sorter: (a, b) => a.quantity - b.quantity,
            render: (qty: number) => (
                <b style={{ fontSize: "16px", color: qty > 0 ? "#52c41a" : "#ff4d4f" }}>
                    {qty.toLocaleString()}
                </b>
            ),
            align: "center",
        },
        {
            title: "Trạng thái",
            key: "status",
            width: 140,
            render: (_, record) => (
                <Tag color={record.quantity > 0 ? "success" : "error"}>
                    {record.quantity > 0 ? "Còn hàng" : "Hết hàng"}
                </Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            width: 120,
            render: (_, record) => (
                <Button
                    size="small"
                    type="primary"
                    onClick={() => onEdit(record)}
                >
                    Cập nhật
                </Button>
            ),
        },
    ];

    return (
        <BaseTable<Inventory>
            columns={columns}
            data={data}
            loading={loading}
            rowKey="id"
            scroll={{ x: 900 }}
        />
    );
}