/**
 * pages/sitemap.xml.ts
 * 自动生成 sitemap，按 page_type 设置优先级和更新频率
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import siteConfig from '../config/seo.config.json';

export const GET: APIRoute = async () => {
  const pages = await getCollection('pages', ({ data }) => data.meta.published && data.seo.index !== false);
  const site  = siteConfig.site.domain;

  const typeUrlPrefix: Record<string, string> = {
    review:   '/review',
    deal:     '/deals',
    'best-of': '/best',
    'how-to': '/how-to',
    brand:    '/brand',
  };
  const changefreqMap: Record<string, string> = {
    review:   siteConfig.sitemap.changefreq_review,
    deal:     siteConfig.sitemap.changefreq_deal,
    'best-of': siteConfig.sitemap.changefreq_best_of,
    'how-to': siteConfig.sitemap.changefreq_how_to,
    brand:    siteConfig.sitemap.changefreq_brand,
  };
  const priorityMap: Record<string, number> = {
    review:   siteConfig.sitemap.priority_review,
    deal:     siteConfig.sitemap.priority_deal,
    'best-of': siteConfig.sitemap.priority_best_of,
    'how-to': siteConfig.sitemap.priority_how_to,
    brand:    siteConfig.sitemap.priority_brand,
  };

  const urls = pages.map(p => {
    const prefix = typeUrlPrefix[p.data.page_type] ?? '/review';
    const loc    = `${site}${prefix}/${p.data.slug}`;
    const lastmod = p.data.meta.update_date ?? p.data.meta.publish_date;
    const changefreq = changefreqMap[p.data.page_type] ?? 'monthly';
    const priority   = (priorityMap[p.data.page_type] ?? 0.7).toFixed(1);
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${urls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
