import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} from "./api";

export const useProducts = () => {
    return useQuery({
        queryKey: ["products"],
        queryFn: getProducts,
    });
};

export const useCreateProduct = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createProduct,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
    });
};

export const useUpdateProduct = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateProduct,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
    });
};

export const useDeleteProduct = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
    });
};