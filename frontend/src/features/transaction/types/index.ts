export type TransactionType =
    | "EXPORT"
    | "IMPORT"
    | "ADJUST"
    | "CUSTOMER_RETURN"
    | "SUPPLIER_RETURN"
    | "STOCKTAKE_ADJUST"
    | "PO_RECEIVE"
    | "IMPORT_CANCEL"
    | "EXPORT_CANCEL";

export interface Transaction {
    id: number;

    product_id: number;
    product_name: string;

    warehouse_id: number;
    warehouse_name: string;

    quantity: number;
    balance_after: number;

    type: TransactionType;

    reference_type?: string;
    reference_id?: number;

    created_at?: string;
}

export interface TransactionResponse {
    items: Transaction[];
    meta: {
        total: number;
        page: number;
        page_size: number;
    };
}
