import apiClient from "@/lib/api";
import type { Product } from "./types";
import type { GetProductsParams, ProductImportResponse, ProductInput, ProductsResponse } from "./types";

export const getProducts = async (
    params?: GetProductsParams
): Promise<ProductsResponse> => {
    const res = await apiClient.get("/products/", { params });

    const data = res.data;
    return {
        items: data.items ?? data.data?.items ?? [],
        total: data.total ?? data.data?.total ?? 0,
        page: data.page ?? data.data?.page ?? 1,
        page_size: data.page_size ?? data.data?.page_size ?? 10,
        search: data.search ?? data.data?.search ?? "",
    };
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
    data: Partial<ProductInput>;
}): Promise<Product> => {
    const res = await apiClient.put<Product>(`/products/${id}/`, data);
    return res.data;
};

export const deleteProduct = async (id: number): Promise<Product> => {
    const res = await apiClient.delete<Product>(`/products/${id}/`);
    return res.data;
};

export const importProducts = async (file: File): Promise<ProductImportResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post<ProductImportResponse>("/products/import-file", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
};

export const downloadProductImportTemplate = async (): Promise<Blob> => {
    const res = await apiClient.get("/products/import-template", {
        responseType: "blob",
    });
    return res.data;
};
