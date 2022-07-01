import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Unocss from '@unocss/vite'
import presetUno from '@unocss/preset-uno'
import presetAttributify from '@unocss/preset-attributify'
import vitePluginImp from 'vite-plugin-imp'
import viteCompression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig({
  root: './client',
  build: {
    outDir: '../dist/web',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:9090',
        changeOrigin: true,
      },
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          '@primary-color': '#08b',
        },
        javascriptEnabled: true,
      },
    },
  },
  plugins: [
    Unocss({
      presets: [presetUno(), presetAttributify()],
      configFile: false,
    }),
    react(),
    // br
    viteCompression({
      filter: /\.(js|mjs|json|css|html|ttf|svg)$/i,
      algorithm: 'brotliCompress',
    }),
    vitePluginImp({
      libList: [
        {
          libName: 'antd',
          style(name) {
            // use less
            return `antd/es/${name}/style/index.js`
          },
        },
      ],
    }),
  ],
})
