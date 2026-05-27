import { useState } from "react";
import { Input, Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useDebounce } from "use-debounce";

import LoadingPage from "@/components/common/LoadingPage";
import PaginationBar from "@/components/common/PaginationBar";
import PageHero from "@/components/common/PageHero";
import { useAuditLogs } from "../hooks";
import type { AuditLog } from "../types";

const { Text } = Typography;

const actionLabels: Record<string, string> = {
  VIEW: "Xem",
  CREATE: "Tạo",
  UPDATE: "Cập nhật",
  DELETE: "Xóa",
};

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState<string | undefined>();
  const [success, setSuccess] = useState<boolean | undefined>();
  const [debouncedSearch] = useDebounce(search, 500);

  const { data, isLoading } = useAuditLogs({
    page,
    page_size: pageSize,
    search: debouncedSearch || undefined,
    action,
    success,
  });

  const columns: ColumnsType<AuditLog> = [
    {
      title: "Thời gian",
      dataIndex: "created_at",
      width: 170,
      render: (value: string) => new Date(value).toLocaleString("vi-VN"),
    },
    {
      title: "Hành động",
      dataIndex: "action",
      width: 120,
      render: (value: string) => (
        <Tag color={value === "DELETE" ? "red" : value === "VIEW" ? "blue" : "green"}>
          {actionLabels[value] || value}
        </Tag>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      render: (value: string, record) => (
        <Space direction="vertical" size={2}>
          <Text>{value || `${record.method} ${record.path}`}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.method} {record.path}
          </Text>
        </Space>
      ),
    },
    {
      title: "Người dùng",
      dataIndex: "actor",
      width: 180,
      render: (value: string) => value,
    },
    {
      title: "Trạng thái",
      dataIndex: "success",
      width: 130,
      render: (value: boolean, record) => (
        <Tag color={value ? "success" : "error"}>
          {value ? "Thành công" : `Lỗi ${record.status_code || ""}`}
        </Tag>
      ),
    },
    {
      title: "IP",
      dataIndex: "ip_address",
      width: 140,
      render: (value?: string | null) => value || "-",
    },
  ];

  if (isLoading) return <LoadingPage />;

  return (
    <div>
      <PageHero
        eyebrow="Audit trail"
        title={`Nhật ký hoạt động (${data?.total || 0})`}
        description="Theo dõi thao tác người dùng, API, trạng thái thành công/thất bại và nguồn truy cập."
        actions={<Space wrap>
          <Select
            allowClear
            placeholder="Hành động"
            value={action}
            onChange={(value) => {
              setAction(value);
              setPage(1);
            }}
            style={{ width: 150 }}
            options={[
              { label: "Xem", value: "VIEW" },
              { label: "Tạo", value: "CREATE" },
              { label: "Cập nhật", value: "UPDATE" },
              { label: "Xóa", value: "DELETE" },
            ]}
          />
          <Select
            allowClear
            placeholder="Kết quả"
            value={success}
            onChange={(value) => {
              setSuccess(value);
              setPage(1);
            }}
            style={{ width: 150 }}
            options={[
              { label: "Thành công", value: true },
              { label: "Thất bại", value: false },
            ]}
          />
        </Space>}
      />

      <div className="section-band" style={{ marginBottom: 16, padding: 16 }}>
        <Input.Search
          allowClear
          value={search}
          placeholder="Tìm theo hành động, API, mô tả"
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data?.items || []}
        pagination={false}
        scroll={{ x: 980 }}
      />

      <PaginationBar
        current={page}
        pageSize={pageSize}
        total={data?.total || 0}
        onChange={(nextPage, nextPageSize) => {
          setPage(nextPage);
          setPageSize(nextPageSize);
        }}
        showSizeChanger
        showQuickJumper
        showTotal={(total) => `Tổng cộng ${total} hoạt động`}
      />
    </div>
  );
}
