import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createInvoice,
  createInvoiceFromOrder,
  getInvoice,
  getInvoices,
} from "./api";

export const useInvoices = () => {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
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
