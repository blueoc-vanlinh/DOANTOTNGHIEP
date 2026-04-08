import apiClient from "@/lib/api";
import type { Category, CategoryInput } from "./types";

export const createCategory = async (data: CategoryInput): Promise<Category> => {
    const res = await apiClient.post<Category>("/categories/", data);
    return res.data;
};
export const getCategories = async (): Promise<Category[]> => {
    const res = await apiClient.get("/categories/");
    return res.data as Category[];
}
export const updateCategory = async ({
    id,
    data,
}: {
    id: number;
    data: CategoryInput;
}): Promise<Category> => {
    const res = await apiClient.put<Category>(`/categories/${id}/`, data);
    return res.data;
};

export const deleteCategory = async (id: number) => {
    await apiClient.delete(`/categories/${id}/`);
}