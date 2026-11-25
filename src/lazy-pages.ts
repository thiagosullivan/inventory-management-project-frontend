// src/lazy-pages.ts
import { lazy } from "react";

export const DashboardPage = lazy(() => import("./pages/Dashboard.tsx"));
export const ProductsPage = lazy(() => import("./pages/Products.tsx"));
export const ProductNewPage = lazy(() => import("./pages/ProductNewPage.tsx"));
export const ProductDetailPage = lazy(
  () => import("./pages/ProductDetailPage.tsx"),
);
export const StockPage = lazy(() => import("./pages/Stock.tsx"));
export const HistoryPage = lazy(() => import("./pages/HistoryPage.tsx"));
export const ReportsHubPage = lazy(() => import("./pages/ReportsHubPage.tsx"));
export const ReportsRequestsPage = lazy(
  () => import("./pages/ReportsRequestsPage.tsx"),
);
export const ReportsConsumptionPage = lazy(
  () => import("./pages/ReportsConsumptionPage.tsx"),
);
export const ReportsManualOutputPage = lazy(
  () => import("./pages/ReportsManualOutputPage.tsx"),
);
export const UsersPage = lazy(() => import("./pages/UsersPage.tsx"));
export const SectorsPage = lazy(() => import("./pages/SectorsPage.tsx"));
