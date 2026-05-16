import apiClient from "@/lib/api";

import type {
    Supplier,
    SupplierInput,
    SupplierResponse,
} from "./types";

export const getSuppliers =
    async (params?: {
        page?: number;
        page_size?: number;
        search?: string;
    }): Promise<SupplierResponse> => {
        const res =
            await apiClient.get(
                "/suppliers/",
                {
                    params,
                }
            );

        const data = res.data;

        return {
            items:
                data.items ||
                data.data?.items ||
                [],

            meta: {
                total:
                    data.meta?.total ||
                    data.data?.meta
                        ?.total ||
                    0,

                page:
                    data.meta?.page ||
                    data.data?.meta
                        ?.page ||
                    1,

                page_size:
                    data.meta
                        ?.page_size ||
                    data.data?.meta
                        ?.page_size ||
                    10,
            },
        };
    };

export const createSupplier =
    async (
        data: SupplierInput
    ): Promise<Supplier> => {
        const res =
            await apiClient.post(
                "/suppliers/",
                data
            );

        return res.data;
    };

export const updateSupplier =
    async ({
        id,
        data,
    }: {
        id: number;
        data: SupplierInput;
    }): Promise<Supplier> => {
        const res =
            await apiClient.put(
                `/suppliers/${id}/`,
                data
            );

        return res.data;
    };

export const deleteSupplier =
    async (
        id: number
    ): Promise<void> => {
        await apiClient.delete(
            `/suppliers/${id}/`
        );
    };