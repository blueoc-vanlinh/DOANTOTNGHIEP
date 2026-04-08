
export interface ExportItem {
    product_id: number;
    quantity: number;
    price: number;
}

export interface ExportInput {
    customer_name: string;
    warehouse_id: number;
    items: ExportItem[];
}
