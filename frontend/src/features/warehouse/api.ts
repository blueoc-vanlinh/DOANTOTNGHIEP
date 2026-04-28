import apiClient from "@/lib/api";
import type { Warehouse, WarehouseInput, WarehouseResponse } from "./types";



export const getWarehouses = async (params: {
    page: number;
    page_size: number;
}): Promise<WarehouseResponse> => {
    const res = await apiClient.get("/warehouses/", { params });
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