import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInventory, updateInventory } from "./api";

export const useInventory = () => {
    return useQuery({
        queryKey: ["inventory"],
        queryFn: getInventory,
    });
};

export const useUpdateInventory = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: updateInventory,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
    });
};