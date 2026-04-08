import { useQuery } from "@tanstack/react-query";
import {
    getTransactions,
} from "./api";

export const useTransactions = () => {
    return useQuery({
        queryKey: ["transactions"],
        queryFn: getTransactions,
    });
};
