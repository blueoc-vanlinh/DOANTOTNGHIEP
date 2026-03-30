import { Select } from "antd";
import type { SelectProps, DefaultOptionType } from "antd/es/select";

interface SearchComboboxProps extends SelectProps {
  placeholder?: string;
}

const SearchCombobox = ({ placeholder, ...props }: SearchComboboxProps) => {
  return (
    <Select
      placeholder={placeholder || "Tìm kiếm..."}
      style={{ width: "100%" }}
      showSearch={{
        filterOption: (input: string, option?: DefaultOptionType) =>
          (option?.label ?? "")
            .toString()
            .toLowerCase()
            .includes(input.toLowerCase()),
        optionFilterProp: "label",
      }}
      {...props}
    />
  );
};

export default SearchCombobox;
