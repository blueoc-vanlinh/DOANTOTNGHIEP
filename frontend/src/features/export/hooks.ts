import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checkStock, createExport } from "./api";

export const useExport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createExport,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            queryClient.invalidateQueries({ queryKey: ["inventory"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            queryClient.invalidateQueries({ queryKey: ["ai-data"] });
            queryClient.invalidateQueries({ queryKey: ["forecast"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
        },
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
