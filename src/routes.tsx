import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/Home.tsx";
import ForgotPasswordPage from "./pages/ForgotPassword.tsx";
import { PublicRoute } from "./components/PublicRoute.tsx";
import {
  ManagerRoutes,
  ProtectedRoute,
  WarehouseOnlyRoute,
} from "./components/ProtectedRoute.tsx";
import DashboardPage from "./pages/Dashboard.tsx";
import ProductsPage from "./pages/Products.tsx";
import RootLayout from "./components/layouts/RootLayout.tsx";
import Page404 from "./pages/Page404.tsx";
import AdminPage from "./pages/Admin.tsx";
import CategoriesPage from "./pages/Categories.tsx";
import StockPage from "./pages/Stock.tsx";
import ProductNewPage from "./pages/ProductNewPage.tsx";
import ProductDetailPage from "./pages/ProductDetailPage.tsx";
import MovementsPage from "./pages/MovementsPage.tsx";
import RequestsPage from "./pages/RequestsPage.tsx";
import AccountSuspended from "./pages/AccountSuspended.tsx";
import HistoryPage from "./pages/HistoryPage.tsx";
// 🔹 novo (Fase 7)

import ReportsHubPage from "./pages/ReportsHubPage.tsx";
import ReportsRequestsPage from "./pages/ReportsRequestsPage.tsx";
import ReportsConsumptionPage from "./pages/ReportsConsumptionPage.tsx";
import ReportsManualOutputPage from "./pages/ReportsManualOutputPage.tsx";

export const router = createBrowserRouter([
  // Public
  { path: "/account-suspended", element: <AccountSuspended /> },

  {
    element: <PublicRoute />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
    ],
  },

  // Protected (qualquer logado, com RootLayout)
  {
    element: <ProtectedRoute />,
    children: [
      // páginas acessíveis a qualquer logado
      {
        element: <RootLayout />,
        children: [
          { path: "/movements", element: <MovementsPage /> },
          { path: "/requests", element: <RequestsPage /> },
        ],
      },

      // 🔒 Só Almoxarifado/MANAGER (guard antes do layout)
      {
        element: <WarehouseOnlyRoute />,
        children: [
          {
            element: <RootLayout />,
            children: [
              { path: "/dashboard", element: <DashboardPage /> },
              { path: "/categories", element: <CategoriesPage /> },
              { path: "/products", element: <ProductsPage /> },
              { path: "/products/new", element: <ProductNewPage /> },
              { path: "/products/:id", element: <ProductDetailPage /> },
              { path: "/stock", element: <StockPage /> },
              { path: "/history", element: <HistoryPage /> },

              // 🔹 novo (Fase 7) — Relatórios
              { path: "/reports", element: <ReportsHubPage /> },
              { path: "/reports/requests", element: <ReportsRequestsPage /> },
              // 🔹 rota específica antes do param genérico
              {
                path: "/reports/consumption",
                element: <ReportsConsumptionPage />,
              },
              {
                path: "/reports/consumption/:sectorId",
                element: <ReportsConsumptionPage />,
              },
              {
                path: "/reports/manual-output",
                element: <ReportsManualOutputPage />,
              },
            ],
          },
        ],
      },

      // 🔒 Só MANAGER
      {
        element: <ManagerRoutes />,
        children: [
          {
            element: <RootLayout />,
            children: [{ path: "/admin", element: <AdminPage /> }],
          },
        ],
      },
    ],
  },

  // Error
  {
    path: "*",
    element: <Page404 />,
  },
]);
