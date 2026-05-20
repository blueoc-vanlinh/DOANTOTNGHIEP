import { useState } from "react";
import { Card, Form, Input, message, Modal, Select, Space, Table, Tag, Typography } from "antd";

import Button from "@/components/common/button";
import ModalConfirm from "@/components/common/ModalConfirm";
import {
  useCreateRole,
  useDeleteRole,
  usePermissions,
  useRoles,
  useUpdateRole,
} from "../hooks";
import type { Role, RoleInput } from "../types";

const { Title, Text } = Typography;

const permissionLabels: Record<string, string> = {
  view_dashboard: "Xem tổng quan",
  manage_users: "Quản lý nhân viên",
  manage_products: "Quản lý sản phẩm",
  manage_inventory: "Quản lý tồn kho",
  create_orders: "Tạo phiếu nhập/xuất",
  view_reports: "Xem báo cáo",
  approve_imports: "Duyệt nhập kho",
  approve_exports: "Duyệt xuất kho",
  manage_suppliers: "Quản lý nhà cung cấp",
  view_audit_log: "Xem nhật ký kiểm toán",
};

export default function RolePage() {
  const [form] = Form.useForm<RoleInput>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const roles = useRoles();
  const permissions = usePermissions();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const handleOpen = (role?: Role) => {
    setEditing(role || null);
    form.setFieldsValue(
      role
        ? {
            name: role.name,
            permission_ids: role.permissions.map((permission) => permission.id),
          }
        : { name: "", permission_ids: [] }
    );
    setOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();

    if (editing) {
      updateRole.mutate(
        { id: editing.id, data: values },
        {
          onSuccess: () => {
            message.success("Đã cập nhật vai trò");
            setOpen(false);
          },
        }
      );
      return;
    }

    createRole.mutate(values, {
      onSuccess: () => {
        message.success("Đã thêm vai trò");
        setOpen(false);
      },
    });
  };

  const handleDelete = (role: Role) => {
    ModalConfirm({
      title: "Xóa vai trò",
      content: `Bạn có chắc chắn muốn xóa vai trò ${role.name}?`,
      onOk: () =>
        deleteRole.mutate(role.id, {
          onSuccess: () => message.success("Đã xóa vai trò"),
        }),
    });
  };

  return (
    <div>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Quản lý vai trò
          </Title>
          <Text type="secondary">Thiết lập role và quyền truy cập cho nhân viên</Text>
        </div>
        <Button type="primary" onClick={() => handleOpen()}>
          + Thêm vai trò
        </Button>
      </div>

      <Card>
        <Table<Role>
          rowKey="id"
          loading={roles.isLoading}
          dataSource={roles.data}
          columns={[
            { title: "ID", dataIndex: "id", width: 80 },
            { title: "Vai trò", dataIndex: "name" },
            {
              title: "Quyền",
              dataIndex: "permissions",
              render: (value: Role["permissions"]) => (
                <Space wrap>
                  {value.map((permission) => (
                    <Tag key={permission.id}>
                      {permissionLabels[permission.name] || permission.name.replaceAll("_", " ")}
                    </Tag>
                  ))}
                </Space>
              ),
            },
            {
              title: "Thao tác",
              width: 180,
              render: (_, record) => (
                <Space>
                  <Button size="small" onClick={() => handleOpen(record)}>
                    Sửa
                  </Button>
                  <Button
                    size="small"
                    danger
                    disabled={record.name === "Admin"}
                    onClick={() => handleDelete(record)}
                  >
                    Xóa
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={open}
        title={editing ? "Cập nhật vai trò" : "Thêm vai trò"}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        confirmLoading={createRole.isPending || updateRole.isPending}
        width={720}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên vai trò"
            name="name"
            rules={[{ required: true, message: "Nhập tên vai trò" }]}
          >
            <Input disabled={editing?.name === "Admin"} />
          </Form.Item>
          <Form.Item label="Quyền" name="permission_ids">
            <Select
              mode="multiple"
              placeholder="Chọn quyền"
              options={permissions.data.map((permission) => ({
                value: permission.id,
                label: permissionLabels[permission.name] || permission.name.replaceAll("_", " "),
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
