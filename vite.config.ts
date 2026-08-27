import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// BASE_PATH is set by the Pages workflow ("/<repo-name>/"); local builds serve from "/".
export default defineConfig(({ mode }) => ({
  base: mode === 'single' ? './' : (process.env.BASE_PATH ?? '/'),
  plugins: [react(), tailwindcss(), ...(mode === 'single' ? [viteSingleFile()] : [])],
}))
