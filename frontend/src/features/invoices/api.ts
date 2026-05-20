import apiClient from "@/lib/api";
import type { Invoice, InvoiceInput, InvoiceType } from "./types";

export const getInvoices = async (): Promise<Invoice[]> => {
  const res = await apiClient.get("/invoices/");
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
  orderId: number;
}): Promise<Invoice> => {
  const res = await apiClient.post(
    `/invoices/from-order/${invoiceType}/${orderId}`
  );
  return res.data;
};
