import { Select } from "antd";
import type {
  SelectProps,
  DefaultOptionType,
} from "antd/es/select";
import type { FC } from "react";

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
          const searchText =
            (
              option as DefaultOptionType & {
                searchText?: string;
              }
            )?.searchText || "";

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