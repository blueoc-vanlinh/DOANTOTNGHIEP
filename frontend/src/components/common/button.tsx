import React from "react";
import { Button as AntdButton } from "antd";
import type { ButtonProps as AntdButtonProps } from "antd";
import type { FC } from "react";

interface CustomButtonProps extends Omit<AntdButtonProps, "icon"> {
  label?: React.ReactNode;

  iconPosition?: "start" | "end";

  icon?: React.ReactNode;

  block?: boolean;
}

const Button: FC<CustomButtonProps> = ({
  type = "primary",
  size = "middle",
  label,
  children,
  icon,
  iconPosition = "start",
  style,
  className,
  block = false,
  danger = false,
  ...rest
}) => {
  const dangerStyle = danger
    ? {
      backgroundColor: "#8b0000",
      borderColor: "#8b0000",
      color: "#ffffff",
    }
    : {};

  const content = (
    <>
      {iconPosition === "start" && icon}
      {(label || children) && (
        <span style={{ marginLeft: iconPosition === "start" && icon ? 8 : 0 }}>
          {label ?? children}
        </span>
      )}
      {iconPosition === "end" && icon && (
        <span style={{ marginLeft: label || children ? 8 : 0 }}>{icon}</span>
      )}
    </>
  );

  return (
    <AntdButton
      type={type}
      size={size}
      block={block}
      className={className}
      danger={danger}
      style={{
        borderRadius: "8px",
        fontWeight: 500,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: size === "large" ? "0 24px" : size === "small" ? "0 12px" : "0 20px",
        ...dangerStyle,
        ...style,
      }}
      icon={iconPosition === "start" ? icon : undefined}
      {...rest}
    >
      {content}
    </AntdButton>
  );
};

export default Button;