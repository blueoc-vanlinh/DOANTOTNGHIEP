import apiClient from "@/lib/api";
import type { LoginResponse, LoginRequest } from "./types";

export const loginApi = async (
    payload: LoginRequest
): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/login", payload);
    return response.data;
};
