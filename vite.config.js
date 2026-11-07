import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  // Exposes only the (public) Google client id under its plain name; no other
  // non-VITE_ variable reaches the browser bundle.
  define: {
    "import.meta.env.GOOGLE_CLIENT_ID": JSON.stringify(loadEnv(mode, process.cwd(), "GOOGLE_CLIENT_ID").GOOGLE_CLIENT_ID || ""),
  },
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    strictPort: true,
    // In development the API and the WebSocket both go through the dev server
    proxy: {
      "/api": "http://127.0.0.1:5000",
      "/socket.io": { target: "http://127.0.0.1:5000", ws: true },
    },
  },
}));
