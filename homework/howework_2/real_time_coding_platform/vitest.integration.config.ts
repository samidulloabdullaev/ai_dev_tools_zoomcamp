import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        name: 'integration',
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./tests/integration/setup.ts'],
        include: ['tests/integration/**/*.test.ts'],
        testTimeout: 15000,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
