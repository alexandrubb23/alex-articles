import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import api from './src/plugins/api-plugin';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), api()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src/'),
    },
  },
});
