import React from "react";
import ReactDOM from "react-dom/client";

import { RouterProvider } from "react-router-dom";
import { router } from "@/routes";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";

import { ConfigProvider } from "antd";
import { appTheme } from "@/theme";

import "antd/dist/reset.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider theme={appTheme}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ConfigProvider>
  </React.StrictMode>
);