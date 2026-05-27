export interface ExportItem {
    product_id: number;
    warehouse_id: number;
    quantity: number;
    price?: number;
}

export interface ExportInput {
    customer_name: string;
    export_type?: string;
    vat_rate?: number;
    auto_complete?: boolean;

    items: ExportItem[];
}

export interface ExportResponse {
    order: {
        id: number;
        order_code?: string | null;
        export_type?: string;
        customer_name: string;
        total_amount: number;
        tax_amount: number;
        grand_total: number;
        status: string;
    };
    invoice?: {
        id: number;
        invoice_number: string;
        grand_total: number;
        status: string;
    };
}

export interface ExportOrder {
    id: number;
    order_code?: string | null;
    export_type?: string;
    customer_name: string;
    total_amount: number;
    tax_amount: number;
    grand_total: number;
    status: "PENDING" | "APPROVED" | "COMPLETED" | "CANCELLED";
    created_at?: string;
    updated_at?: string;
}

export interface ExportOrdersResponse {
    items: ExportOrder[];
    total: number;
    page: number;
    page_size: number;
}
