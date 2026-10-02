import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    proxy: {
      "/api": {
        // The app calls "/api" (VITE_API_BASE_URL=/api) so every request is
        // same-origin in the browser. This is required, not just convenient:
        // cricketapp.in returns no Access-Control-* headers and answers the
        // CORS preflight with 405, so calling https://cricketapp.in/v1
        // directly from http://localhost:5173 fails the preflight on every
        // login (POST + JSON) and on every Authorization-bearing request.
        target: "https://cricketapp.in",
        changeOrigin: true,
        // Keep this rewrite: /api/matches exists upstream but
        // /api/locations, /api/country-codes and /api/verify-otp do not.
        rewrite: (path) => path.replace(/^\/api/, "/v1"),
      },
    },
  },
});
