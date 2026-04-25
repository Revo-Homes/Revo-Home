import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxyTarget =
    env.VITE_API_PROXY_TARGET ||
    env.VITE_API_URL ||
    env.VITE_CORE_API_URL?.replace(/\/api\/v1\/?$/, '') ||
    'http://localhost:3002'

  return {
    plugins: [react()],
    server: {
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})
