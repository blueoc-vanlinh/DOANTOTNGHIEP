import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInventory, updateInventory } from "./api";

export const useInventory = (params: {
    page: number;
    page_size: number;
}) => {
    return useQuery({
        queryKey: ["inventory", params],
        queryFn: () => getInventory(params),
    });
};

export const useUpdateInventory = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: updateInventory,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
    });
};