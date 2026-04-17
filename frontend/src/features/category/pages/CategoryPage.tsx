import { useState } from "react";
import { message } from "antd";

import CategoryTable from "../components/CategoryTable";
import CategoryFormModal from "../components/CategoryFormModal";
import Button from "@/components/common/button";
import LoadingPage from "@/components/common/LoadingPage";
import EmptyState from "@/components/common/EmptyState";
import ModalConfirm from "@/components/common/ModalConfirm";

import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../hooks";

import type { Category } from "../types";

interface CategoryFormValues {
  name: string;
  description?: string;
}

export default function CategoryPage() {
  const { data, isLoading } = useCategories();

  const categories: Category[] = Array.isArray(data) ? data : [];
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const handleCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (record: Category) => {
    setEditing(record);
    setModalOpen(true);
  };

  const handleSubmit = (values: CategoryFormValues) => {
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, data: values },
        {
          onSuccess: () => {
            message.success("Cập nhật danh mục thành công");
            setModalOpen(false);
          },
        }
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          message.success("Thêm danh mục thành công");
          setModalOpen(false);
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    ModalConfirm({
      title: "Xác nhận xóa danh mục",
      content: "Dữ liệu danh mục sẽ bị xóa vĩnh viễn. Bạn có chắc chắn không?",
      onOk: () =>
        deleteMutation.mutate(id, {
          onSuccess: () => message.success("Đã xóa danh mục thành công"),
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
          Quản lý Danh mục
        </h2>
        <Button type="primary" onClick={handleCreate}>
          + Thêm danh mục
        </Button>
      </div>

      {categories.length > 0 ? (
        <CategoryTable
          data={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <EmptyState description="Chưa có danh mục nào">
          <Button type="primary" onClick={handleCreate}>
            Thêm danh mục đầu tiên
          </Button>
        </EmptyState>
      )}

      <CategoryFormModal
        open={modalOpen}
        editing={editing}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}