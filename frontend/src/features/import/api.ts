import apiClient from "@/lib/api";
import type { ImportInput, ImportOrdersResponse } from "./types";

export const createImport = async (data: ImportInput) => {
    const res = await apiClient.post("/import/", data);
    return res.data;
};

export const getImportOrders = async (params: {
    page: number;
    page_size: number;
    status?: string;
    search?: string;
}): Promise<ImportOrdersResponse> => {
    const res = await apiClient.get("/import/", { params });
    return res.data;
};

export const approveImportOrder = async (id: number) => {
    const res = await apiClient.post(`/import/${id}/approve`);
    return res.data;
};

export const receiveImportOrder = async (id: number) => {
    const res = await apiClient.post(`/import/${id}/receive`);
    return res.data;
};

export const cancelImportOrder = async (id: number) => {
    const res = await apiClient.post(`/import/${id}/cancel`);
    return res.data;
};
