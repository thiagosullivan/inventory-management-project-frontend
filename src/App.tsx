import { RouterProvider } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./contexts/AuthContext";
import { router } from "./routes";
import { Toaster } from "sonner";
import { ThemeProvider } from "./components/themeProvider";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1e90ff",
              color: "white",
            },
          }}
        />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
