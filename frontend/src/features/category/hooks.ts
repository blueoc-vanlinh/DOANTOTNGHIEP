import { useMutation, useQuery } from "@tanstack/react-query";
import { getCategories, createCategory, updateCategory, deleteCategory } from "./api";
export const useCategories = () => {
    return useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
        initialData: [],
    });
}

export const useCreateCategory = () => {
    return useMutation({
        mutationFn: createCategory,
    });
}
export const useUpdateCategory = () => {
    return useMutation({
        mutationFn: updateCategory,
    });
}
export const useDeleteCategory = () => {
    return useMutation({
        mutationFn: deleteCategory,
    });
}