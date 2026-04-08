export interface ForecastPoint {
    date: string;
    predicted: number;
}
export interface ForecastResponse {
    product_id: number;
    data: ForecastPoint[];
}