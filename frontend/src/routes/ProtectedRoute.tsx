import { Navigate, Outlet } from "react-router-dom";
import LoadingPage from "@/components/common/LoadingPage";
import { useAuthStore } from "@/store/auth.store";

export default function ProtectedRoute() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const hasHydrated = useAuthStore((s) => s.hasHydrated);

    if (!hasHydrated) {
        return <LoadingPage />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
