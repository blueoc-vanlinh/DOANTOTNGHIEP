import { useState } from "react";
import { Input, message } from "antd";
import { useDebounce } from "use-debounce";

import Button from "@/components/common/button";
import LoadingPage from "@/components/common/LoadingPage";
import EmptyState from "@/components/common/EmptyState";
import PaginationBar from "@/components/common/PaginationBar";
import ModalConfirm from "@/components/common/ModalConfirm";
import PageHero from "@/components/common/PageHero";

import UserTable from "../components/UserTable";
import UserFormModal from "../components/UserFormModal";

import {
    useUsers,
    useCreateUser,
    useUpdateUser,
    useDeleteUser,
    useToggleUserStatus,
} from "../hooks";

import type {
    User,
    UserInput,
} from "../types";


export default function UsersPage() {

    const [page, setPage] = useState(1);

    const [pageSize, setPageSize] = useState(10);

    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 500);

    const [modalOpen, setModalOpen] =
        useState(false);

    const [editing, setEditing] =
        useState<User | null>(null);


    const {
        data,
        isLoading,
    } = useUsers({
        page,
        page_size: pageSize,
        search: debouncedSearch,
    });

    const users = data?.items || [];

    const total = data?.meta?.total || 0;


    const createMutation = useCreateUser();

    const updateMutation = useUpdateUser();

    const deleteMutation = useDeleteUser();

    const toggleMutation = useToggleUserStatus();


    const handleSubmit = (
        values: UserInput
    ) => {

        if (editing) {

            updateMutation.mutate(
                {
                    id: editing.id,
                    data: values,
                },

                {
                    onSuccess: () => {
                        message.success(
                            "Cập nhật thành công"
                        );

                        setModalOpen(false);
                    },
                }
            );

        } else {

            createMutation.mutate(
                values,

                {
                    onSuccess: () => {
                        message.success(
                            "Thêm tài khoản thành công"
                        );

                        setModalOpen(false);
                    },
                }
            );
        }
    };


    if (isLoading) {
        return <LoadingPage />;
    }


    return (
        <div>
            <PageHero
                eyebrow="Access management"
                title={`Tài khoản nhân viên (${total})`}
                description="Quản lý người dùng, trạng thái hoạt động và vai trò truy cập hệ thống."
                actions={<Button
                    type="primary"

                    onClick={() => {
                        setEditing(null);
                        setModalOpen(true);
                    }}
                >
                    + Thêm tài khoản
                </Button>}
            />

            <div className="section-band" style={{ marginBottom: 16, padding: 16 }}>
                <Input.Search
                    allowClear
                    value={search}
                    placeholder="Tìm theo tên hoặc email tài khoản"
                    onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(1);
                    }}
                />
            </div>


            {users.length > 0 ? (
                <>

                    <UserTable
                        data={users}

                        onEdit={(u) => {
                            setEditing(u);
                            setModalOpen(true);
                        }}

                        onDelete={(id) => {
                            ModalConfirm({
                                title: "Xóa tài khoản",

                                content:
                                    "Bạn chắc chắn muốn xóa?",

                                onOk: () =>
                                    deleteMutation.mutate(id),
                            });
                        }}

                        onToggle={(id) => {
                            toggleMutation.mutate(id);
                        }}
                    />


                    <PaginationBar
                        current={page}

                        pageSize={pageSize}

                        total={total}

                        onChange={(p, ps) => {
                            setPage(p);
                            setPageSize(ps);
                        }}
                    />

                </>
            ) : (
                <EmptyState description="Chưa có tài khoản nào" />
            )}


            <UserFormModal
                open={modalOpen}

                editing={editing}

                onCancel={() => setModalOpen(false)}

                onSubmit={handleSubmit}

                loading={
                    createMutation.isPending ||
                    updateMutation.isPending
                }
            />

        </div>
    );
}
