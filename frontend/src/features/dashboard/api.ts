import apiClient from "@/lib/api";

import type {
    DashboardResponse,
} from "./types";

export const getDashboard =
    async (): Promise<DashboardResponse> => {
        const res =
            await apiClient.get(
                "/dashboard/"
            );

        return res.data;
    };