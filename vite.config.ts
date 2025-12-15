import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/widget.ts',
            name: 'SupportWidget',
            fileName: 'widget',
            formats: ['iife']
        },
        outDir: 'dist',
        minify: 'terser',
        rollupOptions: {
            output: {
                inlineDynamicImports: true
            }
        }
    }
});
