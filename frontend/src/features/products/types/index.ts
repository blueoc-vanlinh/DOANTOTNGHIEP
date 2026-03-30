
export interface Product {
    id: number;
    name: string;
    sku: string;
    price: number;
    barcode?: string | null;
    category_id?: number | null;
    status: "ACTIVE" | "INACTIVE";
    created_at?: string;
    updated_at?: string;
}