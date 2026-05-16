import type { ReactNode, FC } from "react";

interface LabelProps {
    children: ReactNode;
    required?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export const Label: FC<LabelProps> = ({
    children,
    required = false,
    className,
    style,
}) => {
    return (
        <span
            className={className}
            style={{
                fontWeight: 500,
                fontSize: "14px",
                color: "#1f1f1f",
                ...style,
            }}
        >
            {children}
            {required && (
                <span style={{ color: "#8b0000", marginLeft: 4 }}>*</span>
            )}
        </span>
    );
};