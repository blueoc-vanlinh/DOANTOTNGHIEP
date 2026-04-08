import apiClient from "@/lib/api";
import type { ExportInput } from "./types";

export const createExport = async (data: ExportInput) => {
    const res = await apiClient.post("/export/", data);
    return res.data;
};