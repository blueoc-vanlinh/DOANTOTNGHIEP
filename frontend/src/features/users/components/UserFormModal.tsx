import { Modal, Form, Input, Select } from "antd";

import type {
    User,
    UserInput,
} from "../types";
import { useRoles } from "@/features/roles/hooks";


interface Props {
    open: boolean;
    editing: User | null;

    onCancel: () => void;

    onSubmit: (
        values: UserInput
    ) => void;

    loading?: boolean;
}


export default function UserFormModal({
    open,
    editing,
    onCancel,
    onSubmit,
    loading,
}: Props) {

    const [form] = Form.useForm();
    const { data: roles } = useRoles();

    return (
        <Modal
            open={open}
            title={
                editing
                    ? "Cập nhật tài khoản"
                    : "Thêm tài khoản"
            }

            onCancel={onCancel}

            onOk={() => form.submit()}

            confirmLoading={loading}
        >

            <Form
                form={form}
                layout="vertical"

                initialValues={editing || {}}

                onFinish={onSubmit}
            >

                <Form.Item
                    label="Họ tên"
                    name="name"

                    rules={[
                        {
                            required: true,
                            message: "Nhập họ tên",
                        },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"

                    rules={[
                        {
                            required: true,
                            type: "email",
                        },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Vai trò"
                    name="role_id"
                    rules={[
                        {
                            required: true,
                            message: "Chọn vai trò",
                        },
                    ]}
                >
                    <Select
                        placeholder="Chọn vai trò"
                        options={(roles || []).map((role) => ({
                            value: role.id,
                            label: role.name,
                        }))}
                    />
                </Form.Item>

                <Form.Item label="Trạng thái" name="status" initialValue="ACTIVE">
                    <Select
                        options={[
                            { value: "ACTIVE", label: "Hoạt động" },
                            { value: "INACTIVE", label: "Khóa" },
                        ]}
                    />
                </Form.Item>

                {!editing && (
                    <Form.Item
                        label="Mật khẩu"
                        name="password"

                        rules={[
                            {
                                required: true,
                                min: 6,
                            },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                )}

            </Form>
        </Modal>
    );
}
