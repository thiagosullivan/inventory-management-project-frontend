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
import UsersPage from "./pages/UsersPage.tsx";
import SectorsPage from "./pages/SectorsPage.tsx";
import VerifyEmailPage from "./pages/VerifyEmailPage.tsx";
import MinhaContaPage from "./pages/MyAccountPage.tsx";
import AlertsPage from "./pages/AlertsPage.tsx";

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
          { path: "/movimentacoes", element: <MovementsPage /> },
          { path: "/pedidos", element: <RequestsPage /> },
          { path: "/verificar-email", element: <VerifyEmailPage /> },
          { path: "/minha-conta", element: <MinhaContaPage /> },
          { path: "/alertas", element: <AlertsPage /> },
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
              { path: "/categorias", element: <CategoriesPage /> },
              { path: "/produtos", element: <ProductsPage /> },
              { path: "/produtos/novo", element: <ProductNewPage /> },
              { path: "/produtos/:id", element: <ProductDetailPage /> },
              { path: "/estoque", element: <StockPage /> },
              { path: "/historico", element: <HistoryPage /> },

              // 🔹 novo (Fase 7) — Relatórios
              { path: "/relatorios", element: <ReportsHubPage /> },
              {
                path: "/relatorios/pedidos",
                element: <ReportsRequestsPage />,
              },
              // 🔹 rota específica antes do param genérico
              {
                path: "/relatorios/consumo",
                element: <ReportsConsumptionPage />,
              },
              {
                path: "/relatorios/consumo/:sectorId",
                element: <ReportsConsumptionPage />,
              },
              {
                path: "/relatorios/saidas-manuais",
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
            children: [
              { path: "/admin", element: <AdminPage /> },
              { path: "/admin/usuarios", element: <UsersPage /> },
              { path: "/admin/setores", element: <SectorsPage /> },
            ],
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
