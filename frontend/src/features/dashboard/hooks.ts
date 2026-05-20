import { useQuery } from "@tanstack/react-query";

import { getDashboard } from "./api";

export const useDashboardData =
    (params: {
        period: "day" | "month" | "year";
        target_date?: string;
        target_month?: string;
        target_year?: number;
    }) => {
        return useQuery({
            queryKey: ["dashboard", params],

            queryFn: () => getDashboard(params),

            staleTime: 1000 * 60,
        });
    };
