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
