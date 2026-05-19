import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const emptyFile = fileURLToPath(new URL('./src/empty.js', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: 'fs', replacement: emptyFile },
      { find: 'path', replacement: emptyFile },
      { find: 'os', replacement: emptyFile },
      { find: 'util', replacement: emptyFile },
      { find: 'buffer', replacement: emptyFile },
      {
        find: /^@tensorflow\/tfjs-data\/dist\/sources\/file_data_source(?:\.js)?$/,
        replacement: emptyFile,
      },
    ],
  },
})
