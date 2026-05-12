import apiClient from "@/lib/api";

import type {
    Warehouse,
    WarehouseInput,
    WarehouseResponse,
} from "./types";

export const getWarehouses = async (params: {
    page?: number;
    page_size?: number;
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
}): Promise<WarehouseResponse> => {
    const res = await apiClient.get("/warehouses/", {
        params,
    });

    const data = res.data;

    return {
        items: data.items || [],
        meta: {
            total: data.meta?.total || 0,
            page: data.meta?.page || 1,
            page_size: data.meta?.page_size || 10,
        },
    };
};

export const getWarehouse = async (
    id: number
): Promise<Warehouse> => {
    const res = await apiClient.get<Warehouse>(
        `/warehouses/${id}`
    );

    return res.data;
};

export const createWarehouse = async (
    data: WarehouseInput
): Promise<Warehouse> => {
    const res = await apiClient.post<Warehouse>(
        "/warehouses/",
        data
    );

    return res.data;
};

export const updateWarehouse = async ({
    id,
    data,
}: {
    id: number;
    data: Partial<WarehouseInput>;
}): Promise<Warehouse> => {
    const res = await apiClient.put<Warehouse>(
        `/warehouses/${id}/`,
        data
    );

    return res.data;
};

export const deleteWarehouse = async (
    id: number
): Promise<void> => {
    await apiClient.delete(
        `/warehouses/${id}/`
    );
};