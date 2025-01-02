import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import inject from "@rollup/plugin-inject";
import checker from "vite-plugin-checker";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    inject({
      $: "jquery",
      jQuery: "jquery",
    }),
    checker({
      typescript: true,
    }),
  ],
  postcss: {
    plugins: {
      tailwind: {},
      autoprefixer: {},
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
