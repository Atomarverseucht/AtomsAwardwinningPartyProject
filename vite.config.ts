import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    root: 'src/client',
    server: {
        proxy: {
            '/api': 'http://localhost:3000',
        },
    },
    build: {
        outDir: resolve(__dirname, 'dist-client'),
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/client/index.html')
            },
        },
    },
});
