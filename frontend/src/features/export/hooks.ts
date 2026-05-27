import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    approveExportOrder,
    cancelExportOrder,
    checkStock,
    createExport,
    getExportOrders,
    shipExportOrder,
} from "./api";

const invalidateExportWorkflow = (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.invalidateQueries({ queryKey: ["export-orders"] });
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    queryClient.invalidateQueries({ queryKey: ["inventory"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["ai-data"] });
    queryClient.invalidateQueries({ queryKey: ["forecast"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
};

export const useExportOrders = (params: {
    page: number;
    page_size: number;
    status?: string;
    search?: string;
}) => {
    return useQuery({
        queryKey: ["export-orders", params],
        queryFn: () => getExportOrders(params),
    });
};

export const useExport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createExport,
        onSuccess: () => {
            invalidateExportWorkflow(queryClient);
        },
    });
};

export const useApproveExportOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: approveExportOrder,
        onSuccess: () => invalidateExportWorkflow(queryClient),
    });
};

export const useShipExportOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: shipExportOrder,
        onSuccess: () => invalidateExportWorkflow(queryClient),
    });
};

export const useCancelExportOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cancelExportOrder,
        onSuccess: () => invalidateExportWorkflow(queryClient),
    });
};
export const useCheckStock = (
    product_id?: number,
    warehouse_id?: number
) => {
    return useQuery({
        queryKey: ["check-stock", product_id, warehouse_id],

        queryFn: () =>
            checkStock(
                product_id as number,
                warehouse_id as number
            ),

        enabled: !!product_id && !!warehouse_id,
    });
};
