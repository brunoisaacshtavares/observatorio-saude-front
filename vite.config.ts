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
          target: env.VITE_API_URL || "https://obeservatorio-saude-api-165421927123.southamerica-east1.run.app",
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
