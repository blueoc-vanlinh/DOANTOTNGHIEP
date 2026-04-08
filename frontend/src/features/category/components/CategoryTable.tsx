import { Space } from "antd";
import type { ColumnsType } from "antd/es/table";

import BaseTable from "@/components/common/BaseTable";
import Button from "@/components/common/button";
import type { Category } from "../types";

interface CategoryTableProps {
    data: Category[];
    loading?: boolean;
    onEdit: (record: Category) => void;
    onDelete: (id: number) => void;
}

export default function CategoryTable({
    data,
    loading = false,
    onEdit,
    onDelete,
}: CategoryTableProps) {
    const columns: ColumnsType<Category> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
            align: "center",
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: "Tên danh mục",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (name: string) => <strong>{name}</strong>,
            width: 280,
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            render: (desc?: string) =>
                desc ? (
                    desc
                ) : (
                    <span style={{ color: "#bfbfbf", fontStyle: "italic" }}>Không có mô tả</span>
                ),
        },
        {
            title: "Thao tác",
            key: "action",
            width: 180,
            fixed: "right" as const,
            render: (_, record: Category) => (
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
        <BaseTable<Category>
            columns={columns}
            data={data}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1000 }}
        />
    );
}