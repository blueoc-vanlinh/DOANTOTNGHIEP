import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Col,
  Input,
  message,
  Modal,
  QRCode,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import { CopyOutlined, LinkOutlined } from "@ant-design/icons";
import { useDebounce } from "use-debounce";

import Button from "@/components/common/button";
import {
  useCreateMomoPayment,
  useInvoice,
  useInvoices,
} from "../hooks";
import type { Invoice, InvoiceType } from "../types";

const { Title, Text } = Typography;

export default function InvoicePage() {
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [debouncedInvoiceSearch] = useDebounce(invoiceSearch, 300);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | undefined>();

  const invoices = useInvoices({
    search: debouncedInvoiceSearch,
    page: 1,
    page_size: 200,
  });
  const invoiceDetail = useInvoice(selectedInvoiceId);
  const createMomoPayment = useCreateMomoPayment();

  const filteredInvoices = useMemo(() => invoices.data || [], [invoices.data]);
  const totalValue = useMemo(
    () => filteredInvoices.reduce((sum, invoice) => sum + invoice.grand_total, 0),
    [filteredInvoices]
  );

  const selectedInvoice = invoiceDetail.data;
  const momoQrValue = createMomoPayment.data?.qr_code_url || createMomoPayment.data?.pay_url || "";

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleCreateMomoQr = () => {
    if (!selectedInvoice) return;
    createMomoPayment.mutate(selectedInvoice.id, {
      onSuccess: () => {
        message.success("Đã tạo mã thanh toán MoMo");
      },
      onError: (error) => {
        const err = error as { message?: string };
        message.error(err.message || "Không tạo được QR MoMo sandbox");
      },
    });
  };

  useEffect(() => {
    createMomoPayment.reset();
  }, [selectedInvoiceId]);

  const handleCopyMomoCode = async (value?: string | null) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    message.success("Đã copy mã MoMo");
  };

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
                {createMomoPayment.data && (
                  <Space direction="vertical" size={4} style={{ marginTop: 8 }}>
                    <Text copyable={{ text: createMomoPayment.data.order_id }}>
                      Mã đơn MoMo: {createMomoPayment.data.order_id}
                    </Text>
                    <Text copyable={{ text: createMomoPayment.data.request_id }}>
                      Mã request: {createMomoPayment.data.request_id}
                    </Text>
                    <Space wrap>
                      {createMomoPayment.data.pay_url && (
                        <Button
                          icon={<LinkOutlined />}
                          onClick={() => window.open(createMomoPayment.data?.pay_url || "", "_blank")}
                        >
                          Mở link MoMo
                        </Button>
                      )}
                      {createMomoPayment.data.deeplink && (
                        <Button
                          icon={<CopyOutlined />}
                          onClick={() => handleCopyMomoCode(createMomoPayment.data?.deeplink)}
                        >
                          Copy deeplink
                        </Button>
                      )}
                    </Space>
                  </Space>
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
