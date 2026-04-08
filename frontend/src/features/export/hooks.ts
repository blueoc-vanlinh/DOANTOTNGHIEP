import { useMutation } from "@tanstack/react-query";
import { createExport } from "./api";

export const useExport = () => {
    return useMutation({
        mutationFn: createExport,
    });
};