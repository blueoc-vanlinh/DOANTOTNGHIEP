import { useState } from "react";
import { Space, Modal, Form, message, InputNumber, Badge, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

import BaseTable from "@/components/common/BaseTable";
import Button from "@/components/common/button";
import Input from "@/components/common/Input";
import LoadingPage from "@/components/common/LoadingPage";
import EmptyState from "@/components/common/EmptyState";
import ModalConfirm from "@/components/common/ModalConfirm";

import {
    useProducts,
    useCreateProduct,
    useUpdateProduct,
    useDeleteProduct,
} from "../hooks";
import type { ProductInput } from "../api";
import type { Product } from "../types";

export default function Products() {
    const { data, isLoading } = useProducts();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [form] = Form.useForm<ProductInput>();

    const createMutation = useCreateProduct();
    const updateMutation = useUpdateProduct();
    const deleteMutation = useDeleteProduct();

    const handleCreate = () => {
        setEditing(null);
        form.resetFields();
        setOpen(true);
    };

    const handleEdit = (record: Product) => {
        setEditing(record);
        form.setFieldsValue(record);
        setOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (editing) {
                updateMutation.mutate(
                    { id: editing.id, data: values },
                    {
                        onSuccess: () => {
                            message.success("Cập nhật thành công");
                            setOpen(false);
                        },
                    }
                );
            } else {
                createMutation.mutate(values, {
                    onSuccess: () => {
                        message.success("Tạo mới thành công");
                        setOpen(false);
                        form.resetFields();
                    },
                });
            }
        } catch (info) {
            console.log("Validate Failed:", info);
        }
    };

    const confirmDelete = (id: number) => {
        ModalConfirm({
            title: "Xác nhận xóa",
            content: "Bạn có chắc chắn muốn xóa sản phẩm này không?",
            onOk: () =>
                deleteMutation.mutate(id, {
                    onSuccess: () => message.success("Đã xóa sản phẩm"),
                }),
        });
    };

    const columns: ColumnsType<Product> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 60,
            fixed: 'left'
        },
        {
            title: "Tên sản phẩm",
            dataIndex: "name",
            key: "name",
            fixed: 'left',
            sorter: (a, b) => a.name.localeCompare(b.name)
        },
        { title: "SKU", dataIndex: "sku", key: "sku" },
        { title: "Barcode", dataIndex: "barcode", key: "barcode" },
        {
            title: "Giá bán",
            dataIndex: "price",
            key: "price",
            render: (v: number) => <b>{v?.toLocaleString()} đ</b>
        },
        {
            title: "Phân loại",
            dataIndex: "category_id",
            key: "category_id",
            render: (id: number) => <Tag color="blue">ID: {id}</Tag>
        },
        {
            title: "Quy cách (DxRxC)",
            dataIndex: "dimensions",
            key: "dimensions",
            render: (dim?: { length: number; width: number; height: number }) =>
                dim ? `${dim.length} x ${dim.width} x ${dim.height} cm` : "-"
        },
        {
            title: "Cân nặng",
            dataIndex: "weight",
            key: "weight",
            render: (w?: number) => w ? `${w} kg` : "-"
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Badge
                    status={status === "ACTIVE" ? "success" : "error"}
                    text={status === "ACTIVE" ? "Đang bán" : "Ngừng bán"}
                />
            )
        },
        {
            title: "Thao tác",
            key: "action",
            fixed: 'right',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => handleEdit(record)}>Sửa</Button>
                    <Button size="small" danger onClick={() => confirmDelete(record.id)}>Xóa</Button>
                </Space>
            ),
        },
    ];
    if (isLoading) return <LoadingPage />;

    return (
        <div>
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
                <h2 style={{ margin: 0 }}>Quản lý Sản phẩm</h2>
                <Button type="primary" onClick={handleCreate}>+ Thêm sản phẩm</Button>
            </div>

            {data && data.length > 0 ? (
                <BaseTable<Product> columns={columns} data={data} rowKey="id" />
            ) : (
                <EmptyState description="Chưa có dữ liệu sản phẩm">
                    <Button type="primary" onClick={handleCreate}>Tạo sản phẩm ngay</Button>
                </EmptyState>
            )}

            <Modal
                title={editing ? "Cập nhật sản phẩm" : "Thêm mới sản phẩm"}
                open={open}
                onOk={handleSubmit}
                onCancel={() => setOpen(false)}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="sku" label="Mã SKU" rules={[{ required: true, message: "Vui lòng nhập SKU" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="price" label="Giá bán" rules={[{ required: true, message: "Vui lòng nhập giá" }]}>
                        <InputNumber style={{ width: "100%" }} min={0} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
