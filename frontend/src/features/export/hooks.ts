import { useMutation, useQuery } from "@tanstack/react-query";
import { checkStock, createExport } from "./api";

export const useExport = () => {
    return useMutation({
        mutationFn: createExport,
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