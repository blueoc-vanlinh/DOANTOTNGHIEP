export type InvoiceType = "IMPORT" | "EXPORT";

export interface InvoiceItem {
  id: number;
  product_id: number;
  description?: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  invoice_type: InvoiceType;
  order_id: number;
  partner_name: string;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  grand_total: number;
  status: string;
  issued_at: string;
  created_by?: number | null;
  items?: InvoiceItem[];
}

export interface InvoiceItemInput {
  product_id: number;
  description?: string | null;
  quantity: number;
  unit_price: number;
}

export interface InvoiceInput {
  invoice_type: InvoiceType;
  order_id: number | string;
  partner_name: string;
  tax_amount?: number;
  discount_amount?: number;
  items: InvoiceItemInput[];
}

export interface MomoPayment {
  invoice_id: number;
  invoice_number: string;
  amount: number;
  request_id: string;
  order_id: string;
  pay_url?: string | null;
  deeplink?: string | null;
  qr_code_url?: string | null;
  result_code?: number | null;
  message?: string | null;
}
