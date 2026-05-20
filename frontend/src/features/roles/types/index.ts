export interface Permission {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface RoleInput {
  name: string;
  permission_ids: number[];
}
