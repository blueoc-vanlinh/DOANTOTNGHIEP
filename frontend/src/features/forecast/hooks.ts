import { useQuery } from "@tanstack/react-query";
import { getForecast } from "./api";

export const useForecast = (product_id: number) => {
    return useQuery({
        queryKey: ["forecast", product_id],
        queryFn: () => getForecast(product_id),
        enabled: !!product_id,
    });
};