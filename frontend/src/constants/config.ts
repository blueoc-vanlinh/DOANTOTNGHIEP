const explicitApiUrl = import.meta.env.VITE_API_URL as string | undefined;
const fallbackApiUrl = `${window.location.protocol}//${window.location.hostname}:8000/api/v1`;

export const VITE_API_URL = explicitApiUrl || fallbackApiUrl;

export const BASE_URL = VITE_API_URL;
