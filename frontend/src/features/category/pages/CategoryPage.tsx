import { useState } from "react";
import { message } from "antd";

import CategoryTable from "../components/CategoryTable";
import CategoryFormModal from "../components/CategoryFormModal";
import Button from "@/components/common/button";
import LoadingPage from "@/components/common/LoadingPage";
import EmptyState from "@/components/common/EmptyState";
import ModalConfirm from "@/components/common/ModalConfirm";
import PaginationBar from "@/components/common/PaginationBar";

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

  // ✅ pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ✅ gọi API có params
  const { data, isLoading } = useCategories({
    page,
    page_size: pageSize,
  });

  // ✅ fix data
  const categories = data?.items || [];
  const total = data?.meta?.total || 0;

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

  // ✅ pagination handler
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
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 600 }}>
          Quản lý Danh mục ({total})
        </h2>

        <Button type="primary" onClick={handleCreate}>
          + Thêm danh mục
        </Button>
      </div>

      {categories.length > 0 ? (
        <>
          <CategoryTable
            data={categories}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* ✅ pagination giống products */}
          <PaginationBar
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={handlePageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `Tổng cộng ${total} danh mục`}
          />
        </>
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