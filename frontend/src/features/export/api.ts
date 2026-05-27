import apiClient from "@/lib/api";
import type { ExportInput, ExportOrdersResponse, ExportResponse } from "./types";

export const createExport = async (data: ExportInput): Promise<ExportResponse> => {
    const res = await apiClient.post("/export/", data);
    return res.data;
};
export const checkStock = async (
    product_id: number,
    warehouse_id: number
) => {
    const res = await apiClient.get("/inventory/check-stock", {
        params: {
            product_id,
            warehouse_id,
        },
    });

    return res.data;
};

export const getExportOrders = async (params: {
    page: number;
    page_size: number;
    status?: string;
    search?: string;
}): Promise<ExportOrdersResponse> => {
    const res = await apiClient.get("/export/", { params });
    return res.data;
};

export const approveExportOrder = async (id: number) => {
    const res = await apiClient.post(`/export/${id}/approve`);
    return res.data;
};

export const shipExportOrder = async (id: number) => {
    const res = await apiClient.post(`/export/${id}/ship`);
    return res.data;
};

export const cancelExportOrder = async (id: number) => {
    const res = await apiClient.post(`/export/${id}/cancel`);
    return res.data;
};
