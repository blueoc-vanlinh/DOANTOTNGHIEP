export interface ForecastPoint {
    date: string;
    predicted: number;
    trend: number;
    lower_bound: number;
    upper_bound: number;
    actual?: number;
    external_impact?: number;
    predicted_stock?: number;
    days_to_out_of_stock?: number | null;
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
    model_source?: string;
    model_accuracy?: number | null;
    accuracy_basis?: string | null;
    dataset_used?: string | null;
    train_points?: number;
    test_points?: number;
    ai_explanation?: string;
    trained_forecast_rows?: number;
    external_factors_used?: boolean;
    deep_learning_status?: string;
    history?: ForecastPoint[];

    data: ForecastPoint[];
}
