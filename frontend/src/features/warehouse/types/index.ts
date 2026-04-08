export interface Warehouse {
    id: number;
    name: string;
    location?: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
}


export type WarehouseInput = Omit<Warehouse, "id" | "created_at" | "updated_at">;