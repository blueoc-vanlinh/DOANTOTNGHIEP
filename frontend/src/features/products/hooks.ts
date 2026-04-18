import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} from "./api";
import type { Product } from "./types";
import { useCategories } from "@/features/category/hooks";
import type { ProductsResponse } from "./types";

export const useProducts = (params?: {
    search?: string;
    category_id?: number;
    page?: number;
    pageSize?: number;
}) => {
    return useQuery({
        queryKey: [
            "products",
            params?.page,
            params?.pageSize,
            params?.search,
            params?.category_id,
        ],

        queryFn: () =>
            getProducts({
                search: params?.search,
                category_id: params?.category_id,
                page: params?.page || 1,
                pageSize: params?.pageSize || 10,
            }),
        initialData: {
            items: [],
            total: 0,
            page: params?.page || 1,
            page_size: params?.pageSize || 10,
        },
        placeholderData: (prev) => prev,
        staleTime: 0,
    });
};
export const useCreateProduct = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: createProduct,

        onSuccess: (newProduct) => {
            qc.setQueriesData({ queryKey: ["products"] }, (old: ProductsResponse | undefined) => {
                if (!old) return { items: [newProduct], total: 1 };

                return {
                    ...old,
                    items: [newProduct, ...(old.items || [])],
                    total: (old.total || 0) + 1,
                };
            });
        },
    });
};
export const useUpdateProduct = () => {
    const qc = useQueryClient();
    const { data: categories = [] } = useCategories();
    const findCategoryName = (id?: number | null) => {
        const cat = categories.find((c) => c.id === id);
        return cat?.name || "";
    };
    return useMutation({
        mutationFn: updateProduct,

        onSuccess: (updatedProduct) => {
            qc.setQueriesData({ queryKey: ["products"] }, (old: ProductsResponse | undefined) => {
                if (!old) return old;

                return {
                    ...old,
                    items: old.items.map((p: Product) => {
                        if (p.id !== updatedProduct.id) return p;

                        return {
                            ...p,
                            ...updatedProduct,
                            category: {
                                id: updatedProduct.category_id || 0,
                                name: findCategoryName(updatedProduct.category_id),
                            },
                        };
                    }),
                };
            });
        },
    });
};
export const useDeleteProduct = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: deleteProduct,

        onMutate: async (id: number) => {
            await qc.cancelQueries({ queryKey: ["products"] });

            const previous = qc.getQueriesData({ queryKey: ["products"] });

            qc.setQueriesData({ queryKey: ["products"] }, (old: Product[] | undefined) => {
                if (!old) return old;
                return old.filter((p: Product) => p.id !== id);
            });

            return { previous };
        },

        onError: (_err, _id, context) => {
            context?.previous.forEach(([key, data]) => {
                qc.setQueryData(key, data);
            });
        },

        onSettled: () => {
            qc.invalidateQueries({ queryKey: ["products"] });
        },
    });
};