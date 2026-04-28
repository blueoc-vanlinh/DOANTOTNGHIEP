import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
} from "./api";

export const useWarehouses = (params: {
    page: number;
    page_size: number;
}) => {
    return useQuery({
        queryKey: ["warehouses", params],
        queryFn: () => getWarehouses(params),
    });
};
export const useCreateWarehouse = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createWarehouse,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["warehouses"] }),
    });
};

export const useUpdateWarehouse = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateWarehouse,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["warehouses"] }),
    });
};

export const useDeleteWarehouse = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteWarehouse,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["warehouses"] }),
    });
};