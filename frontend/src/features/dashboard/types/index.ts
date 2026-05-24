export interface DashboardSummary {
    total_products: number;

    total_warehouses: number;

    total_inventory: number;

    total_import_orders: number;

    total_export_orders: number;

    import_today: number;

    export_today: number;

    total_import_value: number;

    total_export_value: number;

    monthly_import_value: number;

    monthly_export_value: number;

    period_import_orders: number;

    period_export_orders: number;

    period_import_value: number;

    period_export_value: number;

    period_profit: number;

    inventory_value: number;

    low_stock_count: number;

    out_of_stock_count: number;
}

export interface LowStockProduct {
    inventory_id: number;

    product_id: number;

    product_name: string;

    warehouse_id: number;

    warehouse_name: string;

    quantity: number;

    min_threshold: number;
}

export interface RecentTransaction {
    id: number;

    type: string;

    product_id: number;

    product_name: string;

    warehouse_id: number;

    warehouse_name: string;

    quantity: number;

    reference_type: string;

    reference_id: number;

    created_at: string;
}

export interface ChartData {
    date: string;

    import: number;

    export: number;

    import_value: number;

    export_value: number;
}

export interface DashboardResponse {
    summary: DashboardSummary;

    low_stock_products: LowStockProduct[];

    recent_transactions: RecentTransaction[];

    transaction_chart: ChartData[];

    top_export_products: Array<{
        product_id: number;
        product_name: string;
        total_export: number;
    }>;

    top_import_products: Array<{
        product_id: number;
        product_name: string;
        total_import: number;
    }>;

    period: {
        type: "day" | "month" | "year";
        start: string;
        end: string;
        chart_label: string;
    };

    ai_status?: {
        best_model?: string | null;
        accuracy?: number | null;
        dataset_used?: string | null;
        train_points?: number;
        test_points?: number;
        last_train_at?: string | null;
        forecast_rows: number;
        forecast_product_count: number;
        recommended_import_count: number;
        risk_product_count: number;
    };
}
