import { createBrowserRouter } from "react-router-dom";
import Error403 from "@/components/error/error403";
import Error404 from "@/components/error/error404";
import Error500 from "@/components/error/error500";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import {
  AiDataPage,
  AuditLogPage,
  CategoryPage,
  Dashboard,
  ExportPage,
  ForecastPage,
  Home,
  ImportPage,
  Inventory,
  InvoicePage,
  LoginPage,
  MainLayout,
  Page,
  Products,
  RolePage,
  SupplierPage,
  TransactionPage,
  UsersPage,
  WarehouseAutomationPage,
  WarehouseOperationsPage,
  WarehousePage,
} from "./routeElements";
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

export const router = createBrowserRouter([
  { path: homeUrl, element: <Page component={Home} />, errorElement: <Error500 /> },
  { path: loginUrl, element: <Page component={LoginPage} />, errorElement: <Error500 /> },
  {
    path: homeUrl,
    element: <Page component={MainLayout} />,
    errorElement: <Error500 />,
    children: [

      {
        element: <ProtectedRoute />,
        children: [
          { path: dashboardUrl, element: <Page component={Dashboard} /> },
          { path: productsUrl, element: <Page component={Products} /> },
          { path: inventoryUrl, element: <Page component={Inventory} /> },
          { path: categoryUrl, element: <Page component={CategoryPage} /> },
          { path: suppliersUrl, element: <Page component={SupplierPage} /> },
          { path: warehouseUrl, element: <Page component={WarehousePage} /> },
          { path: transactionsUrl, element: <Page component={TransactionPage} /> },
          { path: importUrl, element: <Page component={ImportPage} /> },
          { path: exportUrl, element: <Page component={ExportPage} /> },
          { path: forecastUrl, element: <Page component={ForecastPage} /> },
          { path: invoicesUrl, element: <Page component={InvoicePage} /> },
          {
            element: <RoleRoute allowedRoles={["Admin"]} />,
            children: [
              { path: aiDataUrl, element: <Page component={AiDataPage} /> },
              { path: warehouseAutomationUrl, element: <Page component={WarehouseAutomationPage} /> },
              { path: warehouseOperationsUrl, element: <Page component={WarehouseOperationsPage} /> },
              { path: usersUrl, element: <Page component={UsersPage} /> },
              { path: rolesUrl, element: <Page component={RolePage} /> },
              { path: auditLogsUrl, element: <Page component={AuditLogPage} /> },
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
