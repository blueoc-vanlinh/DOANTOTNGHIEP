export interface Category {
    id: number;
    name: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CategoryResponse {
    items: Category[];
    meta: {
        total: number;
        page: number;
        page_size: number;
    };
}

export type CategoryInput = Omit<Category, "id" | "created_at" | "updated_at">;