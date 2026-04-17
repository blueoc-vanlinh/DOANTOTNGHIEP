
import { useState } from "react";

import ProductTable from "../components/ProductTable";
import ProductFormModal from "../components/ProductFormModal";
import Button from "@/components/common/button";
import LoadingPage from "@/components/common/LoadingPage";
import EmptyState from "@/components/common/EmptyState";
import ModalConfirm from "@/components/common/ModalConfirm";
import PaginationBar from "@/components/common/PaginationBar";

import { useCategories } from "@/features/category/hooks";
import {
    useProducts,
    useCreateProduct,
    useUpdateProduct,
    useDeleteProduct,
} from "../hooks";

import type { Product, ProductInput } from "../types";

export default function ProductsPage() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const { data: responseData, isLoading } = useProducts({
        page,
        pageSize,
    });

    const products: Product[] = responseData?.items || [];
    const total: number = responseData?.total || 0;

    const { data } = useCategories();
    const categories = Array.isArray(data) ? data : [];

    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const createMutation = useCreateProduct();
    const updateMutation = useUpdateProduct();
    const deleteMutation = useDeleteProduct();

    const handleCreate = () => {
        setEditingProduct(null);
        setModalOpen(true);
    };

    const handleEdit = (record: Product) => {
        setEditingProduct(record);
        setModalOpen(true);
    };

    const handleSubmit = (values: ProductInput) => {
        if (editingProduct) {
            updateMutation.mutate({ id: editingProduct.id, data: values });
        } else {
            createMutation.mutate(values);
        }
        setModalOpen(false);
    };

    const confirmDelete = (id: number) => {
        ModalConfirm({
            title: "Xác nhận xóa sản phẩm",
            content: "Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.",
            onOk: () => deleteMutation.mutate(id),
        });
    };

    const handlePageChange = (newPage: number, newPageSize: number) => {
        setPage(newPage);
        if (newPageSize !== pageSize) {
            setPageSize(newPageSize);
            setPage(1);
        }
    };

    if (isLoading) return <LoadingPage />;

    return (
        <div>
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 600 }}>
                    Quản lý Sản phẩm
                </h2>
                <Button type="primary" onClick={handleCreate}>
                    + Thêm sản phẩm
                </Button>
            </div>

            {products.length > 0 ? (
                <>
                    <ProductTable
                        data={products}
                        onEdit={handleEdit}
                        onDelete={confirmDelete}
                    />

                    <PaginationBar
                        current={page}
                        pageSize={pageSize}
                        total={total}
                        onChange={handlePageChange}
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total) => `Tổng cộng ${total} sản phẩm`}
                    />
                </>
            ) : (
                <EmptyState description="Chưa có sản phẩm nào trong hệ thống">
                    <Button type="primary" onClick={handleCreate}>
                        Tạo sản phẩm đầu tiên
                    </Button>
                </EmptyState>
            )}

            <ProductFormModal
                open={modalOpen}
                editing={editingProduct}
                categories={categories}
                onCancel={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                loading={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}