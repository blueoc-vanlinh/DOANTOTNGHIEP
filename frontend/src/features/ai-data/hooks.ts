import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createExternalFactor,
  getAiDataOverview,
  getDeepLearningDataset,
  getExternalFactors,
  getProductTrainingQuality,
} from "./api";

export const useAiDataOverview = () => {
  return useQuery({
    queryKey: ["ai-data", "overview"],
    queryFn: getAiDataOverview,
  });
};

export const useProductTrainingQuality = (productId?: number) => {
  return useQuery({
    queryKey: ["ai-data", "quality", productId],
    queryFn: () => getProductTrainingQuality(productId || 0),
    enabled: !!productId,
  });
};

export const useDeepLearningDataset = (productId?: number) => {
  return useQuery({
    queryKey: ["ai-data", "dataset", productId],
    queryFn: () => getDeepLearningDataset(productId || 0),
    enabled: !!productId,
  });
};

export const useExternalFactors = () => {
  return useQuery({
    queryKey: ["ai-data", "external-factors"],
    queryFn: getExternalFactors,
    initialData: [],
  });
};

export const useCreateExternalFactor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExternalFactor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-data"] });
      queryClient.invalidateQueries({ queryKey: ["forecast"] });
    },
  });
};
