import type { TransactionType } from "../types";

export const transactionTypeMeta: Record<
  TransactionType,
  { label: string; color: string; sign: "+" | "-" | "" }
> = {
  IMPORT: { label: "Nhập kho", color: "green", sign: "+" },
  EXPORT: { label: "Xuất kho", color: "red", sign: "-" },
  ADJUST: { label: "Điều chỉnh", color: "orange", sign: "" },
  CUSTOMER_RETURN: { label: "Khách trả hàng", color: "blue", sign: "+" },
  SUPPLIER_RETURN: { label: "Trả nhà cung cấp", color: "volcano", sign: "-" },
  STOCKTAKE_ADJUST: { label: "Điều chỉnh kiểm kê", color: "gold", sign: "" },
  PO_RECEIVE: { label: "Nhận hàng PO", color: "cyan", sign: "+" },
  IMPORT_CANCEL: { label: "Hủy phiếu nhập", color: "magenta", sign: "-" },
  EXPORT_CANCEL: { label: "Hủy phiếu xuất", color: "purple", sign: "+" },
};

export function getTransactionTypeMeta(type: string) {
  return (
    transactionTypeMeta[type as TransactionType] || {
      label: type,
      color: "default",
      sign: "",
    }
  );
}
