
export interface Category {
    id: number;
    name: string;
}

export interface Product {
    id: number;
    name: string;
    sku: string;
    price: number;
    barcode?: string | null;
    category_id?: number | null;
    category?: Category | null;
    dimensions?: {
        depth?: number;
        width?: number;
        height?: number;
    } | null;
    weight?: number | null;
    status: "ACTIVE" | "INACTIVE";
    created_at?: string;
    updated_at?: string;
    is_deleted?: boolean;
}

export interface GetProductsParams {
    search?: string;
    category_id?: number;
    page?: number;
    pageSize?: number;
}
export interface ProductsResponse {
    items: Product[];
    total: number;
    page: number;
    page_size: number;
    search?: string;
}

export interface ProductImportError {
    row: number;
    message: string;
}

export interface ProductImportResponse {
    file_name: string;
    total_rows: number;
    created_count: number;
    updated_count: number;
    error_count: number;
    errors: ProductImportError[];
    error_report_file_name?: string | null;
    error_report_content_base64?: string | null;
}

export type ProductInput = {
    name: string;
    sku: string;
    price: number;
    barcode?: string | null;
    category_id?: number | null;
    status?: "ACTIVE" | "INACTIVE";
    dimensions?: {
        depth?: number;
        width?: number;
        height?: number;
    } | null;
    weight?: number | null;
};
