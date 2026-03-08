import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": "/src" },
  },
  base: "/garden-app/",
  server: {
    host: true,
    port: 5173,
  },
});
