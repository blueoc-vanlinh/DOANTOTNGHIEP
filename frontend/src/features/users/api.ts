import apiClient from "@/lib/api";

import type {
    User,
    UserInput,
    UsersResponse,
} from "./types";


export const getUsers = async (params: {
    page?: number;
    page_size?: number;
    search?: string;
}) => {
    const res = await apiClient.get<UsersResponse>(
        "/users/",
        { params }
    );

    return res.data;
};


export const createUser = async (
    data: UserInput
): Promise<User> => {

    const res = await apiClient.post<User>(
        "/users/",
        data
    );

    return res.data;
};


export const updateUser = async ({
    id,
    data,
}: {
    id: number;
    data: Partial<UserInput>;
}): Promise<User> => {

    const res = await apiClient.put<User>(
        `/users/${id}`,
        data
    );

    return res.data;
};


export const deleteUser = async (
    id: number
) => {
    await apiClient.delete(`/users/${id}`);
};


export const toggleUserStatus = async (
    id: number
) => {
    const res = await apiClient.patch(
        `/users/${id}/toggle-status`
    );

    return res.data;
};