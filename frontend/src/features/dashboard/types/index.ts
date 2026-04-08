
export interface DashboardSummary {
    total_products: number;
    total_inventory: number;
    total_imports: number;
    total_exports: number;
}
export interface ChartItem {
    date: string;
    import: number;
    export: number;
}

export interface DashboardResponse {
    summary: DashboardSummary;
    chartData: ChartItem[];
}