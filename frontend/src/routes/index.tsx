import { lazy, Suspense } from "react";
import type { ComponentType } from "react";
import { createBrowserRouter } from "react-router-dom";
import Error403 from "@/components/error/error403";
import Error404 from "@/components/error/error404";
import Error500 from "@/components/error/error500";
import LoadingPage from "@/components/common/LoadingPage";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import {
  homeUrl,
  error403Url,
  dashboardUrl,
  productsUrl,
  warehouseUrl,
  inventoryUrl,
  categoryUrl,
  importUrl,
  exportUrl,
  forecastUrl,
  aiDataUrl,
  warehouseAutomationUrl,
  warehouseOperationsUrl,
  invoicesUrl,
  suppliersUrl,
  transactionsUrl,
  loginUrl,
  usersUrl,
  rolesUrl,
  auditLogsUrl,

} from "./urls";

const Home = lazy(() => import("@/components/Home"));
const MainLayout = lazy(() => import("@/components/layout/MainLayout"));
const Dashboard = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const Products = lazy(() => import("@/features/products/pages/ProductsPage"));
const Inventory = lazy(() => import("@/features/inventory/pages/InventoryPage"));
const ImportPage = lazy(() => import("@/features/import/pages/ImportPage"));
const ExportPage = lazy(() => import("@/features/export/pages/ExportPage"));
const ForecastPage = lazy(() => import("@/features/forecast/pages/Forecastpage"));
const AiDataPage = lazy(() => import("@/features/ai-data/pages/AiDataPage"));
const WarehouseAutomationPage = lazy(() => import("@/features/warehouse-automation/pages/WarehouseAutomationPage"));
const WarehouseOperationsPage = lazy(() => import("@/features/warehouse-operations/pages/WarehouseOperationsPage"));
const InvoicePage = lazy(() => import("@/features/invoices/pages/InvoicePage"));
const CategoryPage = lazy(() => import("@/features/category/pages/CategoryPage"));
const SupplierPage = lazy(() => import("@/features/supplier/pages/SupplierPage"));
const WarehousePage = lazy(() => import("@/features/warehouse/pages/WarehousePage"));
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const UsersPage = lazy(() => import("@/features/users/pages/UserPage"));
const RolePage = lazy(() => import("@/features/roles/pages/RolePage"));
const AuditLogPage = lazy(() => import("@/features/audit-logs/pages/AuditLogPage"));
const TransactionPage = lazy(() => import("@/features/transaction/pages/TransactionPage"));

const page = (Component: ComponentType) => (
  <Suspense fallback={<LoadingPage />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  { path: homeUrl, element: page(Home), errorElement: <Error500 /> },
  { path: loginUrl, element: page(LoginPage), errorElement: <Error500 /> },
  {
    path: homeUrl,
    element: page(MainLayout),
    errorElement: <Error500 />,
    children: [

      {
        element: <ProtectedRoute />,
        children: [
          { path: dashboardUrl, element: page(Dashboard) },
          { path: productsUrl, element: page(Products) },
          { path: inventoryUrl, element: page(Inventory) },
          { path: categoryUrl, element: page(CategoryPage) },
          { path: suppliersUrl, element: page(SupplierPage) },
          { path: warehouseUrl, element: page(WarehousePage) },
          { path: transactionsUrl, element: page(TransactionPage) },
          { path: importUrl, element: page(ImportPage) },
          { path: exportUrl, element: page(ExportPage) },
          { path: forecastUrl, element: page(ForecastPage) },
          { path: invoicesUrl, element: page(InvoicePage) },
          {
            element: <RoleRoute allowedRoles={["Admin"]} />,
            children: [
              { path: aiDataUrl, element: page(AiDataPage) },
              { path: warehouseAutomationUrl, element: page(WarehouseAutomationPage) },
              { path: warehouseOperationsUrl, element: page(WarehouseOperationsPage) },
              { path: usersUrl, element: page(UsersPage) },
              { path: rolesUrl, element: page(RolePage) },
              { path: auditLogsUrl, element: page(AuditLogPage) },
            ],
          },
        ],
      },
    ],
  },
  {
    path: error403Url,
    element: <Error403 />,
    errorElement: <Error500 />,
  },

  {
    path: "*",
    element: <Error404 />,
    errorElement: <Error500 />,
  },
]);
