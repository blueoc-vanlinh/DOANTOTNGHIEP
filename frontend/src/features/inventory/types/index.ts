
export interface Inventory {
    id: number;

    product_id: number;
    product_name: string;

    warehouse_id: number;
    warehouse_name: string;

    quantity: number;
    reserved_quantity: number;
    oncoming_quantity: number;

    min_threshold: number;

    is_deleted: boolean;

    created_at: string;
    updated_at: string;
}
export interface InventoryResponse {
    items: Inventory[];
    total: number;
    page: number;
    page_size: number;
}
export interface InventoryInput {
    product_id: number;
    warehouse_id: number;
    quantity: number;
}