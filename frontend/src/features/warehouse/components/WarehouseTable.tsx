import { Space } from "antd";
import type { ColumnsType } from "antd/es/table";

import BaseTable from "@/components/common/BaseTable";
import Button from "@/components/common/button";
import type { Warehouse } from "../types";

interface WarehouseTableProps {
    data: Warehouse[];
    loading?: boolean;
    onEdit: (record: Warehouse) => void;
    onDelete: (id: number) => void;
}

export default function WarehouseTable({
    data,
    loading = false,
    onEdit,
    onDelete,
}: WarehouseTableProps) {
    const columns: ColumnsType<Warehouse> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
            align: "center",
        },
        {
            title: "Tên kho",
            dataIndex: "name",
            key: "name",
            render: (name: string) => <strong>{name}</strong>,
            width: 250,
        },
        {
            title: "Vị trí",
            dataIndex: "location",
            key: "location",
            width: 220,
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            render: (desc?: string) =>
                desc ? desc : <span style={{ color: "#bfbfbf" }}>-</span>,
        },
        {
            title: "Thao tác",
            key: "action",
            width: 180,
            fixed: "right" as const,
            render: (_, record: Warehouse) => (
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
        <BaseTable<Warehouse>
            columns={columns}
            data={data}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1000 }}
        />
    );
}