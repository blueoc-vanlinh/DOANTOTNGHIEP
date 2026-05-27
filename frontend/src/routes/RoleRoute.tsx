import { Navigate, Outlet } from "react-router-dom";
import LoadingPage from "@/components/common/LoadingPage";
import { useAuthStore } from "@/store/auth.store";

interface Props {
    allowedRoles: string[];
}

export default function RoleRoute({ allowedRoles }: Props) {
    const { hasAnyRole, hasHydrated } = useAuthStore();

    if (!hasHydrated) {
        return <LoadingPage />;
    }

    if (!hasAnyRole(allowedRoles)) {
        return <Navigate to="/403" replace />;
    }

    return <Outlet />;
}
