import apiClient from "@/lib/api";
import type { ExportInput, ExportResponse } from "./types";

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
