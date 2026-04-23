import type { APIRoute } from 'astro';
import siteConfig from '../config/seo.config.json';

export const GET: APIRoute = () => {
  const site = siteConfig.site.domain;
  const body = `User-agent: *
Allow: /

Sitemap: ${site}/sitemap.xml
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
};
