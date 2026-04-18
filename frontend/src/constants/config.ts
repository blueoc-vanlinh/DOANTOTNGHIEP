const portMap: Record<string, string> = {
    "5173": "8000",
    "5174": "8001",
    "5175": "8002",
};

const backendPort = portMap[window.location.port] || "8000";

export const BASE_URL =
    `${window.location.protocol}//${window.location.hostname}:${backendPort}/api/v1`;