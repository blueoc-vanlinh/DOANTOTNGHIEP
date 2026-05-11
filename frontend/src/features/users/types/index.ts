export interface User {
    id: number;

    name: string;
    email: string;
    phone?: string;

    is_active: boolean;

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
    full_name: string;
    email: string;
    phone?: string;
    password?: string;
}