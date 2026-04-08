import { Select } from "antd";
import type { SelectProps, DefaultOptionType } from "antd/es/select";
import type { FC } from "react";

interface SearchComboboxProps extends Omit<SelectProps, "showSearch"> {
  placeholder?: string;
  allowClear?: boolean;
}

const SearchCombobox: FC<SearchComboboxProps> = ({
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
      filterOption={(input: string, option?: DefaultOptionType) =>
        (option?.label ?? "")
          .toString()
          .toLowerCase()
          .includes(input.toLowerCase())
      }
      style={{
        width: "100%",
        borderRadius: "8px",
        ...style,
      }}
      // Tùy chọn nâng cao
      dropdownStyle={{ borderRadius: "8px" }}
      notFoundContent="Không tìm thấy kết quả"
      {...rest}
    />
  );
};

export default SearchCombobox;