import { useState } from "react";
import { message } from "antd";

import InventoryTable from "../components/InventoryTable";
import InventoryFormModal from "../components/InventoryFormModal";
import LoadingPage from "@/components/common/LoadingPage";
import EmptyState from "@/components/common/EmptyState";
import PaginationBar from "@/components/common/PaginationBar";

import { useInventory, useUpdateInventory } from "../hooks";
import type { Inventory } from "../types";

export default function InventoryPage() {

  // ✅ state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ✅ API
  const { data, isLoading } = useInventory({
    page,
    page_size: pageSize,
  });

  const inventory = data?.items || [];
  const total = data?.total || 0;

  const updateMutation = useUpdateInventory();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Inventory | null>(null);

  const handleEdit = (record: Inventory) => {
    setEditing(record);
    setModalOpen(true);
  };

  const handleSubmit = (values: { quantity: number }) => {
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, data: values },
        {
          onSuccess: () => {
            message.success("Cập nhật tồn kho thành công");
            setModalOpen(false);
          },
        }
      );
    }
  };

  // ✅ pagination handler (đặt SAU useState)
  const handlePageChange = (page: number, pageSize: number) => {
    setPage(page);
    setPageSize(pageSize);
  };

  if (isLoading) return <LoadingPage />;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600 }}>
          Quản lý Tồn kho ({total})
        </h2>
      </div>

      {inventory.length > 0 ? (
        <>
          <InventoryTable
            data={inventory}
            onEdit={handleEdit}
          />

          {/* ✅ FIX: thêm pagination */}
          <PaginationBar
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={handlePageChange}
            showSizeChanger
          />
        </>
      ) : (
        <EmptyState description="Chưa có dữ liệu tồn kho nào" />
      )}

      <InventoryFormModal
        open={modalOpen}
        editing={editing}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={updateMutation.isPending}
      />
    </div>
  );
}