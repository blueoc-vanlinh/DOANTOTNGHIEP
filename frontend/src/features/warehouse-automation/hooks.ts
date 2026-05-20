import { useQuery } from "@tanstack/react-query";

import {
  getAutoPoRecommendations,
  getSlottingSuggestions,
  lookupBarcode,
} from "./api";

export const useAutoPoRecommendations = (params?: {
  lead_time_days?: number;
  coverage_days?: number;
}) => {
  return useQuery({
    queryKey: [
      "warehouse-automation",
      "auto-po",
      params?.lead_time_days,
      params?.coverage_days,
    ],
    queryFn: () => getAutoPoRecommendations(params),
  });
};

export const useSlottingSuggestions = (days: number) => {
  return useQuery({
    queryKey: ["warehouse-automation", "slotting", days],
    queryFn: () => getSlottingSuggestions(days),
  });
};

export const useBarcodeLookup = (barcode: string) => {
  return useQuery({
    queryKey: ["warehouse-automation", "barcode", barcode],
    queryFn: () => lookupBarcode(barcode),
    enabled: barcode.trim().length > 0,
    retry: false,
  });
};
