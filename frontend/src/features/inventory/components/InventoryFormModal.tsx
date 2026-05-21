// src/pages/inventory/components/InventoryFormModal.tsx
import { Modal, Form, InputNumber } from "antd";
import type { ModalProps } from "antd";
import type { FC } from "react";

import type { Inventory } from "../types";

interface InventoryUpdateInput {
    quantity: number;
    reserved_quantity?: number;
    oncoming_quantity?: number;
    min_threshold?: number;
}

interface InventoryFormModalProps extends Omit<ModalProps, "onOk"> {
    open: boolean;
    editing: Inventory | null;
    onCancel: () => void;
    onSubmit: (values: InventoryUpdateInput) => void;
    loading?: boolean;
}

const InventoryFormModal: FC<InventoryFormModalProps> = ({
    open,
    editing,
    onCancel,
    onSubmit,
    loading = false,
    ...modalProps
}) => {
    const [form] = Form.useForm<InventoryUpdateInput>();

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values);
        } catch (error) {
            console.log("Validate Failed:", error);
        }
    };

    const handleAfterOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            form.resetFields();
            return;
        }
        if (editing) {
            form.setFieldsValue({
                quantity: editing.quantity,
                reserved_quantity: editing.reserved_quantity,
                oncoming_quantity: editing.oncoming_quantity,
                min_threshold: editing.min_threshold,
            });
        }
    };

    return (
        <Modal
            title="Cập nhật tồn kho"
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            width={500}
            destroyOnClose
            afterOpenChange={handleAfterOpenChange}
            okText="Cập nhật"
            cancelText="Hủy"
            {...modalProps}
        >
            <Form
                form={form}
                layout="vertical"
                style={{ marginTop: 12 }}
            >
                <Form.Item
                    name="quantity"
                    label="Số lượng tồn kho"
                    rules={[
                        { required: true, message: "Vui lòng nhập số lượng tồn kho" },
                        { type: "number", min: 0, message: "Số lượng không được âm" }
                    ]}
                >
                    <InputNumber
                        style={{ width: "100%" }}
                        min={0}
                        placeholder="Nhập số lượng"
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    name="reserved_quantity"
                    label="So luong da giu"
                    rules={[
                        { type: "number", min: 0, message: "So luong khong duoc am" }
                    ]}
                >
                    <InputNumber
                        style={{ width: "100%" }}
                        min={0}
                        placeholder="Nhap so luong da giu"
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    name="oncoming_quantity"
                    label="So luong sap ve"
                    rules={[
                        { type: "number", min: 0, message: "So luong khong duoc am" }
                    ]}
                >
                    <InputNumber
                        style={{ width: "100%" }}
                        min={0}
                        placeholder="Nhap so luong sap ve"
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    name="min_threshold"
                    label="Nguong ton toi thieu"
                    rules={[
                        { type: "number", min: 0, message: "Nguong khong duoc am" }
                    ]}
                >
                    <InputNumber
                        style={{ width: "100%" }}
                        min={0}
                        placeholder="Nhap nguong toi thieu"
                        size="large"
                    />
                </Form.Item>

                {editing && (
                    <div style={{ marginTop: 16, fontSize: "13px", color: "#666" }}>
                        Đang chỉnh sửa cho:
                        <br />
                        Product ID: <strong>{editing.product_id}</strong> —
                        Warehouse ID: <strong>{editing.warehouse_id}</strong>
                    </div>
                )}
            </Form>
        </Modal>
    );
};

export default InventoryFormModal;
