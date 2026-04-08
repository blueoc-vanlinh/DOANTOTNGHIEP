
import { useState } from "react";
import { message } from "antd";

import ProductTable from "../components/ProductTable";
import ProductFormModal from "../components/ProductFormModal";
import Button from "@/components/common/button";
import LoadingPage from "@/components/common/LoadingPage";
import EmptyState from "@/components/common/EmptyState";
import ModalConfirm from "@/components/common/ModalConfirm";

import {
    useProducts,
    useCreateProduct,
    useUpdateProduct,
    useDeleteProduct,
} from "../hooks";
import type { ProductInput } from "../api";
import type { Product } from "../types";

export default function ProductsPage() {
    const { data, isLoading } = useProducts();

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
            updateMutation.mutate(
                { id: editingProduct.id, data: values },
                {
                    onSuccess: () => {
                        message.success("Cập nhật sản phẩm thành công");
                        setModalOpen(false);
                    },
                }
            );
        } else {
            createMutation.mutate(values, {
                onSuccess: () => {
                    message.success("Tạo sản phẩm mới thành công");
                    setModalOpen(false);
                },
            });
        }
    };

    const confirmDelete = (id: number) => {
        ModalConfirm({
            title: "Xác nhận xóa sản phẩm",
            content: "Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.",
            onOk: () =>
                deleteMutation.mutate(id, {
                    onSuccess: () => message.success("Đã xóa sản phẩm thành công"),
                }),
        });
    };

    if (isLoading) return <LoadingPage />;

    return (
        <div>
            {/* Page Header */}
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 600 }}>
                    Quản lý Sản phẩm
                </h2>
                <Button type="primary" onClick={handleCreate}>
                    + Thêm sản phẩm
                </Button>
            </div>

            {/* Product Table */}
            {data && data.length > 0 ? (
                <ProductTable
                    data={data}
                    onEdit={handleEdit}
                    onDelete={confirmDelete}
                />
            ) : (
                <EmptyState
                    description="Chưa có sản phẩm nào trong hệ thống"
                >
                    <Button type="primary" onClick={handleCreate}>
                        Tạo sản phẩm đầu tiên
                    </Button>
                </EmptyState>
            )}

            {/* Form Modal */}
            <ProductFormModal
                open={modalOpen}
                editing={editingProduct}
                onCancel={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                loading={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}