export interface AuditLog {
  id: number;
  user_id?: number | null;
  user_name?: string | null;
  actor: string;
  action: string;
  table_name: string;
  record_id?: number | null;
  method?: string | null;
  path?: string | null;
  status_code?: number | null;
  success: boolean;
  ip_address?: string | null;
  user_agent?: string | null;
  description?: string | null;
  created_at: string;
}

export interface AuditLogResponse {
  items: AuditLog[];
  total: number;
  page: number;
  page_size: number;
}
