import { Pagination as AntdPagination } from "antd";
import type { PaginationProps } from "antd";
import type { FC } from "react";

interface PaginationBarProps extends PaginationProps {
  showTotalText?: (total: number, range: [number, number]) => string;
  bordered?: boolean;
}

const PaginationBar: FC<PaginationBarProps> = ({
  showTotalText,
  bordered = true,
  style,
  className,
  ...rest
}) => {
  return (
    <div
      style={{
        marginTop: 24,
        padding: "16px 24px",
        background: bordered ? "#fff" : "transparent",
        borderTop: bordered ? "1px solid #f0f0f0" : "none",
        borderRadius: bordered ? "0 0 12px 12px" : "0",
        textAlign: "right",
        boxShadow: bordered ? "0 -2px 6px rgba(0, 0, 0, 0.02)" : "none",
        ...style,
      }}
      className={className}
    >
      <AntdPagination
        showSizeChanger
        showQuickJumper
        pageSizeOptions={["10", "20", "50", "100"]}
        showTotal={
          showTotalText ||
          ((total, range) =>
            `Hiển thị ${range[0]}-${range[1]} trong tổng ${total} mục`
          )
        }
        {...rest}
        style={{
          fontSize: "14px",
        }}
      />
    </div>
  );
};

export default PaginationBar;