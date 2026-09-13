import { createBrowserRouter } from "react-router-dom";
import HomePage from "./Pages/Home.tsx";
import ForgotPasswordPage from "./Pages/ForgotPassword.tsx";
import { PublicRoute } from "./components/PublicRoute.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";
import DashboardPage from "./Pages/Dashboard.tsx";
import ProductsPage from "./Pages/Products.tsx";
import RootLayout from "./components/layouts/RootLayout.tsx";

export const router = createBrowserRouter([
  // 1. Bloco de Rotas PÚBLICAS
  {
    element: <PublicRoute />, // Sem "path", serve apenas como segurança
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
    ],
  },

  // 2. Bloco de Rotas PROTEGIDAS (com o Layout do App)
  {
    element: <ProtectedRoute />, // Garante que o usuário está logado
    children: [
      {
        element: <RootLayout />, // Aplica a Navbar/Sidebar global
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/products", element: <ProductsPage /> },
        ],
      },
    ],
  },
]);
