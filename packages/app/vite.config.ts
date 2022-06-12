import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Unocss from '@unocss/vite'
import presetUno from '@unocss/preset-uno'
import presetAttributify from '@unocss/preset-attributify'

// https://vitejs.dev/config/
export default defineConfig({
  root: './client',
  build: {
    outDir: '../dist/client',
  },
  plugins: [
    Unocss({
      presets: [presetUno(), presetAttributify()],
    }),
    react({
      babel: {
        plugins: [
          process.env.NODE_ENV === 'production' && [
            'import',
            {
              style: 'css',
              libraryName: 'antd',
            },
          ],
        ].filter(Boolean),
      },
    }),
  ],
})
