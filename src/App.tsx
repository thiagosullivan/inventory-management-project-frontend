import { Route, Routes } from "react-router-dom";
import "./App.css";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";

import DashboardPage from "./Pages/Dashboard";
import ForgotPasswordPage from "./Pages/ForgotPassword";
import HomePage from "./Pages/Home";
import ProductsPage from "./Pages/Products";
import StockPage from "./Pages/Stock";

function App() {
  return (
    <div>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <HomePage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stock"
          element={
            <ProtectedRoute>
              <StockPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
