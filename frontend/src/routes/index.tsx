import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Error403 from "@/components/error/error403";
import Error404 from "@/components/error/error404";
import Dashboard from "@/features/dashboard/pages/DashboardPage";
import Products from "@/features/products/pages/ProductsPage";
import Inventory from "@/features/inventory/pages/InventoryPage";
import ImportPage from "@/features/import/pages/ImportPage";
import ExportPage from "@/features/export/pages/ExportPage";
import ForecastPage from "@/features/forecast/pages/Forecastpage";
import AiDataPage from "@/features/ai-data/pages/AiDataPage";
import WarehouseAutomationPage from "@/features/warehouse-automation/pages/WarehouseAutomationPage";
import InvoicePage from "@/features/invoices/pages/InvoicePage";
import CategoryPage from "@/features/category/pages/CategoryPage";
import SupplierPage from "@/features/supplier/pages/SupplierPage";
import WarehousePage from "@/features/warehouse/pages/WarehousePage";
import LoginPage from "@/features/auth/pages/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import UsersPage from "@/features/users/pages/UserPage";
import RolePage from "@/features/roles/pages/RolePage";
import AuditLogPage from "@/features/audit-logs/pages/AuditLogPage";
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
  invoicesUrl,
  suppliersUrl,
  transactionsUrl,
  loginUrl,
  usersUrl,
  rolesUrl,
  auditLogsUrl,

} from "./urls";
import TransactionPage from "@/features/transaction/pages/TransactionPage";


export const router = createBrowserRouter([
  { path: loginUrl, element: <LoginPage /> },
  {
    path: homeUrl,
    element: <MainLayout />,
    children: [

      {
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: dashboardUrl, element: <Dashboard /> },
          { path: productsUrl, element: <Products /> },
          { path: inventoryUrl, element: <Inventory /> },
          { path: categoryUrl, element: <CategoryPage /> },
          { path: suppliersUrl, element: <SupplierPage /> },
          { path: warehouseUrl, element: <WarehousePage /> },
          { path: transactionsUrl, element: <TransactionPage /> },
          { path: importUrl, element: <ImportPage /> },
          { path: exportUrl, element: <ExportPage /> },
          { path: forecastUrl, element: <ForecastPage /> },
          { path: invoicesUrl, element: <InvoicePage /> },
          {
            element: <RoleRoute allowedRoles={["Admin"]} />,
            children: [
              { path: aiDataUrl, element: <AiDataPage /> },
              { path: warehouseAutomationUrl, element: <WarehouseAutomationPage /> },
              { path: usersUrl, element: <UsersPage /> },
              { path: rolesUrl, element: <RolePage /> },
              { path: auditLogsUrl, element: <AuditLogPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: error403Url,
    element: <Error403 />,
  },

  {
    path: "*",
    element: <Error404 />,
  },
]);
