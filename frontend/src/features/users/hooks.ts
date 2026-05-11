import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
} from "./api";


export const useUsers = (params: {
    page: number;
    page_size: number;
    search?: string;
}) => {

    return useQuery({
        queryKey: ["users", params],
        queryFn: () => getUsers(params),
    });
};


export const useCreateUser = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: createUser,

        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: ["users"],
            });
        },
    });
};


export const useUpdateUser = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: updateUser,

        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: ["users"],
            });
        },
    });
};


export const useDeleteUser = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: deleteUser,

        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: ["users"],
            });
        },
    });
};


export const useToggleUserStatus = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: toggleUserStatus,

        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: ["users"],
            });
        },
    });
};