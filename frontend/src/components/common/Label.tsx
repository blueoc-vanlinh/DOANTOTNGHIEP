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
        <div
            className={className}
            style={{
                marginBottom: 8,
                fontWeight: 500,
                fontSize: "14px",
                color: "#1f1f1f",
                ...style,
            }}
        >
            {children}
            {required && (
                <span style={{ color: "#ff4d4f", marginLeft: 4 }}>*</span>
            )}
        </div>
    );
};