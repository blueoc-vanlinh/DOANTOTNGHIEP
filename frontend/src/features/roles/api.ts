import apiClient from "@/lib/api";
import type { Permission, Role, RoleInput } from "./types";

export const getRoles = async (): Promise<Role[]> => {
  const res = await apiClient.get("/roles/");
  return res.data;
};

export const getPermissions = async (): Promise<Permission[]> => {
  const res = await apiClient.get("/roles/permissions");
  return res.data;
};

export const createRole = async (data: RoleInput): Promise<Role> => {
  const res = await apiClient.post("/roles/", data);
  return res.data;
};

export const updateRole = async ({
  id,
  data,
}: {
  id: number;
  data: Partial<RoleInput>;
}): Promise<Role> => {
  const res = await apiClient.put(`/roles/${id}`, data);
  return res.data;
};

export const deleteRole = async (id: number): Promise<void> => {
  await apiClient.delete(`/roles/${id}`);
};
