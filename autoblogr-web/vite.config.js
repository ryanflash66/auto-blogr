import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    exclude: [],
    include: ["@clerk/clerk-react", "react", "react-dom", "react-router-dom"],
    force: false, // Changed from true to false to avoid file locking issues
    esbuildOptions: {
      loader: {
        ".js": "jsx", // This is crucial for .js files with JSX
      },
      target: "esnext",
      keepNames: true,
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Fix for React 18 useSyncExternalStore compatibility
      "use-sync-external-store/shim/index.js": "react",
    },
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },

  esbuild: {
    loader: "jsx",
    include: /.*\.[jt]sx?$/,
  },

  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true,
    },
  },

  build: {
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
        },
      },
    },
  },
});
