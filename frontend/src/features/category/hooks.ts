import { useMutation, useQuery } from "@tanstack/react-query";
import { getCategories, createCategory, updateCategory, deleteCategory } from "./api";

export const useCategories = (params: {
    page: number;
    page_size: number;
}) => {
    return useQuery({
        queryKey: ["categories", params],
        queryFn: () => getCategories(params),
    });
};
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