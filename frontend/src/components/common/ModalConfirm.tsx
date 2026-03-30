import { Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";

interface ModalConfirmProps {
  title: string;
  content: string;
  onOk: () => void;
  onCancel?: () => void;
}

const ModalConfirm = ({ title, content, onOk, onCancel }: ModalConfirmProps) => {
  Modal.confirm({
    title,
    icon: <ExclamationCircleFilled />,
    content,
    okText: "Xác nhận",
    okType: "danger",
    cancelText: "Hủy",
    onOk,
    onCancel,
  });
};

export default ModalConfirm;