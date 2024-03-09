import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import packageJson from "./package.json";

export default defineConfig({
  base: "",
  plugins: [
    react(),
    viteStaticCopy({
      targets: [{ src: "build/*", dest: "" }],
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __BUILD_DATE__: JSON.stringify(Date.now()),
  },
});
