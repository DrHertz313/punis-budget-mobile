import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/punis-budget-mobile/",
  plugins: [
    react({
      jsxRuntime: "classic",
    }),
  ],
});