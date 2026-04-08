import apiClient from "@/lib/api";
import type { Warehouse, WarehouseInput } from "./types";



export const getWarehouses = async (): Promise<Warehouse[]> => {
    const res = await apiClient.get<Warehouse[]>("/warehouses/");
    return res.data;
};

export const createWarehouse = async (data: WarehouseInput): Promise<Warehouse> => {
    const res = await apiClient.post<Warehouse>("/warehouses/", data);
    return res.data;
};

export const updateWarehouse = async ({
    id,
    data,
}: {
    id: number;
    data: WarehouseInput;
}): Promise<Warehouse> => {
    const res = await apiClient.put<Warehouse>(`/warehouses/${id}/`, data);
    return res.data;
};

export const deleteWarehouse = async (id: number): Promise<void> => {
    await apiClient.delete(`/warehouses/${id}/`);
};