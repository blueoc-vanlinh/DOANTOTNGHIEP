
export interface ImportItem {
    product_id: number;
    warehouse_id: number;
    quantity: number;
    unit_cost: number;
}

export interface ImportInput {
    supplier_id: number;
    import_type?: string;
    vat_rate?: number;
    auto_complete?: boolean;

    items: ImportItem[];
}

export interface ImportOrder {
    id: number;
    order_code?: string | null;
    import_type?: string;
    supplier_id: number;
    supplier_name?: string | null;
    total_amount: number;
    tax_amount: number;
    grand_total: number;
    status: "PENDING" | "APPROVED" | "COMPLETED" | "CANCELLED";
    created_at?: string;
    updated_at?: string;
}

export interface ImportOrdersResponse {
    items: ImportOrder[];
    total: number;
    page: number;
    page_size: number;
}
