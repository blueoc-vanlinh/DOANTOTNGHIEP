import apiClient from "@/lib/api";
import type { Invoice, InvoiceInput, InvoiceType, MomoPayment } from "./types";

export const getInvoices = async (params?: {
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<Invoice[]> => {
  const res = await apiClient.get("/invoices/", { params });
  return res.data;
};

export const getInvoice = async (invoiceId: number): Promise<Invoice> => {
  const res = await apiClient.get(`/invoices/${invoiceId}`);
  return res.data;
};

export const createInvoice = async (data: InvoiceInput): Promise<Invoice> => {
  const res = await apiClient.post("/invoices/", data);
  return res.data;
};

export const createInvoiceFromOrder = async ({
  invoiceType,
  orderId,
}: {
  invoiceType: InvoiceType;
  orderId: number | string;
}): Promise<Invoice> => {
  const res = await apiClient.post(
    `/invoices/from-order/${invoiceType}/${orderId}`
  );
  return res.data;
};

export const createMomoPayment = async (
  invoiceId: number
): Promise<MomoPayment> => {
  const res = await apiClient.post(`/invoices/${invoiceId}/momo-payment`);
  return res.data;
};
