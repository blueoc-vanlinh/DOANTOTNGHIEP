import { lazy, Suspense } from "react";
import type { ComponentType } from "react";

import LoadingPage from "@/components/common/LoadingPage";

export const Home = lazy(() => import("@/components/Home"));
export const MainLayout = lazy(() => import("@/components/layout/MainLayout"));
export const Dashboard = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
export const Products = lazy(() => import("@/features/products/pages/ProductsPage"));
export const Inventory = lazy(() => import("@/features/inventory/pages/InventoryPage"));
export const ImportPage = lazy(() => import("@/features/import/pages/ImportPage"));
export const ExportPage = lazy(() => import("@/features/export/pages/ExportPage"));
export const ForecastPage = lazy(() => import("@/features/forecast/pages/Forecastpage"));
export const AiDataPage = lazy(() => import("@/features/ai-data/pages/AiDataPage"));
export const WarehouseAutomationPage = lazy(() => import("@/features/warehouse-automation/pages/WarehouseAutomationPage"));
export const WarehouseOperationsPage = lazy(() => import("@/features/warehouse-operations/pages/WarehouseOperationsPage"));
export const InvoicePage = lazy(() => import("@/features/invoices/pages/InvoicePage"));
export const CategoryPage = lazy(() => import("@/features/category/pages/CategoryPage"));
export const SupplierPage = lazy(() => import("@/features/supplier/pages/SupplierPage"));
export const WarehousePage = lazy(() => import("@/features/warehouse/pages/WarehousePage"));
export const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
export const UsersPage = lazy(() => import("@/features/users/pages/UserPage"));
export const RolePage = lazy(() => import("@/features/roles/pages/RolePage"));
export const AuditLogPage = lazy(() => import("@/features/audit-logs/pages/AuditLogPage"));
export const TransactionPage = lazy(() => import("@/features/transaction/pages/TransactionPage"));

export function Page({ component: Component }: { component: ComponentType }) {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Component />
    </Suspense>
  );
}
