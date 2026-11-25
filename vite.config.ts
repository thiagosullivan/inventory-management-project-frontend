import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

process.env.VITE_CONFIG_NATIVE_IGNORE_WARNING = "true";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "vendor-react",
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 20,
            },
            {
              name: "vendor-recharts",
              test: /node_modules[\\/](recharts|d3-|victory-vendor)[\\/]/,
              priority: 15,
            },
            {
              name: "vendor-ui",
              test: /node_modules[\\/](@radix-ui|class-variance-authority|clsx|tailwind-merge|lucide-react)[\\/]/,
              priority: 10,
            },
            {
              name: "vendor-socket",
              test: /node_modules[\\/]socket\.io-client[\\/]/,
              priority: 10,
            },
            {
              name: "vendor-query",
              test: /node_modules[\\/]@tanstack[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
});
