import { Modal, Form } from "antd";
import TextArea from "antd/es/input/TextArea";
import type { ModalProps } from "antd";
import type { FC } from "react";

import Input from "@/components/common/Input";
import type { Category } from "../types";

interface CategoryFormValues {
    name: string;
    description?: string;
}

interface CategoryFormModalProps extends Omit<ModalProps, "onOk"> {
    open: boolean;
    editing: Category | null;
    onCancel: () => void;
    onSubmit: (values: CategoryFormValues) => void;
    loading?: boolean;
}

const CategoryFormModal: FC<CategoryFormModalProps> = ({
    open,
    editing,
    onCancel,
    onSubmit,
    loading = false,
    ...modalProps
}) => {
    const [form] = Form.useForm<CategoryFormValues>();

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
            title={editing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
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
                    label="Tên danh mục"
                    rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
                >
                    <Input placeholder="Ví dụ: Điện thoại, Laptop, Phụ kiện..." />
                </Form.Item>

                <Form.Item name="description" label="Mô tả chi tiết">
                    <TextArea
                        rows={5}
                        placeholder="Nhập mô tả cho danh mục này (không bắt buộc)..."
                        style={{ borderRadius: "8px" }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CategoryFormModal;