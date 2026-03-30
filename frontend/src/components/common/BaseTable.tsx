import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type {
  TablePaginationConfig,
  FilterValue,
  SorterResult,
  SortOrder,
} from "antd/es/table/interface";
import { useState } from "react";

export type TableState = {
  selectedRowKeys: React.Key[];
  sortField?: string;
  sortOrder?: SortOrder
};

interface BaseTableProps<T> {
  columns: ColumnsType<T>;
  data: T[];
  loading?: boolean;
  rowKey?: string;
  onChangeState?: (state: TableState) => void;
  selectable?: boolean;
}

export default function BaseTable<T extends { id: number }>({
  columns,
  data,
  loading,
  rowKey = "id",
  onChangeState,
  selectable = true,
}: BaseTableProps<T>) {
  const [state, setState] = useState<TableState>({
    selectedRowKeys: [],
  });
  const rowSelection = selectable
    ? {
        selectedRowKeys: state.selectedRowKeys,
        onChange: (keys: React.Key[]) => {
          const newState = { ...state, selectedRowKeys: keys };
          setState(newState);
          onChangeState?.(newState);
        },
      }
    : undefined;

  const handleChange = (
    _: TablePaginationConfig,
    __: Record<string, FilterValue | null>,
    sorter: SorterResult<T> | SorterResult<T>[]
  ) => {
    // sorter có thể là array (multi sort)
    const sort = Array.isArray(sorter) ? sorter[0] : sorter;

    const newState: TableState = {
      ...state,
      sortField: sort?.field as string,
      sortOrder: sort?.order,
    };

    setState(newState);
    onChangeState?.(newState);
  };

  return (
    <Table<T>
      rowKey={rowKey}
      loading={loading}
      columns={columns}
      dataSource={data}
      rowSelection={rowSelection}
      onChange={handleChange}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
      }}
      bordered
    />
  );
}