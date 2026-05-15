import { useQuery } from "@tanstack/react-query";

import { getDashboard } from "./api";

export const useDashboardData =
    () => {
        return useQuery({
            queryKey: ["dashboard"],

            queryFn: getDashboard,

            staleTime: 1000 * 60,
        });
    };