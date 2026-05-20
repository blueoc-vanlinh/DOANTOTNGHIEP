export interface User {
    id: number;

    name: string;
    email: string;
    role_id?: number | null;
    role_name?: string | null;
    status: "ACTIVE" | "INACTIVE";

    created_at?: string;
    updated_at?: string;
}

export interface UsersResponse {
    items: User[];
    meta: {
        total: number;
        page: number;
        page_size: number;
    };
}

export interface UserInput {
    name: string;
    email: string;
    role_id?: number | null;
    status?: "ACTIVE" | "INACTIVE";
    password?: string;
}
