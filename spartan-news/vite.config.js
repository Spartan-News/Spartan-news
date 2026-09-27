import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Sitemap from 'vite-plugin-sitemap'

export default defineConfig({
  plugins: [
    vue(),
    Sitemap({
      hostname: 'https://spartan-news.lsg1.workers.dev', // Replace with your custom domain or Cloudflare Pages URL
      dynamicRoutes: [
        '/',
        '/live',
        '/pastlives'
      ]
    })
  ]
})