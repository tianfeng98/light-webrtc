import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\/(.*)/, replacement: resolve(__dirname, "src/$1") },
      { find: /^#\/(.*)/, replacement: resolve(__dirname, "demo/$1") },
    ],
  },
  build: {
    lib: {
      name: "LightWebRTC",
      entry: "./src/index.ts",
      formats: ["es", "cjs", "iife"],
      fileName: "index",
    },
    minify: true,
  },
});
