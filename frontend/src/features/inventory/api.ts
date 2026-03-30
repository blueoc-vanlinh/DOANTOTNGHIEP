import apiClient from "@/lib/api";
import type { Inventory } from "./types";

export type InventoryInput = {
    product_id: number;
    warehouse_id: number;
    quantity: number;
};

export const getInventory = async (): Promise<Inventory[]> => {
    const res = await apiClient.get<Inventory[]>("/inventory/");
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