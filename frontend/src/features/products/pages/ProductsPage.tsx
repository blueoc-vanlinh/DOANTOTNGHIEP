import { useState } from "react";

import { Input, Modal, Space, Upload, message } from "antd";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";

import { useDebounce } from "use-debounce";

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
    useDownloadProductImportTemplate,
    useImportProducts,
} from "../hooks";

import type {
    Product,
    ProductImportResponse,
    ProductInput,
} from "../types";

export default function ProductsPage() {

    const [page, setPage] =
        useState(1);

    const [pageSize, setPageSize] =
        useState(10);

    const [search, setSearch] =
        useState("");

    const [debouncedSearch] =
        useDebounce(search, 500);

    const {
        data: responseData,
        isLoading,
    } = useProducts({
        page,
        pageSize,
        search: debouncedSearch,
    });

    const products: Product[] =
        responseData?.items || [];

    const total: number =
        responseData?.total || 0;

    const {
        data: categoryRes,
    } = useCategories({
        page: 1,
        page_size: 100,
        search: "",
    });

    const categories =
        categoryRes?.items || [];

    const [modalOpen, setModalOpen] =
        useState(false);

    const [
        editingProduct,
        setEditingProduct,
    ] =
        useState<Product | null>(
            null
        );

    const createMutation =
        useCreateProduct();

    const updateMutation =
        useUpdateProduct();

    const deleteMutation =
        useDeleteProduct();

    const importMutation =
        useImportProducts();

    const downloadTemplateMutation =
        useDownloadProductImportTemplate();

    const handleCreate = () => {
        setEditingProduct(null);

        setModalOpen(true);
    };

    const handleEdit = (
        record: Product
    ) => {
        setEditingProduct(record);

        setModalOpen(true);
    };

    const handleSubmit = (
        values: ProductInput
    ) => {

        if (editingProduct) {

            updateMutation.mutate({
                id: editingProduct.id,
                data: values,
            });

        } else {

            createMutation.mutate(
                values
            );
        }

        setModalOpen(false);
    };

    const confirmDelete = (
        id: number
    ) => {

        ModalConfirm({
            title:
                "Xác nhận xóa sản phẩm",

            content:
                "Bạn có chắc chắn muốn xóa sản phẩm này?",

            onOk: () =>
                deleteMutation.mutate(
                    id
                ),
        });
    };

    const handlePageChange = (
        newPage: number,
        newPageSize: number
    ) => {

        setPage(newPage);

        if (
            newPageSize !==
            pageSize
        ) {

            setPageSize(
                newPageSize
            );

            setPage(1);
        }
    };

    const showImportResult = (
        result: ProductImportResponse
    ) => {
        const lines = result.errors
            .slice(0, 8)
            .map((item) => `Dong ${item.row}: ${item.message}`);

        Modal.info({
            title: "Ket qua nhap file san pham",
            width: 720,
            content: (
                <div style={{ marginTop: 12 }}>
                    <p>Tong dong: {result.total_rows}</p>
                    <p>Tao moi: {result.created_count}</p>
                    <p>Cap nhat: {result.updated_count}</p>
                    <p>Loi: {result.error_count}</p>
                    {lines.length > 0 && (
                        <div>
                            <p style={{ marginBottom: 8 }}>Chi tiet loi:</p>
                            <pre
                                style={{
                                    whiteSpace: "pre-wrap",
                                    background: "#fafafa",
                                    padding: 12,
                                    borderRadius: 8,
                                }}
                            >
                                {lines.join("\n")}
                            </pre>
                        </div>
                    )}
                </div>
            ),
        });
    };

    const downloadErrorReport = (result: ProductImportResponse) => {
        if (!result.error_report_content_base64) {
            return;
        }

        const binary = window.atob(result.error_report_content_base64);
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) {
            bytes[index] = binary.charCodeAt(index);
        }

        const blob = new Blob(
            [bytes],
            {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }
        );
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.error_report_file_name || "product-import-errors.xlsx";
        link.click();
        window.URL.revokeObjectURL(url);
    };

    const handleImportFile = (file: File) => {
        importMutation.mutate(file, {
            onSuccess: (result) => {
                if (result.created_count > 0 || result.updated_count > 0) {
                    message.success(
                        `Da nhap ${result.created_count} dong moi va cap nhat ${result.updated_count} dong`
                    );
                }
                if (result.error_count > 0) {
                    message.warning(
                        `${result.error_count} dong loi da duoc tach ra file Excel de ban sua`
                    );
                    downloadErrorReport(result);
                }
                if (result.created_count === 0 && result.updated_count === 0 && result.error_count === 0) {
                    message.info("Khong co du lieu nao duoc xu ly");
                }
                showImportResult(result);
            },
        });
        return false;
    };

    if (isLoading)
        return <LoadingPage />;

    return (

        <div>
            <div
                style={{
                    marginBottom: 24,

                    display: "flex",

                    justifyContent:
                        "space-between",

                    alignItems:
                        "center",
                }}
            >

                <h2
                    style={{
                        margin: 0,

                        fontSize: 24,

                        fontWeight: 600,
                    }}
                >
                    Quản lý Sản phẩm
                </h2>

                <Space wrap>
                    <Button
                        onClick={() =>
                            downloadTemplateMutation.mutate()
                        }
                        loading={downloadTemplateMutation.isPending}
                        icon={<DownloadOutlined />}
                    >
                        Tải file mẫu Excel
                    </Button>

                    <Upload
                        accept=".xlsx,.csv"
                        showUploadList={false}
                        beforeUpload={handleImportFile}
                        disabled={importMutation.isPending}
                    >
                        <Button
                            icon={<UploadOutlined />}
                            loading={importMutation.isPending}
                        >
                            Nhập sản phẩm từ Excel
                        </Button>
                    </Upload>

                    <Button
                        type="primary"
                        onClick={
                            handleCreate
                        }
                    >
                        + Thêm sản phẩm
                    </Button>
                </Space>
            </div>

            <div
                style={{
                    marginBottom: 16,
                }}
            >

                <Input.Search
                    placeholder="Tìm theo tên hoặc ID sản phẩm"

                    allowClear

                    value={search}

                    onChange={(e) => {

                        setSearch(
                            e.target.value
                        );

                        setPage(1);
                    }}
                />
            </div>

            {products.length > 0 ? (

                <>

                    <ProductTable
                        data={products}

                        onEdit={
                            handleEdit
                        }

                        onDelete={
                            confirmDelete
                        }
                    />

                    <PaginationBar
                        current={page}

                        pageSize={
                            pageSize
                        }

                        total={total}

                        onChange={
                            handlePageChange
                        }

                        showSizeChanger

                        showQuickJumper

                        showTotal={(
                            total
                        ) =>
                            `Tổng cộng ${total} sản phẩm`
                        }
                    />
                </>

            ) : (

                <EmptyState
                    description="Chưa có sản phẩm nào trong hệ thống"
                >

                    <Button
                        type="primary"
                        onClick={
                            handleCreate
                        }
                    >
                        Tạo sản phẩm đầu tiên
                    </Button>

                </EmptyState>
            )}
            <ProductFormModal
                open={modalOpen}

                editing={
                    editingProduct
                }

                categories={
                    categories
                }

                onCancel={() =>
                    setModalOpen(false)
                }

                onSubmit={
                    handleSubmit
                }

                loading={
                    createMutation.isPending ||
                    updateMutation.isPending
                }
            />

        </div>
    );
}
