import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Determine the API proxy target
  let apiProxyTarget = 'http://localhost:5000'

  if (env.VITE_API_PROXY_TARGET) {
    apiProxyTarget = env.VITE_API_PROXY_TARGET
  } else if (env.VITE_API_URL && env.VITE_API_URL.startsWith('http')) {
    apiProxyTarget = env.VITE_API_URL
  } else if (env.VITE_CORE_API_URL && env.VITE_CORE_API_URL.startsWith('http')) {
    apiProxyTarget = env.VITE_CORE_API_URL.replace(/\/api\/v1\/?$/, '')
  }

  console.log(`[Vite Config] API Proxy Target: ${apiProxyTarget}`)

  return {
    plugins: [react()],
    server: {
      historyApiFallback: {
        rewrites: [
          { from: /^\/payment\/success/, to: '/index.html' },
          { from: /^\/payment\/failure/, to: '/index.html' },
          { from: /./, to: '/index.html' }
        ]
      },
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
          cookiePathRewrite: '/',
          cookieDomainRewrite: 'localhost'
        }
      }
    }
  }
})
