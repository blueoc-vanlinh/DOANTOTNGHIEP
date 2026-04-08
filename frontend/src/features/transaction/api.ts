import apiClient from "@/lib/api";
import type { Transaction } from "./types";



export const getTransactions = async (): Promise<Transaction[]> => {
    const res = await apiClient.get<Transaction[]>("/transactions/");
    return res.data;
};

