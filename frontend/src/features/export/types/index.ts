export interface ExportItem {
    product_id: number;
    warehouse_id: number;
    quantity: number;
    price: number;
}

export interface ExportInput {
    customer_name: string;

    items: ExportItem[];
}

export interface ExportResponse {
    order: {
        id: number;
        customer_name: string;
        total_amount: number;
        status: string;
    };
    invoice: {
        id: number;
        invoice_number: string;
        grand_total: number;
        status: string;
    };
}
