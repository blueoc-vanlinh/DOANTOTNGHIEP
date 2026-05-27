import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { approveImportOrder, cancelImportOrder, createImport, getImportOrders, receiveImportOrder } from "./api";

const invalidateImportWorkflow = (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.invalidateQueries({ queryKey: ["import-orders"] });
    queryClient.invalidateQueries({ queryKey: ["inventory"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["ai-data"] });
    queryClient.invalidateQueries({ queryKey: ["forecast"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
};

export const useImportOrders = (params: {
    page: number;
    page_size: number;
    status?: string;
    search?: string;
}) => {
    return useQuery({
        queryKey: ["import-orders", params],
        queryFn: () => getImportOrders(params),
    });
};

export const useImport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createImport,
        onSuccess: () => {
            invalidateImportWorkflow(queryClient);
        },
    });
};

export const useApproveImportOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: approveImportOrder,
        onSuccess: () => invalidateImportWorkflow(queryClient),
    });
};

export const useReceiveImportOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: receiveImportOrder,
        onSuccess: () => invalidateImportWorkflow(queryClient),
    });
};

export const useCancelImportOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cancelImportOrder,
        onSuccess: () => invalidateImportWorkflow(queryClient),
    });
};
