
export interface ImportItem {
    product_id: number;
    warehouse_id: number;
    quantity: number;
    unit_cost: number;
}

export interface ImportInput {
    supplier_id: number;

    items: ImportItem[];
}
