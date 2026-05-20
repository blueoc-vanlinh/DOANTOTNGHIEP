import apiClient from "@/lib/api";

import type {
    DashboardResponse,
} from "./types";

export const getDashboard =
    async (params: {
        period: "day" | "month" | "year";
        target_date?: string;
        target_month?: string;
        target_year?: number;
    }): Promise<DashboardResponse> => {
        const res =
            await apiClient.get(
                "/dashboard/",
                { params }
            );

        return res.data;
    };
