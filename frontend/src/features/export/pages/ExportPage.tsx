import { useState } from "react";
import {
  Form,
  InputNumber,
  Card,
  message,
  Input,
  Tag,
  Space,
  Table,
  Select,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import Button from "@/components/common/button";
import PageHero from "@/components/common/PageHero";
import SearchCombobox from "@/components/common/SearchCombobox";

import {
  useApproveExportOrder,
  useCancelExportOrder,
  useExport,
  useExportOrders,
  useShipExportOrder,
} from "../hooks";
import type { ExportItem, ExportInput, ExportOrder } from "../types";

import { useInventory } from "@/features/inventory/hooks";
import { useWarehouses } from "@/features/warehouse/hooks";

interface FormValues {
  customer_name: string;
  export_type: string;
  vat_rate: number;
}

const exportTypeOptions = [
  { value: "RETAIL_SALE", label: "Xuất bán lẻ" },
  { value: "WHOLESALE", label: "Xuất bán sỉ" },
  { value: "PRODUCTION_MATERIAL", label: "Xuất nguyên liệu sản xuất" },
  { value: "TRANSFER_OUT", label: "Xuất điều chuyển kho" },
  { value: "DAMAGED_DISPOSAL", label: "Xuất hủy/hao hụt" },
  { value: "SUPPLIER_RETURN", label: "Xuất trả nhà cung cấp" },
  { value: "ADJUSTMENT_OUT", label: "Xuất điều chỉnh giảm" },
];

const exportTypeLabel = Object.fromEntries(
  exportTypeOptions.map((item) => [item.value, item.label])
);

export default function ExportPage() {
  const [form] = Form.useForm<FormValues>();

  const mutation = useExport();
  const approveMutation = useApproveExportOrder();
  const shipMutation = useShipExportOrder();
  const cancelMutation = useCancelExportOrder();

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

  const { data: exportOrdersRes, isLoading: exportOrdersLoading } =
    useExportOrders({
      page: 1,
      page_size: 10,
    });

  const exportOrders = exportOrdersRes?.items || [];

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

  const handleProductChange = (index: number, value?: number) => {
    const productId = Number(value || 0);
    const currentWarehouseId = items[index]?.warehouse_id;
    const selectedInventory = allInventories.find(
      (inventory) =>
        inventory.product_id === productId &&
        inventory.warehouse_id === currentWarehouseId
    );

    setItems((prev) => {
      const clone = [...prev];
      clone[index] = {
        ...clone[index],
        product_id: productId,
        price: Number(selectedInventory?.product_price || clone[index].price || 0),
      };
      return clone;
    });
  };

  const handleWarehouseChange = (index: number, value?: number) => {
    const warehouseId = Number(value || 0);
    const currentProductId = items[index]?.product_id;
    const selectedInventory = allInventories.find(
      (inventory) =>
        inventory.product_id === currentProductId &&
        inventory.warehouse_id === warehouseId
    );

    setItems((prev) => {
      const clone = [...prev];
      clone[index] = {
        ...clone[index],
        warehouse_id: warehouseId,
        price: Number(selectedInventory?.product_price || clone[index].price || 0),
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

  const handleSubmit = async (autoComplete = true) => {
    try {
      const values =
        await form.validateFields();

      const payload: ExportInput = {
        customer_name:
          values.customer_name,
        export_type:
          values.export_type,
        vat_rate: values.vat_rate,
        auto_complete: autoComplete,

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
            autoComplete
              ? `Xuất kho thành công. Phiếu ${result.order.order_code || result.order.id}, hóa đơn ${result.invoice?.invoice_number || ""} đã được tạo tự động`
              : `Đã tạo phiếu xuất ${result.order.order_code || result.order.id} và giữ hàng chờ duyệt/xuất kho`
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

  const handleApprove = (id: number) => {
    approveMutation.mutate(id, {
      onSuccess: () => message.success("Đã duyệt phiếu xuất"),
    });
  };

  const handleShip = (id: number) => {
    shipMutation.mutate(id, {
      onSuccess: () => message.success("Đã xuất hàng và tạo hóa đơn"),
    });
  };

  const handleCancel = (id: number) => {
    cancelMutation.mutate(id, {
      onSuccess: () => message.success("Đã hủy phiếu xuất"),
    });
  };

  const statusColor: Record<string, string> = {
    PENDING: "gold",
    APPROVED: "blue",
    COMPLETED: "green",
    CANCELLED: "red",
  };

  const exportColumns: ColumnsType<ExportOrder> = [
    {
      title: "Mã phiếu",
      dataIndex: "order_code",
      key: "order_code",
      render: (value, record) => value || `#${record.id}`,
    },
    {
      title: "Loại phiếu",
      dataIndex: "export_type",
      key: "export_type",
      render: (value: string) => exportTypeLabel[value] || value,
    },
    {
      title: "Khách hàng",
      dataIndex: "customer_name",
      key: "customer_name",
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
            <Button size="small" type="primary" onClick={() => handleShip(record.id)}>
              Xuất hàng
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
        eyebrow="Outbound workflow"
        title="Phiếu xuất kho"
        description="Lập phiếu xuất theo bán lẻ, bán sỉ, sản xuất, điều chuyển hoặc hao hụt; giữ hàng và xuất kho theo quy trình."
      />

      {/* GENERAL */}
      <Card
        title="Thông tin chung"
        className="workflow-card"
        style={{ marginBottom: 24 }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ vat_rate: 0.08, export_type: "RETAIL_SALE" }}
        >
          <Form.Item
            name="export_type"
            label="Loại phiếu xuất"
            rules={[
              {
                required: true,
                message:
                  "Vui lòng chọn loại phiếu xuất",
              },
            ]}
          >
            <Select
              options={exportTypeOptions}
              placeholder="Chọn loại phiếu xuất"
            />
          </Form.Item>

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

          <Form.Item
            name="vat_rate"
            label="VAT"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập VAT",
              },
            ]}
          >
            <InputNumber
              min={0}
              max={1}
              step={0.01}
              addonAfter="%"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Card>

      {/* ITEMS */}
      <Card
        title="Danh sách sản phẩm"
        className="workflow-card"
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
                    handleWarehouseChange(
                      index,
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
                    handleProductChange(
                      index,
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
          marginTop: 24,
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
        }}
      >
        <Button
          size="large"
          loading={
            mutation.isPending
          }
          onClick={() => handleSubmit(false)}
        >
          Lưu phiếu chờ duyệt
        </Button>
        <Button
          type="primary"
          size="large"
          loading={
            mutation.isPending
          }
          onClick={() => handleSubmit(true)}
        >
          Xác nhận xuất kho
        </Button>
      </div>

      <Card
        title="Quản lý phiếu xuất gần đây"
        className="workflow-card"
        style={{
          marginTop: 24,
        }}
      >
        <Table<ExportOrder>
          rowKey="id"
          dataSource={exportOrders}
          columns={exportColumns}
          loading={
            exportOrdersLoading ||
            approveMutation.isPending ||
            shipMutation.isPending ||
            cancelMutation.isPending
          }
          pagination={false}
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
}
