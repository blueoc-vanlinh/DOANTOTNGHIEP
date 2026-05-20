import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createInvoice,
  createInvoiceFromOrder,
  createMomoPayment,
  getInvoice,
  getInvoices,
} from "./api";

export const useInvoices = (params?: {
  search?: string;
  page?: number;
  page_size?: number;
}) => {
  return useQuery({
    queryKey: ["invoices", params],
    queryFn: () => getInvoices(params),
    initialData: [],
  });
};

export const useInvoice = (invoiceId?: number) => {
  return useQuery({
    queryKey: ["invoices", invoiceId],
    queryFn: () => getInvoice(invoiceId || 0),
    enabled: !!invoiceId,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useCreateInvoiceFromOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvoiceFromOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useCreateMomoPayment = () => {
  return useMutation({
    mutationFn: createMomoPayment,
  });
};
