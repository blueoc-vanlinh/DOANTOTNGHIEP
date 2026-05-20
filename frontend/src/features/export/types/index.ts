export interface ExportItem {
    product_id: number;
    warehouse_id: number;
    quantity: number;
    price?: number;
}

export interface ExportInput {
    customer_name: string;
    vat_rate?: number;

    items: ExportItem[];
}

export interface ExportResponse {
    order: {
        id: number;
        order_code?: string | null;
        customer_name: string;
        total_amount: number;
        tax_amount: number;
        grand_total: number;
        status: string;
    };
    invoice: {
        id: number;
        invoice_number: string;
        grand_total: number;
        status: string;
    };
}
