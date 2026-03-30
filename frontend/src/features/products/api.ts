import apiClient from "@/lib/api";
import type { Product } from "./types";


export type ProductInput = Omit<Product, "id" | "created_at" | "updated_at">;

export const getProducts = async (): Promise<Product[]> => {
    const res = await apiClient.get<Product[]>("/products/");
    return res.data;
};

export const createProduct = async (data: ProductInput): Promise<Product> => {
    const res = await apiClient.post<Product>("/products/", data);
    return res.data;
};

export const updateProduct = async ({
    id,
    data,
}: {
    id: number;
    data: ProductInput;
}): Promise<Product> => {
    const res = await apiClient.put<Product>(`/products/${id}/`, data);
    return res.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}/`);
};