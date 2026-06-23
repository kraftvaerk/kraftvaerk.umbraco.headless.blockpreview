import { defineConfig } from "vite";

const outDir = process.env.OUT_DIR ?? './../Kraftvaerk.Umbraco.Headless.BlockPreview.Backend/ui';
const devMode = !!process.env.OUT_DIR;

export default defineConfig({
    build: {
        lib: {
            entry: "src/index.ts",
            formats: ["es"],
            fileName: "dist",
        },
        outDir,
        emptyOutDir: !devMode,
        sourcemap: true,
        rollupOptions: {
            external: [/^@umbraco/],
        },
    },
});

