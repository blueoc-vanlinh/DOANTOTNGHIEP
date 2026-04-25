import apiClient from "@/lib/api";
import type { Inventory, InventoryInput } from "./types";
export interface InventoryResponse {
    items: Inventory[];
    total: number;
    page: number;
    page_size: number;
}

export const getInventory = async (params: {
    page: number;
    page_size: number;
}): Promise<InventoryResponse> => {
    const res = await apiClient.get("/inventory/", { params });
    return res.data;
};

export const updateInventory = async ({
    id,
    data,
}: {
    id: number;
    data: Partial<InventoryInput>;
}): Promise<Inventory> => {
    const res = await apiClient.put<Inventory>(`/inventory/${id}/`, data);
    return res.data;
};