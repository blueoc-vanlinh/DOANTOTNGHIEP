import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

interface Props {
    allowedRoles: string[];
}

export default function RoleRoute({ allowedRoles }: Props) {
    const { hasAnyRole } = useAuthStore();

    if (!hasAnyRole(allowedRoles)) {
        return <Navigate to="/403" replace />;
    }

    return <Outlet />;
}