import { Pagination as AntdPagination } from "antd";
import type { PaginationProps } from "antd";

const PaginationBar = (props: PaginationProps) => {
  return (
    <div style={{ marginTop: 24, textAlign: 'right', padding: '16px 0' }}>
      <AntdPagination 
        showSizeChanger 
        showTotal={(total) => `Tổng cộng ${total} mục`}
        {...props} 
      />
    </div>
  );
};

export default PaginationBar;