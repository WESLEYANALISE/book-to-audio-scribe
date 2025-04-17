import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  //  ─────────── Aqui ───────────
  // Em produção, serve a partir de https://SEU_USER.github.io/SEU_REPO/
  base: mode === "production" ? "/https://github.com/WESLEYANALISE/book-to-audio-scribe.git/" : "/",
  // ─────────────────────────────

  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
