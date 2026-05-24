import { Select } from "antd";
import type {
  SelectProps,
  DefaultOptionType,
} from "antd/es/select";
import type { FC, ReactNode } from "react";

interface SearchComboboxProps
  extends Omit<
    SelectProps,
    "showSearch"
  > {
  placeholder?: string;
  allowClear?: boolean;
}

const SearchCombobox: FC<
  SearchComboboxProps
> = ({
  placeholder = "Tìm kiếm...",
  allowClear = true,
  style,
  ...rest
}) => {
    return (
      <Select
        placeholder={placeholder}
        allowClear={allowClear}
        showSearch

        optionFilterProp="label"

        filterOption={(
          input: string,
          option?: DefaultOptionType
        ) => {
          const typedOption = option as DefaultOptionType & {
            searchText?: string;
          };
          const searchText = [
            typedOption?.searchText,
            nodeToSearchText(typedOption?.label),
            typedOption?.value,
          ]
            .filter(Boolean)
            .join(" ");

          return searchText
            .toLowerCase()
            .includes(
              input.toLowerCase()
            );
        }}

        style={{
          width: "100%",
          borderRadius: "8px",
          ...style,
        }}

        dropdownStyle={{
          borderRadius: "8px",
        }}

        notFoundContent="Không tìm thấy kết quả"

        {...rest}
      />
    );
  };

export default SearchCombobox;

function nodeToSearchText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(nodeToSearchText).join(" ");
  }

  if (node && typeof node === "object" && "props" in node) {
    return nodeToSearchText((node as { props?: { children?: ReactNode } }).props?.children);
  }

  return "";
}
