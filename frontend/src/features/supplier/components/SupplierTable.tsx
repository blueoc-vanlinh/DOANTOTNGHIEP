import { Space } from "antd";
import type { ColumnsType } from "antd/es/table";

import BaseTable from "@/components/common/BaseTable";
import Button from "@/components/common/button";
import type { Supplier } from "../types";

interface SupplierTableProps {
    data: Supplier[];
    loading?: boolean;
    onEdit: (record: Supplier) => void;
    onDelete: (id: number) => void;
}

export default function SupplierTable({
    data,
    loading = false,
    onEdit,
    onDelete,
}: SupplierTableProps) {
    const columns: ColumnsType<Supplier> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
            align: "center",
        },
        {
            title: "Tên nhà cung cấp",
            dataIndex: "name",
            key: "name",
            render: (name: string) => <strong>{name}</strong>,
            width: 280,
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
            width: 160,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: 260,
        },
        {
            title: "Thao tác",
            key: "action",
            width: 180,
            fixed: "right" as const,
            render: (_, record: Supplier) => (
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
        <BaseTable<Supplier>
            columns={columns}
            data={data}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1000 }}
        />
    );
}