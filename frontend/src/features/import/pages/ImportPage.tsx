import { useState } from "react";
import {
  Form,
  InputNumber,
  Button as AntButton,
  Space,
  message,
  Card,
} from "antd";
//import type { FormInstance } from "antd";

import Button from "@/components/common/button";
import { useImport } from "../hooks";
import type { ImportItem, ImportInput } from "../types";

interface FormValues {
  supplier_id: number;
  warehouse_id: number;
}

export default function ImportPage() {
  const [form] = Form.useForm<FormValues>();
  const mutation = useImport();

  const [items, setItems] = useState<ImportItem[]>([
    { product_id: 0, quantity: 0, unit_cost: 0 },
  ]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { product_id: 0, quantity: 0, unit_cost: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = <K extends keyof ImportItem>(
    index: number,
    key: K,
    value: ImportItem[K]
  ) => {
    setItems((prev) => {
      const clone = [...prev];
      clone[index] = { ...clone[index], [key]: value };
      return clone;
    });
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();

    const payload: ImportInput = {
      supplier_id: values.supplier_id,
      warehouse_id: values.warehouse_id,
      items,
    };

    mutation.mutate(payload, {
      onSuccess: () => {
        message.success("Nhập hàng thành công");
        form.resetFields();
        setItems([{ product_id: 0, quantity: 0, unit_cost: 0 }]);
      },
    });
  };

  return (
    <div>
      <h2>Nhập hàng</h2>

      <Card style={{ marginBottom: 16 }}>
        <Form form={form} layout="vertical">
          <Form.Item
            name="supplier_id"
            label="Supplier ID"
            rules={[{ required: true, message: "Nhập supplier_id" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="warehouse_id"
            label="Warehouse ID"
            rules={[{ required: true, message: "Nhập warehouse_id" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Card>
      <Card title="Danh sách sản phẩm">
        {items.map((item, index) => (
          <Space key={index} style={{ marginBottom: 8 }}>
            <InputNumber
              placeholder="Product ID"
              value={item.product_id}
              onChange={(v) =>
                updateItem(index, "product_id", Number(v ?? 0))
              }
            />

            <InputNumber
              placeholder="Quantity"
              value={item.quantity}
              onChange={(v) =>
                updateItem(index, "quantity", Number(v ?? 0))
              }
            />

            <InputNumber
              placeholder="Unit Cost"
              value={item.unit_cost}
              onChange={(v) =>
                updateItem(index, "unit_cost", Number(v ?? 0))
              }
            />

            <AntButton danger onClick={() => removeItem(index)}>
              Xóa
            </AntButton>
          </Space>
        ))}

        <Button onClick={addItem}>+ Thêm sản phẩm</Button>
      </Card>

      <div style={{ marginTop: 16 }}>
        <Button type="primary" onClick={handleSubmit}>
          Submit Import
        </Button>
      </div>
    </div>
  );
}