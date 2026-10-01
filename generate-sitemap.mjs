import { writeFileSync, existsSync, mkdirSync } from 'fs';

const domain = 'https://shsnews.live';
const routes = ['', '/scoreboard', '/live', '/pastlives'];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${domain}${route}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

if (!existsSync('dist')) {
  mkdirSync('dist', { recursive: true });
}

writeFileSync('dist/sitemap.xml', sitemap);
console.log('Successfully generated dist/sitemap.xml for shsnews.live');