export type TransactionType = "EXPORT" | "IMPORT";

export interface Transaction {
    id: number;
    product_id: number;
    warehouse_id: number;
    quantity: number;
    type: TransactionType;
    reference_type?: string;
    reference_id?: number;
    created_at?: string;
}