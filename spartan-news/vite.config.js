import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Sitemap from 'vite-plugin-sitemap';

export default defineConfig({
  plugins: [
    vue(),
    Sitemap({
      hostname: 'https://spartan-news.pages.dev',
      generateRobotsTxt: false,
      robots: false,
      dynamicRoutes: [
        '/',
        '/scoreboard',
        '/live',
        '/pastlives'
      ]
    })
  ]
});