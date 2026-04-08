// src/pages/export/ExportPage.tsx
import { useState } from "react";
import { Form, InputNumber, Card, message, Input } from "antd";

import Button from "@/components/common/button";
import { useExport } from "../hooks";
import type { ExportItem, ExportInput } from "../types";

interface FormValues {
  customer_name: string;
  warehouse_id: number;
}

export default function ExportPage() {
  const [form] = Form.useForm<FormValues>();
  const mutation = useExport();

  const [items, setItems] = useState<ExportItem[]>([
    { product_id: 0, quantity: 0, price: 0 },
  ]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { product_id: 0, quantity: 0, price: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      message.warning("Phải có ít nhất 1 sản phẩm");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = <K extends keyof ExportItem>(
    index: number,
    key: K,
    value: ExportItem[K]
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

      const payload: ExportInput = {
        customer_name: values.customer_name,
        warehouse_id: values.warehouse_id,
        items: items.filter(item => item.product_id !== 0 && item.quantity > 0),
      };

      mutation.mutate(payload, {
        onSuccess: () => {
          message.success("Xuất kho thành công!");
          form.resetFields();
          setItems([{ product_id: 0, quantity: 0, price: 0 }]);
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
          Xuất kho
        </h2>
      </div>

      {/* Thông tin chung */}
      <Card
        title="Thông tin chung"
        style={{ marginBottom: 24 }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="customer_name"
            label="Tên khách hàng / Người nhận"
            rules={[{ required: true, message: "Vui lòng nhập tên khách hàng" }]}
          >
            <Input placeholder="Nhập tên khách hàng hoặc người nhận hàng" />
          </Form.Item>

          <Form.Item
            name="warehouse_id"
            label="Kho hàng xuất (Warehouse ID)"
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

      {/* Danh sách sản phẩm */}
      <Card
        title="Danh sách sản phẩm xuất kho"
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
            <Form.Item
              label="Mã sản phẩm"
              style={{ flex: 1, marginBottom: 0 }}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Product ID"
                value={item.product_id}
                onChange={(v) => updateItem(index, "product_id", Number(v ?? 0))}
                min={1}
              />
            </Form.Item>

            <Form.Item
              label="Số lượng"
              style={{ flex: 1, marginBottom: 0 }}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Số lượng"
                value={item.quantity}
                onChange={(v) => updateItem(index, "quantity", Number(v ?? 0))}
                min={1}
              />
            </Form.Item>

            <Form.Item
              label="Đơn giá"
              style={{ flex: 1, marginBottom: 0 }}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Đơn giá"
                value={item.price}
                onChange={(v) => updateItem(index, "price", Number(v ?? 0))}
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

      {/* Nút Submit */}
      <div style={{ textAlign: "right" }}>
        <Button
          type="primary"
          size="large"
          onClick={handleSubmit}
          loading={mutation.isPending}
          style={{ minWidth: 200 }}
        >
          Xác nhận xuất kho
        </Button>
      </div>
    </div>
  );
}