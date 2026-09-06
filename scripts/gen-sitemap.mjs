import { writeFileSync } from 'node:fs';

const SITE = process.env.SITE_URL || 'https://kpop-playground.vercel.app';
const today = new Date().toISOString().slice(0, 10);
const urls = ['/', '/quiz', '/balance', '/worldcup', '/mv-worldcup', '/fancam-worldcup'];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${SITE}${u}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;

writeFileSync('dist/sitemap.xml', sitemap);
writeFileSync('dist/robots.txt', robots);
console.log(`\u2713 sitemap.xml (${urls.length} URLs) + robots.txt`);
