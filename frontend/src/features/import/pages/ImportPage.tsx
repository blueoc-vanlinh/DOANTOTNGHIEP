import { useState } from "react";

import {
  Form,
  InputNumber,
  Card,
  message,
  notification,
  Space,
  Table,
  Tag,
  Select,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import Button from "@/components/common/button";
import PageHero from "@/components/common/PageHero";

import SearchCombobox from "@/components/common/SearchCombobox";

import { useImport } from "../hooks";
import {
  useApproveImportOrder,
  useCancelImportOrder,
  useImportOrders,
  useReceiveImportOrder,
} from "../hooks";

import type {
  ImportItem,
  ImportInput,
  ImportOrder,
} from "../types";

import { useProducts } from "@/features/products/hooks";

import { useWarehouses } from "@/features/warehouse/hooks";

import { useSuppliers } from "@/features/supplier/hooks";
import { getForecast } from "@/features/forecast/api";

interface FormValues {
  supplier_id: number;
  import_type: string;
}

const importTypeOptions = [
  { value: "PURCHASE", label: "Nhập mua hàng" },
  { value: "RETURN_FROM_CUSTOMER", label: "Nhập hàng khách trả" },
  { value: "TRANSFER_IN", label: "Nhập điều chuyển kho" },
  { value: "PRODUCTION_FINISHED", label: "Nhập thành phẩm sản xuất" },
  { value: "ADJUSTMENT_IN", label: "Nhập điều chỉnh tăng" },
];

const importTypeLabel = Object.fromEntries(
  importTypeOptions.map((item) => [item.value, item.label])
);

export default function ImportPage() {
  const [form] =
    Form.useForm<FormValues>();

  const mutation = useImport();
  const approveMutation = useApproveImportOrder();
  const receiveMutation = useReceiveImportOrder();
  const cancelMutation = useCancelImportOrder();
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

  const { data: importOrdersRes, isLoading: importOrdersLoading } =
    useImportOrders({
      page: 1,
      page_size: 10,
    });

  const importOrders = importOrdersRes?.items || [];

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
    async (autoComplete = true) => {
      try {
        const values =
          await form.validateFields();

        const payload: ImportInput =
        {
          supplier_id:
            values.supplier_id,
          import_type:
            values.import_type,
          auto_complete: autoComplete,

          items: items.filter(
            (item) =>
              item.product_id !== 0 &&
              item.warehouse_id !==
              0 &&
              item.quantity > 0
          ),
        };

        mutation.mutate(payload, {
          onSuccess: (result) => {
            message.success(
              autoComplete
                ? `Nhập kho thành công. Phiếu ${result.order?.order_code || result.order?.id} đã cập nhật tồn kho.`
                : `Đã tạo phiếu nhập ${result.order?.order_code || result.order?.id} chờ duyệt/nhận hàng.`
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

  const handleApprove = (id: number) => {
    approveMutation.mutate(id, {
      onSuccess: () => message.success("Đã duyệt phiếu nhập"),
    });
  };

  const handleReceive = (id: number) => {
    receiveMutation.mutate(id, {
      onSuccess: () => message.success("Đã nhận hàng và cập nhật tồn kho"),
    });
  };

  const handleCancel = (id: number) => {
    cancelMutation.mutate(id, {
      onSuccess: () => message.success("Đã hủy phiếu nhập"),
    });
  };

  const statusColor: Record<string, string> = {
    PENDING: "gold",
    APPROVED: "blue",
    COMPLETED: "green",
    CANCELLED: "red",
  };

  const importColumns: ColumnsType<ImportOrder> = [
    {
      title: "Mã phiếu",
      dataIndex: "order_code",
      key: "order_code",
      render: (value, record) => value || `#${record.id}`,
    },
    {
      title: "Loại phiếu",
      dataIndex: "import_type",
      key: "import_type",
      render: (value: string) => importTypeLabel[value] || value,
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplier_name",
      key: "supplier_name",
      render: (value, record) => value || `#${record.supplier_id}`,
    },
    {
      title: "Tổng tiền",
      dataIndex: "grand_total",
      key: "grand_total",
      align: "right",
      render: (value: number) => value.toLocaleString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (value: string) => <Tag color={statusColor[value]}>{value}</Tag>,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          {record.status === "PENDING" && (
            <Button size="small" onClick={() => handleApprove(record.id)}>
              Duyệt
            </Button>
          )}
          {(record.status === "PENDING" || record.status === "APPROVED") && (
            <Button size="small" type="primary" onClick={() => handleReceive(record.id)}>
              Nhận hàng
            </Button>
          )}
          {record.status !== "CANCELLED" && (
            <Button size="small" danger onClick={() => handleCancel(record.id)}>
              Hủy
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHero
        eyebrow="Inbound workflow"
        title="Phiếu nhập kho"
        description="Lập phiếu nhập theo loại nghiệp vụ, dùng AI gợi ý số lượng và xử lý duyệt/nhận/hủy phiếu."
      />

      {/* info */}
      <Card
        title="Thông tin chung"
        className="workflow-card"
        style={{
          marginBottom: 24,
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ import_type: "PURCHASE" }}
        >
          <Form.Item
            name="import_type"
            label="Loại phiếu nhập"
            rules={[
              {
                required: true,
                message:
                  "Vui lòng chọn loại phiếu nhập",
              },
            ]}
          >
            <Select
              options={importTypeOptions}
              placeholder="Chọn loại phiếu nhập"
            />
          </Form.Item>

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
        className="workflow-card"
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
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
        }}
      >
        <Button
          size="large"
          onClick={() => handleSubmit(false)}
          loading={
            mutation.isPending
          }
          style={{
            minWidth: 200,
          }}
        >
          Lưu phiếu chờ duyệt
        </Button>
        <Button
          type="primary"
          size="large"
          onClick={() => handleSubmit(true)}
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

      <Card
        title="Quản lý phiếu nhập gần đây"
        className="workflow-card"
        style={{
          marginTop: 24,
        }}
      >
        <Table<ImportOrder>
          rowKey="id"
          dataSource={importOrders}
          columns={importColumns}
          loading={
            importOrdersLoading ||
            approveMutation.isPending ||
            receiveMutation.isPending ||
            cancelMutation.isPending
          }
          pagination={false}
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
}
