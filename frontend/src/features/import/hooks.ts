import { useMutation } from "@tanstack/react-query";
import { createImport } from "./api";

export const useImport = () => {
    return useMutation({
        mutationFn: createImport,
    });
};