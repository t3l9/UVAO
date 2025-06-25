// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"]
  },
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        // Ваш Flask-сервер
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        secure: false
        // Если нужно отключить проверку SSL (для локальной разработки)
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogdHJ1ZSxcbiAgICBwcm94eToge1xuICAgICAgJy9hcGknOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly8xMjcuMC4wLjE6NTAwMCcsICAvLyBcdTA0MTJcdTA0MzBcdTA0NDggRmxhc2stXHUwNDQxXHUwNDM1XHUwNDQwXHUwNDMyXHUwNDM1XHUwNDQwXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaS8sICcnKSxcbiAgICAgICAgc2VjdXJlOiBmYWxzZSwgIC8vIFx1MDQxNVx1MDQ0MVx1MDQzQlx1MDQzOCBcdTA0M0RcdTA0NDNcdTA0MzZcdTA0M0RcdTA0M0UgXHUwNDNFXHUwNDQyXHUwNDNBXHUwNDNCXHUwNDRFXHUwNDQ3XHUwNDM4XHUwNDQyXHUwNDRDIFx1MDQzRlx1MDQ0MFx1MDQzRVx1MDQzMlx1MDQzNVx1MDQ0MFx1MDQzQVx1MDQ0MyBTU0wgKFx1MDQzNFx1MDQzQlx1MDQ0RiBcdTA0M0JcdTA0M0VcdTA0M0FcdTA0MzBcdTA0M0JcdTA0NENcdTA0M0RcdTA0M0VcdTA0MzkgXHUwNDQwXHUwNDMwXHUwNDM3XHUwNDQwXHUwNDMwXHUwNDMxXHUwNDNFXHUwNDQyXHUwNDNBXHUwNDM4KVxuICAgICAgfSxcbiAgICB9LFxuICB9LFxufSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxPQUFPLFdBQVc7QUFFbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxjQUFjO0FBQUEsRUFDMUI7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLFVBQVUsRUFBRTtBQUFBLFFBQzVDLFFBQVE7QUFBQTtBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
