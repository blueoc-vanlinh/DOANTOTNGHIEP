import { useState } from "react";

import {
  Form,
  InputNumber,
  Card,
  message,
  notification,
} from "antd";

import Button from "@/components/common/button";

import SearchCombobox from "@/components/common/SearchCombobox";

import { useImport } from "../hooks";

import type {
  ImportItem,
  ImportInput,
} from "../types";

import { useProducts } from "@/features/products/hooks";

import { useWarehouses } from "@/features/warehouse/hooks";

import { useSuppliers } from "@/features/supplier/hooks";
import { getForecast } from "@/features/forecast/api";

interface FormValues {
  supplier_id: number;
}

export default function ImportPage() {
  const [form] =
    Form.useForm<FormValues>();

  const mutation = useImport();
  const [supplierSearch, setSupplierSearch] = useState("");
  const [warehouseSearch, setWarehouseSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const [items, setItems] =
    useState<ImportItem[]>([
      {
        product_id: 0,
        warehouse_id: 0,
        quantity: 0,
        unit_cost: 0,
      },
    ]);

  // suppliers
  const { data: supplierRes } =
    useSuppliers({
      page: 1,
      page_size: 100,
      search: supplierSearch,
    });

  const suppliers =
    supplierRes?.items || [];

  // warehouses
  const { data: warehouseRes } =
    useWarehouses({
      page: 1,
      page_size: 100,
      search: warehouseSearch,
    });

  const warehouses =
    warehouseRes?.items || [];

  // products
  const { data: productsRes } =
    useProducts({
      page: 1,
      pageSize: 200,
      search: productSearch,
    });

  const products =
    productsRes?.items || [];

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        product_id: 0,
        warehouse_id: 0,
        quantity: 0,
        unit_cost: 0,
      },
    ]);
    notification.success({
      message:
        "Thêm sản phẩm thành công",

      description:
        "Bạn có thể tiếp tục thêm sản phẩm khác.",
    });
  };
  const removeItem = (
    index: number
  ) => {
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

  const updateItem = <
    K extends keyof ImportItem
  >(
    index: number,
    key: K,
    value: ImportItem[K]
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

  const handleProductChange = async (
    index: number,
    value?: number
  ) => {
    if (!value) {
      setItems((prev) => {
        const clone = [...prev];
        clone[index] = {
          ...clone[index],
          product_id: 0,
          quantity: 0,
          unit_cost: 0,
        };
        return clone;
      });
      return;
    }

    const selectedProduct = products.find(
      (product) => product.id === value
    );

    setItems((prev) => {
      const clone = [...prev];
      clone[index] = {
        ...clone[index],
        product_id: value,
        unit_cost: Number(selectedProduct?.price || clone[index].unit_cost || 0),
      };
      return clone;
    });

    try {
      const forecast = await getForecast(value);
      const suggestedQuantity = Math.ceil(
        Number(forecast.recommended_import || 0)
      );

      if (suggestedQuantity > 0) {
        updateItem(
          index,
          "quantity",
          suggestedQuantity
        );
      }
    } catch {
      message.info(
        "Chưa có dự báo AI cho sản phẩm này, bạn có thể nhập số lượng thủ công."
      );
    }
  };

  const handleSubmit =
    async () => {
      try {
        const values =
          await form.validateFields();

        const payload: ImportInput =
        {
          supplier_id:
            values.supplier_id,

          items: items.filter(
            (item) =>
              item.product_id !== 0 &&
              item.warehouse_id !==
              0 &&
              item.quantity > 0
          ),
        };

        mutation.mutate(payload, {
          onSuccess: () => {
            message.success(
              "Nhập hàng thành công!"
            );

            form.resetFields();

            setItems([
              {
                product_id: 0,
                warehouse_id: 0,
                quantity: 0,
                unit_cost: 0,
              },
            ]);
          },
        });
      } catch (error) {
        console.error(
          "Validate failed:",
          error
        );
      }
    };

  return (
    <div>
      {/* header */}
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
            fontSize: "24px",
            fontWeight: 600,
          }}
        >
          Nhập kho
        </h2>
      </div>

      {/* info */}
      <Card
        title="Thông tin chung"
        style={{
          marginBottom: 24,
        }}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="supplier_id"
            label="Nhà cung cấp"
            rules={[
              {
                required: true,
                message:
                  "Vui lòng chọn nhà cung cấp",
              },
            ]}
          >
            <SearchCombobox
              placeholder="Chọn nhà cung cấp"
              onSearch={(value) =>
                setSupplierSearch(value)
              }
              options={suppliers.map(
                (s) => ({
                  value: s.id,

                  label: `${s.name} #${s.id}`,
                  searchText: `${s.name} ${s.email || ""} ${s.phone || ""} #${s.id}`,
                })
              )}
            />
          </Form.Item>
        </Form>
      </Card>

      {/* items */}
      <Card
        title="Danh sách sản phẩm nhập kho"
        style={{
          marginBottom: 24,
        }}
        extra={
          <Button
            type="primary"
            onClick={addItem}
          >
            + Thêm sản phẩm
          </Button>
        }
      >
        {items.map(
          (item, index) => (
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
                background:
                  "#fafafa",
              }}
            >
              {/* product */}
              <Form.Item
                label="Sản phẩm"
                style={{
                  flex: 2,
                  marginBottom: 0,
                }}
              >
                <SearchCombobox
                  value={
                    item.product_id ||
                    undefined
                  }
                  onSearch={(value) =>
                    setProductSearch(value)
                  }
                  onChange={(
                    value
                  ) =>
                    handleProductChange(
                      index,
                      Number(value)
                    )
                  }
                  placeholder="Tìm sản phẩm"
                  options={products.map(
                    (p) => ({
                      value: p.id,

                      label: `${p.name} #${p.id}`,
                      searchText: `${p.name} ${p.sku || ""} ${p.barcode || ""} #${p.id}`,
                    })
                  )}
                />
              </Form.Item>

              {/* warehouse */}
              <Form.Item
                label="Kho"
                style={{
                  flex: 2,
                  marginBottom: 0,
                }}
              >
                <SearchCombobox
                  value={
                    item.warehouse_id ||
                    undefined
                  }
                  onSearch={(value) =>
                    setWarehouseSearch(value)
                  }
                  onChange={(
                    value
                  ) =>
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
                      searchText: `${w.name} ${w.location || ""} #${w.id}`,
                    })
                  )}
                />
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

              {/* unit cost */}
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
                  value={
                    item.unit_cost
                  }
                  onChange={(v) =>
                    updateItem(
                      index,
                      "unit_cost",
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
          )
        )}
      </Card>

      {/* submit */}
      <div
        style={{
          textAlign: "right",
        }}
      >
        <Button
          type="primary"
          size="large"
          onClick={handleSubmit}
          loading={
            mutation.isPending
          }
          style={{
            minWidth: 200,
          }}
        >
          Xác nhận nhập kho
        </Button>
      </div>
    </div>
  );
}
