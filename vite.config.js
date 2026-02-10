/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
/** SPA fallback for preview: serve index.html for non-asset routes (so /signin etc. work in e2e). */
function spaFallbackPreview() {
    return {
        name: "spa-fallback-preview",
        configurePreviewServer: function (server) {
            server.middlewares.use(function (req, res, next) {
                var _a;
                if (req.method !== "GET")
                    return next();
                var url = ((_a = req.url) !== null && _a !== void 0 ? _a : "/").split("?")[0];
                if (url.startsWith("/assets/") || path.extname(url).length > 0)
                    return next();
                var index = path.join(__dirname, "dist", "index.html");
                if (!fs.existsSync(index))
                    return next();
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/html");
                res.end(fs.readFileSync(index, "utf-8"));
            });
        },
    };
}
export default defineConfig({
    plugins: [react(), tailwindcss(), spaFallbackPreview()],
    test: {
        environment: "jsdom",
        setupFiles: ["./src/test/setup.ts"],
        globals: true,
        exclude: ["**/node_modules/**", "**/e2e/**", "**/dist/**"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            exclude: ["node_modules/", "src/test/", "**/*.test.ts", "**/*.test.tsx"],
            thresholds: {
                lines: 5,
                functions: 5,
                branches: 5,
                statements: 5,
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        port: 5173,
        proxy: {
            "/api": {
                target: "http://localhost:8000",
                changeOrigin: true,
            },
        },
    },
    preview: {
        port: 4173,
        host: "127.0.0.1",
    },
});
