import { useState } from "react";
import {
  Form,
  InputNumber,
  Card,
  message,
  Input,
  Tag,
} from "antd";

import Button from "@/components/common/button";
import SearchCombobox from "@/components/common/SearchCombobox";

import { useExport } from "../hooks";
import type { ExportItem, ExportInput } from "../types";

import { useInventory } from "@/features/inventory/hooks";
import { useWarehouses } from "@/features/warehouse/hooks";

interface FormValues {
  customer_name: string;
}

export default function ExportPage() {
  const [form] = Form.useForm<FormValues>();

  const mutation = useExport();

  const [items, setItems] = useState<
    ExportItem[]
  >([
    {
      product_id: 0,
      warehouse_id: 0,
      quantity: 0,
      price: 0,
    },
  ]);

  // warehouses
  const { data: warehouseRes } =
    useWarehouses({
      page: 1,
      page_size: 100,
    });

  const warehouses =
    warehouseRes?.items || [];

  const updateItem = <
    K extends keyof ExportItem
  >(
    index: number,
    key: K,
    value: ExportItem[K]
  ) => {
    setItems((prev) => {
      const clone = [...prev];

      clone[index] = {
        ...clone[index],
        [key]: value,
      };

      return clone;
    });
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        product_id: 0,
        warehouse_id: 0,
        quantity: 0,
        price: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      message.warning(
        "Phải có ít nhất 1 sản phẩm"
      );

      return;
    }

    setItems((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async () => {
    try {
      const values =
        await form.validateFields();

      const payload: ExportInput = {
        customer_name:
          values.customer_name,

        items: items.filter(
          (i) =>
            i.product_id &&
            i.warehouse_id &&
            i.quantity > 0
        ),
      };

      mutation.mutate(payload, {
        onSuccess: (result) => {
          message.success(
            `Xuất kho thành công. Hóa đơn ${result.invoice.invoice_number} đã được tạo tự động`
          );

          form.resetFields();

          setItems([
            {
              product_id: 0,
              warehouse_id: 0,
              quantity: 0,
              price: 0,
            },
          ]);
        },
      });
    } catch (error) {
      console.error(error);
    }
  };
  const {
    data: inventoryRes,
  } = useInventory({
    page: 1,
    page_size: 200,
  });

  const allInventories =
    inventoryRes?.items || [];
  return (
    <div>
      {/* HEADER */}
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 600,
          }}
        >
          Xuất kho
        </h2>
      </div>

      {/* GENERAL */}
      <Card
        title="Thông tin chung"
        style={{ marginBottom: 24 }}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="customer_name"
            label="Khách hàng"
            rules={[
              {
                required: true,
                message:
                  "Vui lòng nhập khách hàng",
              },
            ]}
          >
            <Input placeholder="Nhập tên khách hàng" />
          </Form.Item>
        </Form>
      </Card>

      {/* ITEMS */}
      <Card
        title="Danh sách sản phẩm"
        extra={
          <Button
            type="primary"
            onClick={addItem}
          >
            + Thêm sản phẩm
          </Button>
        }
      >
        {items.map((item, index) => {
          const inventories = allInventories.filter(
            (p) =>
              p.warehouse_id === item.warehouse_id
          );

          const selectedProduct = inventories.find(
            (p) =>
              p.product_id === item.product_id
          );

          return (
            <div
              key={index}
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 16,
                padding: 16,
                border:
                  "1px solid #f0f0f0",
                borderRadius: 8,
                background: "#fafafa",
              }}
            >
              {/* warehouse */}
              <Form.Item
                label="Kho"
                style={{
                  flex: 1,
                  marginBottom: 0,
                }}
              >
                <SearchCombobox
                  value={
                    item.warehouse_id ||
                    undefined
                  }
                  onChange={(value) =>
                    updateItem(
                      index,
                      "warehouse_id",
                      Number(value)
                    )
                  }
                  placeholder="Chọn kho"
                  options={warehouses.map(
                    (w) => ({
                      value: w.id,

                      label: `${w.name} #${w.id}`,
                    })
                  )}
                />
              </Form.Item>

              <Form.Item
                label="Sản phẩm"
                style={{
                  flex: 2,
                  marginBottom: 0,
                }}
              >
                <SearchCombobox
                  value={
                    item.product_id || undefined
                  }
                  onChange={(value) =>
                    updateItem(
                      index,
                      "product_id",
                      Number(value)
                    )
                  }
                  placeholder="Tìm sản phẩm"
                  options={inventories.map((p) => ({
                    value: p.product_id,

                    label: `${p.product_name} #${p.product_id} • Tồn: ${p.quantity}`,

                    searchText: `${p.product_id} ${p.product_name}`,
                  }))}
                />

                {selectedProduct && (
                  <div
                    style={{
                      marginTop: 6,
                    }}
                  >
                    <Tag
                      color={
                        selectedProduct.quantity > 0
                          ? "green"
                          : "red"
                      }
                    >
                      Tồn kho:{" "}
                      {selectedProduct.quantity}
                    </Tag>
                  </div>
                )}
              </Form.Item>

              {/* quantity */}
              <Form.Item
                label="Số lượng"
                style={{
                  flex: 1,
                  marginBottom: 0,
                }}
              >
                <InputNumber
                  style={{
                    width: "100%",
                  }}
                  min={1}
                  value={
                    item.quantity
                  }
                  onChange={(v) =>
                    updateItem(
                      index,
                      "quantity",
                      Number(v || 0)
                    )
                  }
                />
              </Form.Item>

              {/* price */}
              <Form.Item
                label="Đơn giá"
                style={{
                  flex: 1,
                  marginBottom: 0,
                }}
              >
                <InputNumber
                  style={{
                    width: "100%",
                  }}
                  min={0}
                  value={item.price}
                  onChange={(v) =>
                    updateItem(
                      index,
                      "price",
                      Number(v || 0)
                    )
                  }
                />
              </Form.Item>

              {/* remove */}
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "flex-end",
                }}
              >
                <Button
                  danger
                  onClick={() =>
                    removeItem(index)
                  }
                >
                  Xóa
                </Button>
              </div>
            </div>
          );
        })}
      </Card>

      {/* submit */}
      <div
        style={{
          textAlign: "right",
          marginTop: 24,
        }}
      >
        <Button
          type="primary"
          size="large"
          loading={
            mutation.isPending
          }
          onClick={handleSubmit}
        >
          Xác nhận xuất kho
        </Button>
      </div>
    </div>
  );
}
