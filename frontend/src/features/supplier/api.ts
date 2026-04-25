import apiClient from "@/lib/api";
import type { Supplier, SupplierInput, SupplierResponse } from "./types";

export const getSuppliers = async (params: {
    page: number;
    page_size: number;
}) => {
    const res = await apiClient.get<SupplierResponse>("/suppliers/", {
        params,
    });
    return res.data;
};

export const createSupplier = async (data: SupplierInput): Promise<Supplier> => {
    const res = await apiClient.post<Supplier>("/suppliers/", data);
    return res.data;
};

export const updateSupplier = async ({
    id,
    data,
}: {
    id: number;
    data: SupplierInput;
}): Promise<Supplier> => {
    const res = await apiClient.put<Supplier>(`/suppliers/${id}/`, data);
    return res.data;
};

export const deleteSupplier = async (id: number): Promise<void> => {
    await apiClient.delete(`/suppliers/${id}/`);
};