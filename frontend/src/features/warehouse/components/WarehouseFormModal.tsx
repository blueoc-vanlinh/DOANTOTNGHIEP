import { Modal, Form } from "antd";
import TextArea from "antd/es/input/TextArea";
import type { ModalProps } from "antd";
import type { FC } from "react";

import Input from "@/components/common/Input";
import type { Warehouse } from "../types";

interface WarehouseFormValues {
    name: string;
    location?: string;
    description?: string;
}

interface WarehouseFormModalProps extends Omit<ModalProps, "onOk"> {
    open: boolean;
    editing: Warehouse | null;
    onCancel: () => void;
    onSubmit: (values: WarehouseFormValues) => void;
    loading?: boolean;
}

const WarehouseFormModal: FC<WarehouseFormModalProps> = ({
    open,
    editing,
    onCancel,
    onSubmit,
    loading = false,
    ...modalProps
}) => {
    const [form] = Form.useForm<WarehouseFormValues>();

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values);
        } catch (error) {
            console.log("Validate Failed:", error);
        }
    };

    return (
        <Modal
            title={editing ? "Chỉnh sửa kho" : "Thêm kho mới"}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            width={620}
            destroyOnClose
            okText={editing ? "Cập nhật" : "Tạo mới"}
            cancelText="Hủy"
            {...modalProps}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
                <Form.Item
                    name="name"
                    label="Tên kho"
                    rules={[{ required: true, message: "Vui lòng nhập tên kho" }]}
                >
                    <Input placeholder="Ví dụ: Kho Hà Nội, Kho TP.HCM..." />
                </Form.Item>

                <Form.Item name="location" label="Vị trí">
                    <Input placeholder="Địa chỉ kho hàng..." />
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                    <TextArea
                        rows={4}
                        placeholder="Nhập mô tả về kho này..."
                        style={{ borderRadius: "8px" }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default WarehouseFormModal;