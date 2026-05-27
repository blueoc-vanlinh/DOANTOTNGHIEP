import { theme } from "antd";

export const appTheme = {
    token: {
        colorPrimary: "#0f766e",
        colorSuccess: "#15803d",
        colorWarning: "#d97706",
        colorError: "#b42318",
        colorInfo: "#2563eb",
        colorText: "#172033",
        colorTextSecondary: "#667085",
        colorBgLayout: "#f3f6f8",
        colorBorder: "#dfe7ee",
        borderRadius: 8,
        fontSize: 14,
        fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    components: {
        Layout: {
            headerBg: "#ffffff",
            siderBg: "#ffffff",
        },
        Menu: {
            itemBorderRadius: 8,
            itemSelectedBg: "#e7f5f2",
            itemSelectedColor: "#0f766e",
        },
        Card: {
            borderRadiusLG: 8,
        },
    },
    algorithm: theme.defaultAlgorithm,
};
