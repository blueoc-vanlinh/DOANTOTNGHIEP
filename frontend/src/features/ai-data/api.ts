import apiClient from "@/lib/api";
import type {
  AiDataOverview,
  AiModelBenchmarks,
  DeepLearningDataset,
  ExternalFactor,
  ExternalFactorInput,
  ProductTrainingQuality,
} from "./types";

export const getAiDataOverview = async (): Promise<AiDataOverview> => {
  const res = await apiClient.get("/ai-data/overview");
  return res.data;
};

export const getAiModelBenchmarks = async (): Promise<AiModelBenchmarks> => {
  const res = await apiClient.get("/ai-data/model-benchmarks");
  return res.data;
};

export const trainAiForecast = async () => {
  const res = await apiClient.post("/forecast/train");
  return res.data;
};

export const getProductTrainingQuality = async (
  productId: number
): Promise<ProductTrainingQuality> => {
  const res = await apiClient.get(`/ai-data/products/${productId}/quality`);
  return res.data;
};

export const getDeepLearningDataset = async (
  productId: number
): Promise<DeepLearningDataset> => {
  const res = await apiClient.get(
    `/ai-data/products/${productId}/deep-learning-dataset`
  );
  return res.data;
};

export const getExternalFactors = async (): Promise<ExternalFactor[]> => {
  const res = await apiClient.get("/ai-data/external-factors");
  return res.data;
};

export const createExternalFactor = async (
  data: ExternalFactorInput
): Promise<ExternalFactor> => {
  const res = await apiClient.post("/ai-data/external-factors", data);
  return res.data;
};
