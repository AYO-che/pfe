import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/plans": "http://localhost:5000",
      "/conversations": "http://localhost:5000",
      "/messages": "http://localhost:5000",
      "/auth": "http://localhost:5000",
      "/login": "http://localhost:5000",
      "/signup": "http://localhost:5000",
      "/logout": "http://localhost:5000",
      "/me": "http://localhost:5000",
    }
  }
});