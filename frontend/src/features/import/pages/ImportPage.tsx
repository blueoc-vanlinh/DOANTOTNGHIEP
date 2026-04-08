// src/pages/import/ImportPage.tsx
import { useState } from "react";
import { Form, InputNumber, Card, message } from "antd";

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
    if (items.length === 1) {
      message.warning("Phải có ít nhất 1 sản phẩm");
      return;
    }
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
    try {
      const values = await form.validateFields();

      const payload: ImportInput = {
        supplier_id: values.supplier_id,
        warehouse_id: values.warehouse_id,
        items: items.filter(item => item.product_id !== 0 && item.quantity > 0),
      };

      mutation.mutate(payload, {
        onSuccess: () => {
          message.success("Nhập hàng thành công!");
          form.resetFields();
          setItems([{ product_id: 0, quantity: 0, unit_cost: 0 }]);
        },
      });
    } catch (error) {
      console.error("Validate failed:", error);
    }
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 600 }}>
          Nhập kho
        </h2>
      </div>

      <Card
        title="Thông tin chung"
        style={{ marginBottom: 24 }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="supplier_id"
            label="Nhà cung cấp (Supplier ID)"
            rules={[{ required: true, message: "Vui lòng nhập Supplier ID" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Nhập ID nhà cung cấp"
              min={1}
            />
          </Form.Item>

          <Form.Item
            name="warehouse_id"
            label="Kho hàng (Warehouse ID)"
            rules={[{ required: true, message: "Vui lòng nhập Warehouse ID" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Nhập ID kho hàng"
              min={1}
            />
          </Form.Item>
        </Form>
      </Card>

      <Card
        title="Danh sách sản phẩm nhập kho"
        style={{ marginBottom: 24 }}
        extra={
          <Button type="primary" onClick={addItem}>
            + Thêm sản phẩm
          </Button>
        }
      >
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 16,
              padding: 16,
              border: "1px solid #f0f0f0",
              borderRadius: "8px",
              background: "#fafafa",
            }}
          >
            <Form.Item label="Mã sản phẩm" style={{ flex: 1, marginBottom: 0 }}>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Product ID"
                value={item.product_id}
                onChange={(v) => updateItem(index, "product_id", Number(v ?? 0))}
                min={1}
              />
            </Form.Item>

            <Form.Item label="Số lượng" style={{ flex: 1, marginBottom: 0 }}>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Số lượng"
                value={item.quantity}
                onChange={(v) => updateItem(index, "quantity", Number(v ?? 0))}
                min={1}
              />
            </Form.Item>

            <Form.Item label="Đơn giá" style={{ flex: 1, marginBottom: 0 }}>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Đơn giá"
                value={item.unit_cost}
                onChange={(v) => updateItem(index, "unit_cost", Number(v ?? 0))}
                min={0}
              />
            </Form.Item>

            <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 4 }}>
              <Button
                danger
                size="small"
                onClick={() => removeItem(index)}
              >
                Xóa
              </Button>
            </div>
          </div>
        ))}
      </Card>

      <div style={{ textAlign: "right" }}>
        <Button
          type="primary"
          size="large"
          onClick={handleSubmit}
          loading={mutation.isPending}
          style={{ minWidth: 200 }}
        >
          Xác nhận nhập kho
        </Button>
      </div>
    </div>
  );
}