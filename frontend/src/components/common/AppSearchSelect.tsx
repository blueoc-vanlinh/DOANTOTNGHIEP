import { Select, Spin } from "antd";

import type {
    SelectProps,
    DefaultOptionType,
} from "antd/es/select";

import type { FC } from "react";

interface AppSearchSelectProps
    extends Omit<
        SelectProps,
        "showSearch"
    > {
    loading?: boolean;

    placeholder?: string;

    allowClear?: boolean;
}

const AppSearchSelect: FC<
    AppSearchSelectProps
> = ({
    loading = false,

    placeholder = "Tìm kiếm...",

    allowClear = true,

    style,

    options = [],

    ...rest
}) => {
        return (
            <Select
                showSearch
                allowClear={allowClear}
                placeholder={placeholder}
                loading={loading}
                options={options}
                optionFilterProp="searchText"
                notFoundContent={
                    loading ? (
                        <Spin size="small" />
                    ) : (
                        "Không tìm thấy dữ liệu"
                    )
                }
                filterOption={(
                    input,
                    option
                ) => {
                    const searchText =
                        (
                            option as DefaultOptionType & {
                                searchText?: string;
                            }
                        )?.searchText || "";

                    return searchText
                        .toString()
                        .toLowerCase()
                        .includes(
                            input.toLowerCase()
                        );
                }}
                style={{
                    width: "100%",
                    borderRadius: 8,
                    ...style,
                }}
                dropdownStyle={{
                    borderRadius: 10,
                }}
                {...rest}
            />
        );
    };

export default AppSearchSelect;