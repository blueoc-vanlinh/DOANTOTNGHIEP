export interface Warehouse {
    id: number;
    name: string;
    location?: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
}

export interface WarehouseResponse {
    items: Warehouse[];
    meta: {
        total: number;
        page: number;
        page_size: number;
    };
}

export type WarehouseInput = Omit<
    Warehouse,
    "id" | "created_at" | "updated_at"
>;