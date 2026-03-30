import { Empty, Button } from "antd";
import type { ReactNode } from "react";

interface EmptyStateProps {
  description?: string;
  actionText?: string;
  onAction?: () => void;
  children?: ReactNode;
}

const EmptyState = ({ description, actionText, onAction }: EmptyStateProps) => (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description={<span>{description || "Không có dữ liệu"}</span>}
  >
    {onAction && (
      <Button type="primary" onClick={onAction}>
        {actionText || "Tạo mới ngay"}
      </Button>
    )}
  </Empty>
);

export default EmptyState;
