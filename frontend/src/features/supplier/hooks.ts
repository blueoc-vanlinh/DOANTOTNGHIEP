import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
} from "./api";

export const useSuppliers = () => {
    return useQuery({
        queryKey: ["suppliers"],
        queryFn: getSuppliers,
    });
};

export const useCreateSupplier = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createSupplier,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
    });
};

export const useUpdateSupplier = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateSupplier,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
    });
};

export const useDeleteSupplier = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteSupplier,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
    });
};