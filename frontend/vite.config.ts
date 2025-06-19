import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy every `/api/*` call to the FastAPI server on :8000
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8000",
    },
  },
});
