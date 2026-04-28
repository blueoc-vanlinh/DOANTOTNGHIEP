import { useQuery } from "@tanstack/react-query";
import {
    getTransactions,
} from "./api";

export const useTransactions = (params: {
    page: number;
    page_size: number;
    search?: string;
    type?: string;
}) => {
    return useQuery({
        queryKey: ["transactions", params],
        queryFn: () => getTransactions(params),
    });
};
