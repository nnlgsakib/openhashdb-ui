import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';


import adapter from '@sveltejs/adapter-static';

export default {
    kit: {
        adapter: adapter({
            out: 'build',
            fallback: 'index.html' // For SPA routing
        }),
        prerender: {
            entries: ['*'] // Prerender all routes for static site generation
        }
    },
    preprocess: vitePreprocess()
};