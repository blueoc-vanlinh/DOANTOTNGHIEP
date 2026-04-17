// src/pages/inventory/InventoryPage.tsx
import { useState } from "react";
import { message } from "antd";

import InventoryTable from "../components/InventoryTable";
import InventoryFormModal from "../components/InventoryFormModal";
import LoadingPage from "@/components/common/LoadingPage";
import EmptyState from "@/components/common/EmptyState";

import { useInventory, useUpdateInventory } from "../hooks";
import type { Inventory } from "../types";

export default function InventoryPage() {
  const { data, isLoading } = useInventory();

  const inventory: Inventory[] = Array.isArray(data) ? data : [];
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

  if (isLoading) return <LoadingPage />;

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 600 }}>
          Quản lý Tồn kho
        </h2>
      </div>

      {inventory.length > 0 ? (
        <InventoryTable
          data={inventory}
          onEdit={handleEdit}
        />
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