// src/pages/products/components/ProductTable.tsx
import { Space, Badge, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

import BaseTable from "@/components/common/BaseTable";
import Button from "@/components/common/button";
import type { Product } from "../types";

interface ProductTableProps {
    data: Product[];
    loading?: boolean;
    onEdit: (record: Product) => void;
    onDelete: (id: number) => void;
}

export default function ProductTable({
    data,
    loading = false,
    onEdit,
    onDelete,
}: ProductTableProps) {
    const columns: ColumnsType<Product> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
            fixed: "left" as const,
            align: "center",
        },
        {
            title: "Tên sản phẩm",
            dataIndex: "name",
            key: "name",
            fixed: "left" as const,
            width: 320,
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text: string) => <div style={{ fontWeight: 500 }}>{text}</div>,
        },
        {
            title: "SKU",
            dataIndex: "sku",
            key: "sku",
            width: 150,
        },
        {
            title: "Barcode",
            dataIndex: "barcode",
            key: "barcode",
            width: 150,
        },
        {
            title: "Giá bán",
            dataIndex: "price",
            key: "price",
            width: 160,
            align: "right",
            render: (value: number) => (
                <b style={{ color: "#1677ff", fontSize: "15px" }}>
                    {value?.toLocaleString("vi-VN")} ₫
                </b>
            ),
        },
        {
            title: "Phân loại",
            dataIndex: "category",
            key: "category",
            width: 150,
            render: (category?: Product["category"]) =>
                category ? (
                    <Tag color="blue">{category.name}</Tag>
                ) : (
                    "-"
                ),
        },

        {
            title: "Quy cách (D × R × C)",
            dataIndex: "dimensions",
            key: "dimensions",
            width: 200,
            render: (dim?: { width?: number; height?: number; depth?: number }) => {
                if (!dim) return "-";

                const { width, height, depth } = dim;

                if (!width || !height || !depth) return "-";

                return `${depth} × ${width} × ${height} cm`;
            },
        },
        {
            title: "Cân nặng",
            dataIndex: "weight",
            key: "weight",
            width: 120,
            render: (weight?: number) => (weight ? `${weight} kg` : "-"),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 140,
            render: (status: string) => (
                <Badge
                    status={status === "ACTIVE" ? "success" : "error"}
                    text={status === "ACTIVE" ? "Đang bán" : "Ngừng bán"}
                />
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            fixed: "right" as const,
            width: 180,
            render: (_, record: Product) => (
                <Space size="middle">
                    <Button
                        size="small"
                        type="primary"
                        onClick={() => onEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Button
                        size="small"
                        danger
                        onClick={() => onDelete(record.id)}
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <BaseTable<Product>
            columns={columns}
            data={data}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1600 }}
            bordered
            pagination={false}
        />
    );
}