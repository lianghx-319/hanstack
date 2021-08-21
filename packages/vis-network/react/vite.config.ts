import reactRefresh from "@vitejs/plugin-react-refresh";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.tsx"),
      name: "VisNetworkReact",
      fileName: (format) => `VisNetwork.${format}.js`,
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["react", "lodash", "vis-network", "vis-data"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: "React",
          lodash: "_",
          "vis-network": "vis",
          "vis-data": "vis",
        },
      },
    },
  },
});
