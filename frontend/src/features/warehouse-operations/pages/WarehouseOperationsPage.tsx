import { useMemo, useState } from "react";
import { Card, Col, Form, Input, InputNumber, message, Row, Select, Space, Tabs } from "antd";

import Button from "@/components/common/button";
import PageHero from "@/components/common/PageHero";
import SearchCombobox from "@/components/common/SearchCombobox";
import { useProducts } from "@/features/products/hooks";
import { useSuppliers } from "@/features/supplier/hooks";
import { useWarehouses } from "@/features/warehouse/hooks";
import {
  cancelExportOrder,
  cancelImportOrder,
  completeStocktake,
  createInventoryBatch,
  createPurchaseOrder,
  createReturnOrder,
  createStocktake,
  createStorageBin,
  receivePurchaseOrder,
} from "../api";

type EntityOption = {
  value: number;
  label: string;
  searchText: string;
};

function useEntityOptions() {
  const [productSearch, setProductSearch] = useState("");
  const [warehouseSearch, setWarehouseSearch] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");

  const products = useProducts({ page: 1, pageSize: 100, search: productSearch });
  const warehouses = useWarehouses({ page: 1, page_size: 100, search: warehouseSearch });
  const suppliers = useSuppliers({ page: 1, page_size: 100, search: supplierSearch });

  const productOptions = useMemo<EntityOption[]>(
    () =>
      (products.data?.items || []).map((item) => ({
        value: item.id,
        label: `${item.name} #${item.id}`,
        searchText: `${item.id} ${item.name} ${item.sku || ""}`,
      })),
    [products.data?.items]
  );

  const warehouseOptions = useMemo<EntityOption[]>(
    () =>
      (warehouses.data?.items || []).map((item) => ({
        value: item.id,
        label: `${item.name} #${item.id}`,
        searchText: `${item.id} ${item.name} ${item.location || ""}`,
      })),
    [warehouses.data?.items]
  );

  const supplierOptions = useMemo<EntityOption[]>(
    () =>
      (suppliers.data?.items || []).map((item) => ({
        value: item.id,
        label: `${item.name} #${item.id}`,
        searchText: `${item.id} ${item.name} ${item.email || ""}`,
      })),
    [suppliers.data?.items]
  );

  return {
    productOptions,
    warehouseOptions,
    supplierOptions,
    setProductSearch,
    setWarehouseSearch,
    setSupplierSearch,
  };
}

export default function WarehouseOperationsPage() {
  const entityOptions = useEntityOptions();

  return (
    <div>
      <PageHero
        eyebrow="Warehouse operations"
        title="Trung tâm nghiệp vụ kho"
        description="Thực hiện các nghiệp vụ sau bán, kiểm kê, vị trí lưu trữ, batch/serial, mua hàng PO và báo cáo vận hành trong một luồng quản trị thống nhất."
      />

      <Tabs
        className="section-band"
        items={[
          { key: "return", label: "Trả hàng", children: <ReturnForm {...entityOptions} /> },
          { key: "cancel", label: "Hủy phiếu", children: <CancelOrderForm /> },
          { key: "location", label: "Kệ / Batch", children: <LocationBatchForm {...entityOptions} /> },
          { key: "stocktake", label: "Kiểm kê", children: <StocktakeForm {...entityOptions} /> },
          { key: "po", label: "Mua hàng PO", children: <PurchaseOrderForm {...entityOptions} /> },
          { key: "reports", label: "Báo cáo", children: <ReportsPanel /> },
        ]}
      />
    </div>
  );
}

function ReturnForm({
  productOptions,
  warehouseOptions,
  setProductSearch,
  setWarehouseSearch,
}: ReturnType<typeof useEntityOptions>) {
  const [form] = Form.useForm();
  return (
    <Card title="Tạo phiếu trả hàng" className="workflow-card">
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item name="return_type" label="Loại trả hàng" initialValue="CUSTOMER_RETURN">
              <Select
                options={[
                  { value: "CUSTOMER_RETURN", label: "Khách trả hàng" },
                  { value: "SUPPLIER_RETURN", label: "Trả nhà cung cấp" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="product_id" label="Sản phẩm" rules={[{ required: true, message: "Chọn sản phẩm" }]}>
              <SearchCombobox onSearch={setProductSearch} options={productOptions} placeholder="Tìm sản phẩm theo tên/SKU" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="warehouse_id" label="Kho" rules={[{ required: true, message: "Chọn kho" }]}>
              <SearchCombobox onSearch={setWarehouseSearch} options={warehouseOptions} placeholder="Tìm kho theo tên" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="unit_price" label="Đơn giá">
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="reason" label="Lý do">
              <Input placeholder="Lỗi hàng, khách đổi trả, trả NCC..." />
            </Form.Item>
          </Col>
        </Row>
        <Button
          type="primary"
          onClick={async () => {
            const values = await form.validateFields();
            await createReturnOrder({ ...values, items: [values] });
            message.success("Đã tạo phiếu trả hàng");
            form.resetFields();
          }}
        >
          Tạo phiếu trả
        </Button>
      </Form>
    </Card>
  );
}

function CancelOrderForm() {
  const [form] = Form.useForm();
  return (
    <Card title="Hủy phiếu nhập/xuất và hoàn tồn kho" className="workflow-card">
      <Form form={form} layout="inline">
        <Form.Item name="type" initialValue="EXPORT">
          <Select
            style={{ width: 150 }}
            options={[
              { value: "IMPORT", label: "Phiếu nhập" },
              { value: "EXPORT", label: "Phiếu xuất" },
            ]}
          />
        </Form.Item>
        <Form.Item name="order_id" rules={[{ required: true, message: "Nhập ID phiếu" }]}>
          <InputNumber placeholder="ID phiếu" min={1} />
        </Form.Item>
        <Button
          type="primary"
          danger
          onClick={async () => {
            const values = await form.validateFields();
            if (values.type === "IMPORT") {
              await cancelImportOrder(values.order_id);
            } else {
              await cancelExportOrder(values.order_id);
            }
            message.success("Đã hủy phiếu và hoàn tồn kho");
          }}
        >
          Hủy phiếu
        </Button>
      </Form>
    </Card>
  );
}

function LocationBatchForm({
  productOptions,
  warehouseOptions,
  setProductSearch,
  setWarehouseSearch,
}: ReturnType<typeof useEntityOptions>) {
  const [binForm] = Form.useForm();
  const [batchForm] = Form.useForm();
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title="Tạo vị trí kệ/bin" className="workflow-card">
          <Form form={binForm} layout="vertical">
            <Form.Item name="warehouse_id" label="Kho" rules={[{ required: true, message: "Chọn kho" }]}>
              <SearchCombobox onSearch={setWarehouseSearch} options={warehouseOptions} placeholder="Tìm kho theo tên" />
            </Form.Item>
            <Form.Item name="code" label="Mã vị trí" rules={[{ required: true, message: "Nhập mã vị trí" }]}>
              <Input placeholder="A01-S02-L03" />
            </Form.Item>
            <Row gutter={12}>
              <Col span={8}><Form.Item name="zone" label="Khu"><Input /></Form.Item></Col>
              <Col span={8}><Form.Item name="aisle" label="Dãy"><Input /></Form.Item></Col>
              <Col span={8}><Form.Item name="shelf" label="Kệ"><Input /></Form.Item></Col>
            </Row>
            <Button
              type="primary"
              onClick={async () => {
                await createStorageBin(await binForm.validateFields());
                message.success("Đã tạo vị trí kệ");
                binForm.resetFields();
              }}
            >
              Lưu vị trí
            </Button>
          </Form>
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card title="Tạo batch/serial/hạn dùng" className="workflow-card">
          <Form form={batchForm} layout="vertical">
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="product_id" label="Sản phẩm" rules={[{ required: true, message: "Chọn sản phẩm" }]}>
                  <SearchCombobox onSearch={setProductSearch} options={productOptions} placeholder="Tìm sản phẩm" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="warehouse_id" label="Kho" rules={[{ required: true, message: "Chọn kho" }]}>
                  <SearchCombobox onSearch={setWarehouseSearch} options={warehouseOptions} placeholder="Tìm kho" />
                </Form.Item>
              </Col>
              <Col span={12}><Form.Item name="batch_number" label="Batch/Lot"><Input /></Form.Item></Col>
              <Col span={12}><Form.Item name="serial_number" label="Serial"><Input /></Form.Item></Col>
              <Col span={12}><Form.Item name="expiry_date" label="Hạn dùng YYYY-MM-DD"><Input /></Form.Item></Col>
              <Col span={12}><Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} min={0} /></Form.Item></Col>
            </Row>
            <Button
              type="primary"
              onClick={async () => {
                await createInventoryBatch(await batchForm.validateFields());
                message.success("Đã tạo batch/serial");
                batchForm.resetFields();
              }}
            >
              Lưu batch
            </Button>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}

function StocktakeForm({
  productOptions,
  warehouseOptions,
  setProductSearch,
  setWarehouseSearch,
}: ReturnType<typeof useEntityOptions>) {
  const [form] = Form.useForm();
  const [completeForm] = Form.useForm();
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Card title="Tạo phiếu kiểm kê" className="workflow-card">
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="product_id" label="Sản phẩm" rules={[{ required: true, message: "Chọn sản phẩm" }]}>
                <SearchCombobox onSearch={setProductSearch} options={productOptions} placeholder="Tìm sản phẩm" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="warehouse_id" label="Kho" rules={[{ required: true, message: "Chọn kho" }]}>
                <SearchCombobox onSearch={setWarehouseSearch} options={warehouseOptions} placeholder="Tìm kho" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="counted_quantity" label="Số lượng đếm được" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Button
            type="primary"
            onClick={async () => {
              const values = await form.validateFields();
              await createStocktake({ warehouse_id: values.warehouse_id, items: [values] });
              message.success("Đã tạo phiếu kiểm kê");
              form.resetFields();
            }}
          >
            Tạo kiểm kê
          </Button>
        </Form>
      </Card>
      <Card title="Hoàn tất kiểm kê" className="workflow-card">
        <Form form={completeForm} layout="inline">
          <Form.Item name="stocktake_id" rules={[{ required: true, message: "Nhập ID kiểm kê" }]}>
            <InputNumber placeholder="ID kiểm kê" min={1} />
          </Form.Item>
          <Button
            type="primary"
            onClick={async () => {
              const values = await completeForm.validateFields();
              await completeStocktake(values.stocktake_id);
              message.success("Đã hoàn tất kiểm kê và điều chỉnh tồn");
            }}
          >
            Hoàn tất
          </Button>
        </Form>
      </Card>
    </Space>
  );
}

function PurchaseOrderForm({
  productOptions,
  warehouseOptions,
  supplierOptions,
  setProductSearch,
  setWarehouseSearch,
  setSupplierSearch,
}: ReturnType<typeof useEntityOptions>) {
  const [form] = Form.useForm();
  const [receiveForm] = Form.useForm();
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Card title="Tạo đơn mua hàng PO" className="workflow-card">
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="supplier_id" label="Nhà cung cấp" rules={[{ required: true, message: "Chọn nhà cung cấp" }]}>
                <SearchCombobox onSearch={setSupplierSearch} options={supplierOptions} placeholder="Tìm nhà cung cấp" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="product_id" label="Sản phẩm" rules={[{ required: true, message: "Chọn sản phẩm" }]}>
                <SearchCombobox onSearch={setProductSearch} options={productOptions} placeholder="Tìm sản phẩm" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="warehouse_id" label="Kho nhận" rules={[{ required: true, message: "Chọn kho" }]}>
                <SearchCombobox onSearch={setWarehouseSearch} options={warehouseOptions} placeholder="Tìm kho" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={1} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="unit_cost" label="Giá nhập" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Button
            type="primary"
            onClick={async () => {
              const values = await form.validateFields();
              await createPurchaseOrder({ supplier_id: values.supplier_id, items: [values] });
              message.success("Đã tạo PO");
              form.resetFields();
            }}
          >
            Tạo PO
          </Button>
        </Form>
      </Card>
      <Card title="Nhận hàng theo PO" className="workflow-card">
        <Form form={receiveForm} layout="inline">
          <Form.Item name="po_id" rules={[{ required: true, message: "Nhập ID PO" }]}>
            <InputNumber placeholder="ID PO" min={1} />
          </Form.Item>
          <Button
            type="primary"
            onClick={async () => {
              const values = await receiveForm.validateFields();
              await receivePurchaseOrder(values.po_id);
              message.success("Đã nhận hàng theo PO");
            }}
          >
            Nhận hàng
          </Button>
        </Form>
      </Card>
    </Space>
  );
}

function ReportsPanel() {
  const apiBase = "/api/v1/reports";
  return (
    <Card title="Xuất báo cáo CSV" className="workflow-card">
      <Space>
        <Button href={`${apiBase}/inventory.csv`}>Tải tồn kho</Button>
        <Button href={`${apiBase}/import-export.csv`}>Tải nhập/xuất</Button>
      </Space>
    </Card>
  );
}
