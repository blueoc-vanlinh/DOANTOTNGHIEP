import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  QRCode,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import { useDebounce } from "use-debounce";

import Button from "@/components/common/button";
import SearchCombobox from "@/components/common/SearchCombobox";
import { useProducts } from "@/features/products/hooks";
import {
  useCreateInvoice,
  useCreateInvoiceFromOrder,
  useCreateMomoPayment,
  useInvoice,
  useInvoices,
} from "../hooks";
import type {
  Invoice,
  InvoiceInput,
  InvoiceItemInput,
  InvoiceType,
} from "../types";

const { Title, Text } = Typography;

interface FromOrderValues {
  invoiceType: InvoiceType;
  orderId: string;
}

export default function InvoicePage() {
  const [manualForm] = Form.useForm<InvoiceInput>();
  const [fromOrderForm] = Form.useForm<FromOrderValues>();
  const [items, setItems] = useState<InvoiceItemInput[]>([
    { product_id: 0, quantity: 1, unit_price: 0 },
  ]);
  const [productSearch, setProductSearch] = useState("");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [debouncedInvoiceSearch] = useDebounce(invoiceSearch, 300);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | undefined>();

  const invoices = useInvoices({
    search: debouncedInvoiceSearch,
    page: 1,
    page_size: 200,
  });
  const invoiceDetail = useInvoice(selectedInvoiceId);
  const createInvoice = useCreateInvoice();
  const createFromOrder = useCreateInvoiceFromOrder();
  const createMomoPayment = useCreateMomoPayment();
  const { data: productRes } = useProducts({
    page: 1,
    pageSize: 50,
    search: productSearch,
  });

  const products = productRes?.items || [];
  const filteredInvoices = useMemo(() => invoices.data || [], [invoices.data]);
  const totalValue = useMemo(
    () => filteredInvoices.reduce((sum, invoice) => sum + invoice.grand_total, 0),
    [filteredInvoices]
  );

  const updateItem = <K extends keyof InvoiceItemInput>(
    index: number,
    key: K,
    value: InvoiceItemInput[K]
  ) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const handleCreateManual = async () => {
    const values = await manualForm.validateFields();
    const cleanItems = items.filter(
      (item) => item.product_id && item.quantity > 0 && item.unit_price >= 0
    );

    if (!cleanItems.length) {
      message.warning("Cần ít nhất một dòng hóa đơn hợp lệ");
      return;
    }

    createInvoice.mutate(
      {
        ...values,
        items: cleanItems,
      },
      {
        onSuccess: () => {
          message.success("Đã tạo hóa đơn");
          manualForm.resetFields();
          setItems([{ product_id: 0, quantity: 1, unit_price: 0 }]);
        },
      }
    );
  };

  const handleCreateFromOrder = async () => {
    const values = await fromOrderForm.validateFields();

    createFromOrder.mutate(
      {
        invoiceType: values.invoiceType,
        orderId: values.orderId,
      },
      {
        onSuccess: () => {
          message.success("Đã tạo hóa đơn từ phiếu");
          fromOrderForm.resetFields();
        },
      }
    );
  };

  const selectedInvoice = invoiceDetail.data;
  const momoQrValue = createMomoPayment.data?.qr_code_url || createMomoPayment.data?.pay_url || "";

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleCreateMomoQr = () => {
    if (!selectedInvoice) return;
    createMomoPayment.mutate(selectedInvoice.id, {
      onError: (error) => {
        const err = error as { message?: string };
        message.error(err.message || "Không tạo được QR MoMo sandbox");
      },
    });
  };

  useEffect(() => {
    createMomoPayment.reset();
  }, [createMomoPayment, selectedInvoiceId]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Hóa đơn
        </Title>
        <Text type="secondary">Quản lý hóa đơn nhập kho và xuất kho</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Tổng hóa đơn" value={filteredInvoices.length} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Tổng giá trị"
              value={totalValue}
              precision={0}
              suffix="VND"
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Hóa đơn xuất"
              value={filteredInvoices.filter((item) => item.invoice_type === "EXPORT").length}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={9}>
          <Card title="Tạo hóa đơn từ phiếu">
            <Form form={fromOrderForm} layout="vertical">
              <Form.Item
                name="invoiceType"
                label="Loại phiếu"
                rules={[{ required: true, message: "Chọn loại phiếu" }]}
              >
                <Select
                  options={[
                    { value: "IMPORT", label: "Phiếu nhập" },
                    { value: "EXPORT", label: "Phiếu xuất" },
                  ]}
                />
              </Form.Item>
              <Form.Item
                name="orderId"
                label="Mã phiếu"
                rules={[{ required: true, message: "Nhập mã phiếu" }]}
              >
                <Input placeholder="Nhập mã phiếu hoặc ID phiếu" />
              </Form.Item>
              <Button
                type="primary"
                loading={createFromOrder.isPending}
                onClick={handleCreateFromOrder}
              >
                Tạo từ phiếu
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={15}>
          <Card title="Tạo hóa đơn thủ công">
            <Form form={manualForm} layout="vertical">
              <Row gutter={12}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="invoice_type"
                    label="Loại hóa đơn"
                    rules={[{ required: true, message: "Chọn loại hóa đơn" }]}
                  >
                    <Select
                      options={[
                        { value: "IMPORT", label: "Nhập" },
                        { value: "EXPORT", label: "Xuất" },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="order_id"
                    label="Mã phiếu"
                    rules={[{ required: true, message: "Nhập mã phiếu" }]}
                  >
                    <InputNumber min={1} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="partner_name"
                    label="Đối tác"
                    rules={[{ required: true, message: "Nhập đối tác" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col xs={24} md={12}>
                  <Form.Item name="tax_amount" label="Thuế" initialValue={0}>
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="discount_amount" label="Giảm giá" initialValue={0}>
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            <Divider />

            <Space direction="vertical" style={{ width: "100%" }}>
              {items.map((item, index) => (
                <Row gutter={12} key={index} align="middle">
                  <Col xs={24} md={10}>
                    <SearchCombobox
                      value={item.product_id || undefined}
                      onChange={(value) => updateItem(index, "product_id", Number(value))}
                      onSearch={(value) => setProductSearch(value)}
                      placeholder="Chọn sản phẩm"
                      options={products.map((p) => ({
                        value: p.id,
                        label: `${p.name} #${p.id}`,
                        searchText: `${p.id} ${p.name}`,
                      }))}
                    />
                  </Col>
                  <Col xs={12} md={4}>
                    <InputNumber
                      min={1}
                      style={{ width: "100%" }}
                      value={item.quantity}
                      onChange={(value) => updateItem(index, "quantity", Number(value || 1))}
                    />
                  </Col>
                  <Col xs={12} md={5}>
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      value={item.unit_price}
                      onChange={(value) => updateItem(index, "unit_price", Number(value || 0))}
                    />
                  </Col>
                  <Col xs={24} md={5}>
                    <Button
                      danger
                      onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                      disabled={items.length === 1}
                    >
                      Xóa
                    </Button>
                  </Col>
                </Row>
              ))}
              <Space>
                <Button
                  onClick={() =>
                    setItems((prev) => [
                      ...prev,
                      { product_id: 0, quantity: 1, unit_price: 0 },
                    ])
                  }
                >
                  + Thêm dòng
                </Button>
                <Button
                  type="primary"
                  loading={createInvoice.isPending}
                  onClick={handleCreateManual}
                >
                  Tạo hóa đơn
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="Danh sách hóa đơn">
        <Input.Search
          allowClear
          value={invoiceSearch}
          placeholder="Tìm theo số hóa đơn, đối tác, mã phiếu hoặc trạng thái"
          onChange={(event) => setInvoiceSearch(event.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Table<Invoice>
          rowKey="id"
          loading={invoices.isLoading}
          dataSource={filteredInvoices}
          pagination={{ pageSize: 10 }}
          columns={[
            { title: "Số hóa đơn", dataIndex: "invoice_number" },
            {
              title: "Loại",
              dataIndex: "invoice_type",
              render: (value: InvoiceType) => (
                <Tag color={value === "IMPORT" ? "green" : "blue"}>{value}</Tag>
              ),
            },
            { title: "Mã phiếu", dataIndex: "order_id" },
            { title: "Đối tác", dataIndex: "partner_name" },
            { title: "Tổng tiền", dataIndex: "grand_total" },
            { title: "Trạng thái", dataIndex: "status" },
            {
              title: "Ngày phát hành",
              dataIndex: "issued_at",
              render: (value: string) => new Date(value).toLocaleString(),
            },
            {
              title: "Chi tiết",
              render: (_, record) => (
                <Button onClick={() => setSelectedInvoiceId(record.id)}>Xem</Button>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={!!selectedInvoiceId}
        title={selectedInvoice?.invoice_number}
        footer={[
          <Button key="close" onClick={() => setSelectedInvoiceId(undefined)}>
            Đóng
          </Button>,
          <Button
            key="momo"
            disabled={!selectedInvoice}
            loading={createMomoPayment.isPending}
            onClick={handleCreateMomoQr}
          >
            Tạo QR MoMo
          </Button>,
          <Button
            key="print"
            type="primary"
            disabled={!selectedInvoice || !momoQrValue}
            onClick={handlePrintInvoice}
          >
            In hóa đơn
          </Button>,
        ]}
        onCancel={() => setSelectedInvoiceId(undefined)}
        width={820}
      >
        {selectedInvoice && (
          <div className="invoice-print-area">
            <style>
              {`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  .invoice-print-area,
                  .invoice-print-area * {
                    visibility: visible;
                  }
                  .invoice-print-area {
                    position: absolute;
                    inset: 0 auto auto 0;
                    width: 100%;
                    padding: 24px;
                    background: #fff;
                  }
                  .ant-modal-footer,
                  .ant-modal-close {
                    display: none !important;
                  }
                }
              `}
            </style>

            <div style={{ marginBottom: 20, textAlign: "center" }}>
              <Title level={3} style={{ marginBottom: 4 }}>
                HÓA ĐƠN THANH TOÁN
              </Title>
              <Text>Mã hóa đơn: {selectedInvoice.invoice_number}</Text>
            </div>

            <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text strong>Loại hóa đơn: </Text>
                <Tag color={selectedInvoice.invoice_type === "IMPORT" ? "green" : "blue"}>
                  {selectedInvoice.invoice_type}
                </Tag>
              </Col>
              <Col span={12}>
                <Text strong>Mã phiếu: </Text>
                <Text>{selectedInvoice.order_id}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Đối tác: </Text>
                <Text>{selectedInvoice.partner_name}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Ngày phát hành: </Text>
                <Text>{new Date(selectedInvoice.issued_at).toLocaleString("vi-VN")}</Text>
              </Col>
            </Row>

            <Table
              rowKey="id"
              pagination={false}
              loading={invoiceDetail.isLoading}
              dataSource={selectedInvoice.items || []}
              columns={[
                { title: "Sản phẩm", dataIndex: "description" },
                { title: "SL", dataIndex: "quantity", width: 80 },
                {
                  title: "Đơn giá",
                  dataIndex: "unit_price",
                  render: (value: number) => formatMoney(value),
                },
                {
                  title: "Thành tiền",
                  dataIndex: "line_total",
                  render: (value: number) => formatMoney(value),
                },
              ]}
              summary={() => (
                <Table.Summary>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <Text strong>Tạm tính</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3}>
                      {formatMoney(selectedInvoice.total_amount)}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <Text strong>VAT/Thuế</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3}>
                      {formatMoney(selectedInvoice.tax_amount)}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <Text strong>Giảm giá</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3}>
                      {formatMoney(selectedInvoice.discount_amount)}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <Title level={4} style={{ margin: 0 }}>
                        Tổng tiền
                      </Title>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3}>
                      <Title level={4} style={{ margin: 0 }}>
                        {formatMoney(selectedInvoice.grand_total)}
                      </Title>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />

            <div
              style={{
                marginTop: 24,
                display: "flex",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <Space direction="vertical" align="center">
                {momoQrValue ? (
                  <QRCode value={momoQrValue} size={164} />
                ) : (
                  <div
                    style={{
                      width: 164,
                      height: 164,
                      border: "1px dashed #d9d9d9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 12,
                    }}
                  >
                    <Text type="secondary">Bấm Tạo QR MoMo</Text>
                  </div>
                )}
                <Text strong>Quét QR MoMo sandbox để thanh toán</Text>
                <Text type="secondary">Số tiền: {formatMoney(selectedInvoice.grand_total)}</Text>
                {createMomoPayment.data?.message && (
                  <Text type="secondary">{createMomoPayment.data.message}</Text>
                )}
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}
