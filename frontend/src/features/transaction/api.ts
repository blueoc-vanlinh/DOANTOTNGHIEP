import apiClient from "@/lib/api";
import type { TransactionResponse } from "./types";


export const getTransactions = async (params: {
    page: number;
    page_size: number;
    search?: string;
    product_id?: number;
    warehouse_id?: number;
    type?: string;
}): Promise<TransactionResponse> => {
    const res = await apiClient.get("/transactions/", { params });
    return res.data;
};

