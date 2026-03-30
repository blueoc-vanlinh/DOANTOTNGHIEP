import React from "react";
import { Button as AntdButton } from "antd";
import type { ButtonProps as AntdButtonProps } from "antd";
interface CustomButtonProps extends AntdButtonProps {
  label?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  customVariant?: AntdButtonProps['type']; 
}

export const Button: React.FC<CustomButtonProps> = ({
  type = 'primary',
  label,
  loading,
  style,
  size = 'middle',
  className,
  onClick,
  htmlType = 'button',
  danger,
  children,
  icon,
  iconPosition = 'start',
  disabled,
  ...rest 
}) => {
  return (
    <AntdButton
      type={type} 
      danger={danger}
      disabled={disabled}
      loading={loading}
      onClick={onClick}
      htmlType={htmlType}
      className={className}
      size={size}
      icon={iconPosition === 'start' ? icon : undefined}
      style={{
        borderRadius: '7px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
      {...rest}
    >
      {label}
      {children}
      {iconPosition === 'end' && icon && <span style={{ marginLeft: 8 }}>{icon}</span>}
    </AntdButton>
  );
};

export default Button;