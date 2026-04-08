import apiClient from "@/lib/api";
import type { ForecastResponse } from "./types";

export const getForecast = async (product_id: number): Promise<ForecastResponse> => {
    const res = await apiClient.get(`/forecast/${product_id}`);
    return res.data as ForecastResponse;
};