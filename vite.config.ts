import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const privateDataPattern=path.resolve(import.meta.dirname,'data/**').replaceAll('\\','/');
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      ws: process.env.DISABLE_HMR==='true'?(false as const):{port:Number(process.env.PORT||3000)+1000},
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : { ignored: ['**/.local-data/**', privateDataPattern] },
      fs: { deny: ['.env', '.env.*', '**/.git/**', '**/.local-data/**', privateDataPattern] },
    },
  };
});
