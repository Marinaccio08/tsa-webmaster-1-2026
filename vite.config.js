import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        authState: "./src/authState.js",
        register: "./src/register.js",
        signIn: "./src/signIn.js",
        forum: "./src/forum.js",
      },
      output: {
        entryFileNames: "src/[name].js",
        chunkFileNames: "src/[name]-[hash].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
});
