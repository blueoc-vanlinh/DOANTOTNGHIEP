export interface LoginRequest {
    email: string;
    password: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
}

export interface LoginResponse {
    accessToken: string;
    user: User;
}