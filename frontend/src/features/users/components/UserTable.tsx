import { Space, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

import BaseTable from "@/components/common/BaseTable";
import Button from "@/components/common/button";

import type { User } from "../types";


interface Props {
    data: User[];
    onEdit: (user: User) => void;
    onDelete: (id: number) => void;
    onToggle: (id: number) => void;
}


export default function UserTable({
    data,
    onEdit,
    onDelete,
    onToggle,
}: Props) {

    const columns: ColumnsType<User> = [
        {
            title: "ID",
            dataIndex: "id",
            width: 70,
        },

        {
            title: "Họ tên",
            dataIndex: "name",
        },

        {
            title: "Email",
            dataIndex: "email",
        },

        {
            title: "Vai trò",
            dataIndex: "role_name",
            render: (_: string, record) => record.role_name || `Role #${record.role_id || "-"}`,
        },

        {
            title: "Trạng thái",
            dataIndex: "status",

            render: (status: string) => (
                <Tag color={status === "ACTIVE" ? "green" : "red"}>
                    {status === "ACTIVE"
                        ? "Hoạt động"
                        : "Khóa"}
                </Tag>
            ),
        },

        {
            title: "Ngày tạo",
            dataIndex: "created_at",

            render: (date: string) =>
                new Date(date).toLocaleString("vi-VN"),
        },

        {
            title: "Thao tác",

            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        type="primary"
                        onClick={() => onEdit(record)}
                    >
                        Sửa
                    </Button>

                    <Button
                        size="small"
                        onClick={() => onToggle(record.id)}
                    >
                        {record.status === "ACTIVE" ? "Khóa" : "Mở"}
                    </Button>

                    <Button
                        danger
                        size="small"
                        onClick={() => onDelete(record.id)}
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <BaseTable<User>
            columns={columns}
            data={data}
            rowKey="id"
            pagination={false}
        />
    );
}
