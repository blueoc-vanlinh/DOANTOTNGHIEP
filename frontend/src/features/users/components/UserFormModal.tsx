import { Modal, Form, Input } from "antd";

import type {
    User,
    UserInput,
} from "../types";


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
                    name="full_name"

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
                    label="Số điện thoại"
                    name="phone"
                >
                    <Input />
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