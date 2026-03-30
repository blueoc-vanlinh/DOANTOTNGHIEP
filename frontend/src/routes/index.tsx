import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Error403 from "@/components/error/error403";
import Error404 from "@/components/error/error404";
// import Dashboard from "@/features/dashboard/pages/Dashboard";
import Products from "@/features/products/pages/Products";
import Inventory from "@/features/inventory/pages/Inventory";
import ImportPage from "@/features/import/pages/ImportPage";
// import ExportPage from "@/features/export/pages/ExportPage";

import {
  homeUrl,
  error403Url,
  // dashboardUrl,
  productsUrl,
  inventoryUrl,
  importUrl,
  // exportUrl,

} from "./urls";

export const router = createBrowserRouter([
  {
    path: homeUrl,
    element: <MainLayout />,
    children: [
      // { index: true, element: <Dashboard /> },
      // { path: dashboardUrl, element: <Dashboard /> },
      { path: productsUrl, element: <Products /> },
      { path: inventoryUrl, element: <Inventory /> },
      { path: importUrl, element: <ImportPage /> },
      // { path: exportUrl, element: <ExportPage /> },
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