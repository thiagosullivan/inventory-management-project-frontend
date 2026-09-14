import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/Home.tsx";
import ForgotPasswordPage from "./pages/ForgotPassword.tsx";
import { PublicRoute } from "./components/PublicRoute.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";
import DashboardPage from "./pages/Dashboard.tsx";
import ProductsPage from "./pages/Products.tsx";
import RootLayout from "./components/layouts/RootLayout.tsx";
import Page404 from "./pages/Page404.tsx";

export const router = createBrowserRouter([
  // Public
  {
    element: <PublicRoute />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      // { path: "*", element: <Page404 /> },
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
