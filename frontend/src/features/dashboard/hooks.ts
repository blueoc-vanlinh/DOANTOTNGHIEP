import { useQuery } from "@tanstack/react-query";
import {
    getDashboardData,
} from "./api";

export const useDashboardData = () => {
    return useQuery({
        queryKey: ["dashboard"],
        queryFn: getDashboardData,
    });
};

