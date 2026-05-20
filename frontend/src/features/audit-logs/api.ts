import apiClient from "@/lib/api";
import type { AuditLogResponse } from "./types";

export const getAuditLogs = async (params?: {
  search?: string;
  action?: string;
  success?: boolean;
  page?: number;
  page_size?: number;
}): Promise<AuditLogResponse> => {
  const res = await apiClient.get("/audit-logs/", { params });
  return res.data;
};
