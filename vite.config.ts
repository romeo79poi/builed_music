import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Initialize Socket.IO if the method exists
      if (typeof (app as any).setupSocketIO === 'function') {
        try {
          (app as any).setupSocketIO(server.httpServer);
        } catch (error) {
          console.warn('⚠️ Failed to initialize Socket.IO:', error);
        }
      }

      // Add Express app as middleware to handle all requests
      // This needs to be added before Vite's internal middleware
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/api')) {
          // Forward API requests to Express app
          app(req, res, next);
        } else {
          // Let Vite handle non-API requests
          next();
        }
      });
    },
  };
}
