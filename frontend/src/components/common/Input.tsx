import type { ReactNode } from "react";
import { Input as AntdInput } from "antd";
interface LabelProps {
  children: ReactNode;
  required?: boolean;
}

export const Label = ({ children, required }: LabelProps) => (
  <div style={{ marginBottom: 8, fontWeight: 500 }}>
    {children} {required && <span style={{ color: 'red' }}>*</span>}
  </div>
);


import type { InputProps } from "antd";

const Input = (props: InputProps) => {
  return <AntdInput {...props} style={{ borderRadius: 4, ...props.style }} />;
};
export default Input;