// src/pages/products/components/ProductFormModal.tsx
import { Modal, Form, InputNumber, Select } from "antd";
import type { ModalProps } from "antd";
import type { FC } from "react";

import Input from "@/components/common/Input";
import type { Product } from "../types";
import type { ProductInput } from "../api";

interface ProductFormModalProps extends Omit<ModalProps, "onOk"> {
    open: boolean;
    editing: Product | null;
    onCancel: () => void;
    onSubmit: (values: ProductInput) => void;
    loading?: boolean;
}

const ProductFormModal: FC<ProductFormModalProps> = ({
    open,
    editing,
    onCancel,
    onSubmit,
    loading = false,
    ...modalProps
}) => {
    const [form] = Form.useForm<ProductInput>();

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values);
        } catch (error) {
            console.log("Validate Failed:", error);
        }
    };

    // Reset form khi mở modal tạo mới hoặc chỉnh sửa
    const handleAfterOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            if (editing) {
                form.setFieldsValue(editing);
            } else {
                form.resetFields();
            }
        }
    };

    return (
        <Modal
            title={editing ? "Cập nhật sản phẩm" : "Thêm mới sản phẩm"}
            open={open}
            onCancel={onCancel}
            onOk={handleOk}
            confirmLoading={loading}
            width={720}
            destroyOnClose
            afterOpenChange={handleAfterOpenChange}
            okText={editing ? "Cập nhật" : "Tạo mới"}
            cancelText="Hủy"
            {...modalProps}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
                <Form.Item
                    name="name"
                    label="Tên sản phẩm"
                    rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
                >
                    <Input placeholder="Nhập tên sản phẩm" />
                </Form.Item>

                <Form.Item
                    name="sku"
                    label="Mã SKU"
                    rules={[{ required: true, message: "Vui lòng nhập mã SKU" }]}
                >
                    <Input placeholder="Ví dụ: SP-00123" />
                </Form.Item>

                <Form.Item
                    name="barcode"
                    label="Barcode"
                >
                    <Input placeholder="Nhập mã vạch (nếu có)" />
                </Form.Item>

                <Form.Item
                    name="price"
                    label="Giá bán (VNĐ)"
                    rules={[{ required: true, message: "Vui lòng nhập giá bán" }]}
                >
                    <InputNumber
                        style={{ width: "100%" }}
                        min={0}
                        placeholder="0"
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    />
                </Form.Item>

                <Form.Item
                    name="status"
                    label="Trạng thái"
                    initialValue="ACTIVE"
                >
                    <Select
                        options={[
                            { label: "Đang bán", value: "ACTIVE" },
                            { label: "Ngừng bán", value: "INACTIVE" },
                        ]}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ProductFormModal;