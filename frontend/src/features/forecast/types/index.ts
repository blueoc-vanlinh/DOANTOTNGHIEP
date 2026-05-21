export interface ForecastPoint {
    date: string;
    predicted: number;
    trend: number;
    lower_bound: number;
    upper_bound: number;
    actual?: number;
    external_impact?: number;
}

export interface ForecastResponse {
    product_id: number;
    product_name: string;
    current_inventory: number;
    reserved_quantity: number;
    oncoming_quantity: number;
    available_quantity: number;
    min_threshold: number;

    forecast_days: number;

    recommended_import: number;

    warning?: string;
    model_used?: string;
    external_factors_used?: boolean;
    deep_learning_status?: string;
    history?: ForecastPoint[];

    data: ForecastPoint[];
}
