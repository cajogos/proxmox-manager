import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { readFileSync, existsSync } from 'fs';

function getApiPort(): number {
  const configPath = path.resolve(__dirname, '../config.json');
  if (existsSync(configPath)) {
    try {
      const raw = JSON.parse(readFileSync(configPath, 'utf-8')) as Record<string, unknown>;
      if (typeof raw['serverPort'] === 'number') return raw['serverPort'];
    } catch {
      // fall through to default
    }
  }
  return 3000;
}

const apiPort = getApiPort();
const apiTarget = `http://localhost:${apiPort}`;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': apiTarget,
      '/health': apiTarget,
      '/ws': { target: apiTarget.replace('http', 'ws'), ws: true },
    },
  },
});
