// src/routes.tsx
import { createBrowserRouter } from "react-router-dom";
import { PublicRoute } from "./components/PublicRoute.tsx";
import {
  ManagerRoutes,
  ProtectedRoute,
  WarehouseOnlyRoute,
} from "./components/ProtectedRoute.tsx";

// 🔹 lazy pages vêm de arquivo separado
import {
  DashboardPage,
  ProductsPage,
  ProductNewPage,
  ProductDetailPage,
  StockPage,
  HistoryPage,
  ReportsHubPage,
  ReportsRequestsPage,
  ReportsConsumptionPage,
  ReportsManualOutputPage,
  UsersPage,
  SectorsPage,
} from "./lazy-pages";

// estáticas continuam aqui
import HomePage from "./pages/Home.tsx";
import ForgotPasswordPage from "./pages/ForgotPassword.tsx";
import Page404 from "./pages/Page404.tsx";
import AccountSuspended from "./pages/AccountSuspended.tsx";
import VerifyEmailPage from "./pages/VerifyEmailPage.tsx";
import MinhaContaPage from "./pages/MyAccountPage.tsx";
import AlertsPage from "./pages/AlertsPage.tsx";
import MovementsPage from "./pages/MovementsPage.tsx";
import RequestsPage from "./pages/RequestsPage.tsx";
import CategoriesPage from "./pages/Categories.tsx";
import AdminPage from "./pages/Admin.tsx";
import RootLayout from "./components/layouts/RootLayout.tsx";

export const router = createBrowserRouter([
  // Public
  { path: "/account-suspended", element: <AccountSuspended /> },

  {
    element: <PublicRoute />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/recuperar-senha", element: <ForgotPasswordPage /> },
    ],
  },

  // Protected (qualquer logado, com RootLayout)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RootLayout />,
        children: [
          // páginas acessíveis a qualquer logado
          { path: "/movimentacoes", element: <MovementsPage /> },
          { path: "/pedidos", element: <RequestsPage /> },
          { path: "/verificar-email", element: <VerifyEmailPage /> },
          { path: "/minha-conta", element: <MinhaContaPage /> },
          { path: "/alertas", element: <AlertsPage /> },

          // 🔒 Só Almoxarifado/MANAGER
          {
            element: <WarehouseOnlyRoute />,
            children: [
              { path: "/dashboard", element: <DashboardPage /> },
              { path: "/categorias", element: <CategoriesPage /> },
              { path: "/produtos", element: <ProductsPage /> },
              { path: "/produtos/novo", element: <ProductNewPage /> },
              { path: "/produtos/:id", element: <ProductDetailPage /> },
              { path: "/estoque", element: <StockPage /> },
              { path: "/historico", element: <HistoryPage /> },
              { path: "/relatorios", element: <ReportsHubPage /> },
              {
                path: "/relatorios/pedidos",
                element: <ReportsRequestsPage />,
              },
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

          // 🔒 Só MANAGER
          {
            element: <ManagerRoutes />,
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
