import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    {
      name: 'configure-pbf-middleware',
      configureServer(server) {
        // Middleware to set correct headers for .pbf files
        server.middlewares.use((req, res, next) => {
          if (req.url.endsWith('.pbf')) {
            res.setHeader('Content-Type', 'application/vnd.mapbox-vector-tile');
            res.setHeader('Content-Encoding', 'gzip'); // If files are gzipped
          }
          next();
        });
      }
    }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  envDir: './env',
})

// import { fileURLToPath, URL } from "node:url";

// import { defineConfig } from "vite";
// import vue from "@vitejs/plugin-vue";

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [vue()],
//   resolve: {
//     alias: {
//       "@": fileURLToPath(new URL("./src", import.meta.url)),
//     },
//   },
//   envDir: "./env",
//   define: {
//     // enable hydration mismatch details in production build
//     __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
//   }
// });
