import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/punis-budget-mobile/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["icon-192.png", "icon-512.png"],
      manifest: {
        name: "The PUNIs Budget Mobile",
        short_name: "PUNIs Budget",
        description: "A colourful mobile-first budget tracker",
        theme_color: "#10b981",
        background_color: "#020617",
        display: "standalone",
        start_url: "/punis-budget-mobile/",
        scope: "/punis-budget-mobile/",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ]
});