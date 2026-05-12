export interface ForecastPoint {
    date: string;
    predicted: number;
    trend: number;
    lower_bound: number;
    upper_bound: number;
}

export interface ForecastResponse {
    product_id: number;
    product_name: string;

    forecast_days: number;

    recommended_import: number;

    warning?: string;

    data: ForecastPoint[];
}