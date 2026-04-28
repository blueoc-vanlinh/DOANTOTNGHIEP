import { useState } from "react";
import { message } from "antd";

import WarehouseTable from "../components/WarehouseTable";
import WarehouseFormModal from "../components/WarehouseFormModal";
import Button from "@/components/common/button";
import LoadingPage from "@/components/common/LoadingPage";
import EmptyState from "@/components/common/EmptyState";
import ModalConfirm from "@/components/common/ModalConfirm";
import PaginationBar from "@/components/common/PaginationBar";

import {
    useWarehouses,
    useCreateWarehouse,
    useUpdateWarehouse,
    useDeleteWarehouse,
} from "../hooks";

import type { Warehouse } from "../types";

interface WarehouseFormValues {
    name: string;
    location?: string;
    description?: string;
}

export default function WarehousePage() {

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const { data, isLoading } = useWarehouses({
        page,
        page_size: pageSize,
    });

    const warehouses = data?.items || [];
    const total = data?.meta?.total || 0;

    const createMutation = useCreateWarehouse();
    const updateMutation = useUpdateWarehouse();
    const deleteMutation = useDeleteWarehouse();

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Warehouse | null>(null);

    const handleCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const handleEdit = (record: Warehouse) => {
        setEditing(record);
        setModalOpen(true);
    };

    const handleSubmit = (values: WarehouseFormValues) => {
        if (editing) {
            updateMutation.mutate(
                { id: editing.id, data: values },
                {
                    onSuccess: () => {
                        message.success("Cập nhật kho thành công");
                        setModalOpen(false);
                    },
                }
            );
        } else {
            createMutation.mutate(values, {
                onSuccess: () => {
                    message.success("Thêm kho mới thành công");
                    setModalOpen(false);
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        ModalConfirm({
            title: "Xác nhận xóa kho",
            content: "Bạn có chắc chắn muốn xóa kho này?",
            onOk: () =>
                deleteMutation.mutate(id, {
                    onSuccess: () => message.success("Đã xóa kho thành công"),
                }),
        });
    };

    const handlePageChange = (page: number, pageSize: number) => {
        setPage(page);
        setPageSize(pageSize);
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
                <h2 style={{ fontSize: 24, fontWeight: 600 }}>
                    Quản lý Kho hàng ({total})
                </h2>

                <Button type="primary" onClick={handleCreate}>
                    + Thêm kho
                </Button>
            </div>

            {warehouses.length > 0 ? (
                <>
                    <WarehouseTable
                        data={warehouses}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />

                    {/* ✅ PAGINATION */}
                    <PaginationBar
                        current={page}
                        pageSize={pageSize}
                        total={total}
                        onChange={handlePageChange}
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total) => `Tổng cộng ${total} kho`}
                    />
                </>
            ) : (
                <EmptyState description="Chưa có kho hàng nào">
                    <Button type="primary" onClick={handleCreate}>
                        Thêm kho đầu tiên
                    </Button>
                </EmptyState>
            )}

            <WarehouseFormModal
                open={modalOpen}
                editing={editing}
                onCancel={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                loading={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}