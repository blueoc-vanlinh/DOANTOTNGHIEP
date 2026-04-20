import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Error403 from "@/components/error/error403";
import Error404 from "@/components/error/error404";
import Dashboard from "@/features/dashboard/pages/DashboardPage";
import Products from "@/features/products/pages/ProductsPage";
import Inventory from "@/features/inventory/pages/Inventory";
import ImportPage from "@/features/import/pages/ImportPage";
import ExportPage from "@/features/export/pages/ExportPage";
import ForecastPage from "@/features/forecast/pages/Forecastpage";
import CategoryPage from "@/features/category/pages/CategoryPage";
import SupplierPage from "@/features/supplier/pages/SupplierPage";
import WarehousePage from "@/features/warehouse/pages/WarehousePage";
import LoginPage from "@/features/auth/pages/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
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
  suppliersUrl,
  transactionsUrl,
  loginUrl,

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