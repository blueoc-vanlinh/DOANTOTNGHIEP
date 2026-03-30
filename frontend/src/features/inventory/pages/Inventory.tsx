import { useState } from "react";
import { Space, Modal, Form, message, InputNumber, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

import BaseTable from "@/components/common/BaseTable";
import Button from "@/components/common/button";
import LoadingPage from "@/components/common/LoadingPage";
import EmptyState from "@/components/common/EmptyState";

import { useInventory, useUpdateInventory } from "../hooks";
import type { Inventory } from "../types";

export default function InventoryPage() {
  const { data, isLoading } = useInventory();
  const updateMutation = useUpdateInventory();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Inventory | null>(null);
  const [form] = Form.useForm();

  const handleEdit = (record: Inventory) => {
    setEditing(record);
    form.setFieldsValue(record);
    setOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();

    if (editing) {
      updateMutation.mutate(
        { id: editing.id, data: values },
        {
          onSuccess: () => {
            message.success("Cập nhật tồn kho thành công");
            setOpen(false);
          },
        }
      );
    }
  };

  const columns: ColumnsType<Inventory> = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
    },
    {
      title: "Product ID",
      dataIndex: "product_id",
      render: (id) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: "Warehouse ID",
      dataIndex: "warehouse_id",
      render: (id) => <Tag color="green">{id}</Tag>,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: "Trạng thái",
      render: (_, record) =>
        record.quantity > 0 ? (
          <Tag color="success">Còn hàng</Tag>
        ) : (
          <Tag color="error">Hết hàng</Tag>
        ),
    },
    {
      title: "Thao tác",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  if (isLoading) return <LoadingPage />;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2>Quản lý tồn kho</h2>
      </div>

      {data && data.length > 0 ? (
        <BaseTable<Inventory> columns={columns} data={data} />
      ) : (
        <EmptyState description="Chưa có dữ liệu tồn kho" />
      )}

      <Modal
        title="Cập nhật tồn kho"
        open={open}
        onOk={handleSubmit}
        onCancel={() => setOpen(false)}
        confirmLoading={updateMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="quantity" label="Số lượng">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}