import React from "react";
import { Input as AntdInput } from "antd";
import type { InputProps as AntdInputProps } from "antd";
import type { FC } from "react";
import { Label } from "./Label";

interface InputProps extends AntdInputProps {
  label?: React.ReactNode;
  required?: boolean;
  help?: React.ReactNode;
}

const Input: FC<InputProps> = ({
  label,
  required = false,
  help,
  style,
  className,
  ...rest
}) => {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <Label required={required}>
          {label}
        </Label>
      )}

      <AntdInput
        {...rest}
        className={className}
        style={{
          borderRadius: "8px",
          height: rest.size === "large" ? 48 : 32,
          ...style,
        }}
      />

      {help && (
        <div style={{
          fontSize: "12px",
          color: "#8c8c8c",
          marginTop: 4
        }}>
          {help}
        </div>
      )}
    </div>
  );
};

export { Label } from "./Label";
export default Input;