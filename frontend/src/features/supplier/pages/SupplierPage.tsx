import { useState } from "react";
import { message } from "antd";

import SupplierTable from "../components/SupplierTable";
import SupplierFormModal from "../components/SupplierFormModal";
import Button from "@/components/common/button";
import LoadingPage from "@/components/common/LoadingPage";
import EmptyState from "@/components/common/EmptyState";
import ModalConfirm from "@/components/common/ModalConfirm";

import {
    useSuppliers,
    useCreateSupplier,
    useUpdateSupplier,
    useDeleteSupplier,
} from "../hooks";

import type { Supplier } from "../types";
import PaginationBar from "@/components/common/PaginationBar";

interface SupplierFormValues {
    name: string;
    phone?: string;
    email?: string;
}

export default function SupplierPage() {
    const handlePageChange = (page: number, pageSize: number) => {
        setPage(page);
        setPageSize(pageSize);
    };
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const { data, isLoading } = useSuppliers({
        page,
        page_size: pageSize,
    });

    const suppliers = data?.items || [];
    const total = data?.meta?.total || 0;
    const createMutation = useCreateSupplier();
    const updateMutation = useUpdateSupplier();
    const deleteMutation = useDeleteSupplier();

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Supplier | null>(null);

    const handleCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const handleEdit = (record: Supplier) => {
        setEditing(record);
        setModalOpen(true);
    };

    const handleSubmit = (values: SupplierFormValues) => {
        if (editing) {
            updateMutation.mutate(
                { id: editing.id, data: values },
                {
                    onSuccess: () => {
                        message.success("Cập nhật nhà cung cấp thành công");
                        setModalOpen(false);
                    },
                }
            );
        } else {
            createMutation.mutate(values, {
                onSuccess: () => {
                    message.success("Thêm nhà cung cấp thành công");
                    setModalOpen(false);
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        ModalConfirm({
            title: "Xác nhận xóa nhà cung cấp",
            content: "Dữ liệu nhà cung cấp sẽ bị xóa vĩnh viễn. Bạn có chắc chắn không?",
            onOk: () =>
                deleteMutation.mutate(id, {
                    onSuccess: () => message.success("Đã xóa nhà cung cấp thành công"),
                }),
        });
    };

    if (isLoading) return <LoadingPage />;

    return (
        <div>
            <div
                style={{
                    marginBottom: 24,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 600 }}>
                    Quản lý Nhà cung cấp
                </h2>
                <Button type="primary" onClick={handleCreate}>
                    + Thêm nhà cung cấp
                </Button>
            </div>
            {suppliers.length > 0 ? (
                <>
                    <SupplierTable
                        data={suppliers}
                        onEdit={handleEdit}
                        onDelete={handleDelete}

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
                <EmptyState description="Chưa có nhà cung cấp nào">
                    <Button type="primary" onClick={handleCreate}>
                        Thêm nhà cung cấp đầu tiên
                    </Button>
                </EmptyState>
            )}
            <SupplierFormModal
                open={modalOpen}
                editing={editing}
                onCancel={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                loading={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}