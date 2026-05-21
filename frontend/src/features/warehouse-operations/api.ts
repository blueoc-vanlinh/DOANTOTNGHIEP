import apiClient from "@/lib/api";

export const createStorageBin = async (data: Record<string, unknown>) => {
  const res = await apiClient.post("/warehouse-operations/bins", data);
  return res.data;
};

export const createInventoryBatch = async (data: Record<string, unknown>) => {
  const res = await apiClient.post("/warehouse-operations/batches", data);
  return res.data;
};

export const createReturnOrder = async (data: Record<string, unknown>) => {
  const res = await apiClient.post("/warehouse-operations/returns", data);
  return res.data;
};

export const createStocktake = async (data: Record<string, unknown>) => {
  const res = await apiClient.post("/warehouse-operations/stocktakes", data);
  return res.data;
};

export const completeStocktake = async (stocktakeId: number) => {
  const res = await apiClient.post(`/warehouse-operations/stocktakes/${stocktakeId}/complete`);
  return res.data;
};

export const createPurchaseOrder = async (data: Record<string, unknown>) => {
  const res = await apiClient.post("/warehouse-operations/purchase-orders", data);
  return res.data;
};

export const receivePurchaseOrder = async (poId: number) => {
  const res = await apiClient.post(`/warehouse-operations/purchase-orders/${poId}/receive`);
  return res.data;
};

export const cancelImportOrder = async (orderId: number) => {
  const res = await apiClient.post(`/warehouse-operations/imports/${orderId}/cancel`);
  return res.data;
};

export const cancelExportOrder = async (orderId: number) => {
  const res = await apiClient.post(`/warehouse-operations/exports/${orderId}/cancel`);
  return res.data;
};
