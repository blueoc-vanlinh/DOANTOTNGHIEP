import apiClient from "@/lib/api";
import type {
  AutoPoRecommendation,
  BarcodeLookup,
  SlottingSuggestion,
} from "./types";

export const getAutoPoRecommendations = async (params?: {
  lead_time_days?: number;
  coverage_days?: number;
}): Promise<AutoPoRecommendation[]> => {
  const res = await apiClient.get("/warehouse-automation/auto-po", { params });
  return res.data;
};

export const getSlottingSuggestions = async (
  days = 30
): Promise<SlottingSuggestion[]> => {
  const res = await apiClient.get("/warehouse-automation/slotting", {
    params: { days },
  });
  return res.data;
};

export const lookupBarcode = async (barcode: string): Promise<BarcodeLookup> => {
  const res = await apiClient.get(`/warehouse-automation/barcode/${barcode}`);
  return res.data;
};
