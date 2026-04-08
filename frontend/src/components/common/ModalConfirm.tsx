import { Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import type { ModalFuncProps } from "antd";

interface ModalConfirmProps extends Omit<ModalFuncProps, "onOk" | "onCancel"> {
  title: string;
  content: string | React.ReactNode;
  onOk: () => void | Promise<void>;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  width?: number | string;
}

const ModalConfirm = ({
  title,
  content,
  onOk,
  onCancel,
  okText = "Xác nhận",
  cancelText = "Hủy",
  danger = true,
  loading = false,
  width = 420,
  ...rest
}: ModalConfirmProps): void => {
  Modal.confirm({
    title,
    icon: <ExclamationCircleFilled style={{ color: "#ff4d4f" }} />,
    content,
    okText,
    cancelText,
    okType: danger ? "danger" : "primary",
    okButtonProps: {
      danger,
      loading
    },
    cancelButtonProps: {
      disabled: loading
    },
    width,
    centered: true,
    maskClosable: false,
    keyboard: false,
    style: { borderRadius: "12px" },
    bodyStyle: {
      padding: "24px",
      fontSize: "15px",
      lineHeight: "1.6"
    },
    onOk,
    onCancel,
    ...rest,
  });
};

export default ModalConfirm;