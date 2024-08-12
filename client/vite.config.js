import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
const backendUrl = 'http://127.0.0.1:8000';
// 'http://localhost:3000'
// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: backendUrl,
        secure: false,
      },
    },
  },

  plugins: [react()],
});
