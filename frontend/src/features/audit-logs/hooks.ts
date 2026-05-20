import { useQuery } from "@tanstack/react-query";

import { getAuditLogs } from "./api";

export const useAuditLogs = (params?: {
  search?: string;
  action?: string;
  success?: boolean;
  page?: number;
  page_size?: number;
}) => {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => getAuditLogs(params),
  });
};
