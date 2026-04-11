import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const r = (p: string) => path.resolve(__dirname, p)

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'tasksManager',
      filename: 'remoteEntry.js',
      exposes: {
        './TasksManager': './src/exposes/TasksManager.tsx',
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
    }),
  ],
  resolve: {
    dedupe: ['react', 'react-dom', '@hello-pangea/dnd'],
    alias: {
      '@': r('./src'),
      // Una sola copia de React para la app y para @hello-pangea/dnd (evita "Invalid hook call").
      react: r('./node_modules/react'),
      'react-dom': r('./node_modules/react-dom'),
    },
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
})
