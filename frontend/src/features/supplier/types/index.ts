export interface Supplier {
    id: number;
    name: string;
    phone?: string;
    email?: string;
    created_at?: string;
    updated_at?: string;
}


export type SupplierInput = Omit<Supplier, "id" | "created_at" | "updated_at">;