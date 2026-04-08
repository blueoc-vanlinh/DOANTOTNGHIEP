import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type {
  TablePaginationConfig,
  FilterValue,
  SorterResult,
  SortOrder,
} from "antd/es/table/interface";
import { useState, useCallback } from "react";

export type TableState = {
  selectedRowKeys: React.Key[];
  sortField?: string;
  sortOrder?: SortOrder;
  pagination?: TablePaginationConfig;
};

interface BaseTableProps<T> {
  columns: ColumnsType<T>;
  data: T[];
  loading?: boolean;
  rowKey?: string | ((record: T) => string | number);
  onChangeState?: (state: TableState) => void;
  selectable?: boolean;
  pagination?: TablePaginationConfig | false;
  scroll?: { x?: number | string; y?: number | string };
  size?: "small" | "middle" | "large";
  bordered?: boolean;
  className?: string;
}

const BaseTable = <T extends { id: number | string }>({
  columns,
  data,
  loading = false,
  rowKey = "id",
  onChangeState,
  selectable = true,
  pagination = {
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ["10", "20", "50", "100"],
  },
  scroll = { x: 1200 },
  size = "middle",
  bordered = true,
  className,
}: BaseTableProps<T>) => {
  const [internalState, setInternalState] = useState<TableState>({
    selectedRowKeys: [],
  });

  const rowSelection = selectable
    ? {
      selectedRowKeys: internalState.selectedRowKeys,
      onChange: (selectedRowKeys: React.Key[]) => {
        const newState: TableState = {
          ...internalState,
          selectedRowKeys,
        };
        setInternalState(newState);
        onChangeState?.(newState);
      },
      columnWidth: 50,
    }
    : undefined;
  const handleTableChange = useCallback(
    (
      newPagination: TablePaginationConfig,
      _: Record<string, FilterValue | null>,
      sorter: SorterResult<T> | SorterResult<T>[]
    ) => {
      const sortInfo = Array.isArray(sorter) ? sorter[0] : sorter;

      const newState: TableState = {
        selectedRowKeys: internalState.selectedRowKeys,
        sortField: sortInfo?.field as string | undefined,
        sortOrder: sortInfo?.order,
        pagination: newPagination,
      };

      setInternalState(newState);
      onChangeState?.(newState);
    },
    [internalState.selectedRowKeys, onChangeState]
  );

  return (
    <Table<T>
      rowKey={rowKey}
      loading={loading}
      columns={columns}
      dataSource={data}
      rowSelection={rowSelection}
      onChange={handleTableChange}
      pagination={pagination}
      scroll={scroll}
      size={size}
      bordered={bordered}
      className={className}
      style={{
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
      }}
      sticky={{
        offsetHeader: 0,
      }}
    />
  );
};

export default BaseTable;