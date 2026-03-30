import apiClient from "@/lib/api";
import type { ImportInput } from "./types";

export const createImport = async (data: ImportInput) => {
    const res = await apiClient.post("/import/", data);
    return res.data;
};