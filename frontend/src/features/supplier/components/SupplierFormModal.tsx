import { Modal, Form } from "antd";
import type { ModalProps } from "antd";
import type { FC } from "react";

import Input from "@/components/common/Input";
import type { Supplier } from "../types";

interface SupplierFormValues {
    name: string;
    phone?: string;
    email?: string;
}

interface SupplierFormModalProps extends Omit<ModalProps, "onOk"> {
    open: boolean;
    editing: Supplier | null;
    onCancel: () => void;
    onSubmit: (values: SupplierFormValues) => void;
    loading?: boolean;
}

const SupplierFormModal: FC<SupplierFormModalProps> = ({
    open,
    editing,
    onCancel,
    onSubmit,
    loading = false,
    ...modalProps
}) => {
    const [form] = Form.useForm<SupplierFormValues>();

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
            title={editing ? "Chỉnh sửa nhà cung cấp" : "Thêm nhà cung cấp mới"}
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
                    label="Tên nhà cung cấp"
                    rules={[{ required: true, message: "Vui lòng nhập tên nhà cung cấp" }]}
                >
                    <Input placeholder="Nhập tên nhà cung cấp" />
                </Form.Item>

                <Form.Item name="phone" label="Số điện thoại">
                    <Input placeholder="Ví dụ: 0912345678" />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ type: "email", message: "Email không hợp lệ" }]}
                >
                    <Input placeholder="example@company.com" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default SupplierFormModal;