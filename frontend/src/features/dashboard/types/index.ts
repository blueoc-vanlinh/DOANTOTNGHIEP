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
}

export interface DashboardResponse {
    summary: DashboardSummary;

    low_stock_products: LowStockProduct[];

    recent_transactions: RecentTransaction[];

    transaction_chart: ChartData[];
}