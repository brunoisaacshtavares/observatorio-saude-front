import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "https://observatorio-saude-production-1015.up.railway.app",
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
