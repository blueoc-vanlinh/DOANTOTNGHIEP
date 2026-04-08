import apiClient from "@/lib/api";
import type { DashboardResponse } from "./types";

export const getDashboardData = async (): Promise<DashboardResponse> => {
    const res = await apiClient.get<DashboardResponse>("/dashboard/");
    return res.data;
};
