import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/Home.tsx";
import ForgotPasswordPage from "./pages/ForgotPassword.tsx";
import { PublicRoute } from "./components/PublicRoute.tsx";
import { ManagerRoutes, ProtectedRoute } from "./components/ProtectedRoute.tsx";
import DashboardPage from "./pages/Dashboard.tsx";
import ProductsPage from "./pages/Products.tsx";
import RootLayout from "./components/layouts/RootLayout.tsx";
import Page404 from "./pages/Page404.tsx";
import AdminPage from "./pages/Admin.tsx";
import CategoriesPage from "./pages/Categories.tsx";
import StockPage from "./pages/Stock.tsx";
import ProductNewPage from "./pages/ProductNewPage.tsx";
import ProductDetailPage from "./pages/ProductDetailPage.tsx";

export const router = createBrowserRouter([
  // Public
  {
    element: <PublicRoute />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
    ],
  },

  // Protected
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RootLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/products", element: <ProductsPage /> },
          { path: "/products/new", element: <ProductNewPage /> },
          { path: "/products/:id", element: <ProductDetailPage /> },
          { path: "/categories", element: <CategoriesPage /> },
          { path: "/stock", element: <StockPage /> },
        ],
      },
    ],
  },

  // Manager
  {
    element: <ManagerRoutes />,
    children: [
      {
        element: <RootLayout />,
        children: [{ path: "/admin", element: <AdminPage /> }],
      },
    ],
  },

  // Error
  {
    path: "*",
    element: <Page404 />,
  },
]);
