import { defineCollection, z } from 'astro:content';

// ─── Product schema ───────────────────────────────────────────────
// 只校验必填的核心字段，其余全部用 z.any() 保持灵活
// 这样不同品类、不同结构的产品数据都不会报类型错误
const productSchema = z.object({
  id:       z.string(),
  name:     z.string(),
  slug:     z.string(),
  category: z.string(),

  affiliate: z.object({
    link: z.string(),
    id:   z.string(),
  }).passthrough(),

  pricing: z.object({
    starting_from:   z.string(),
    money_back_days: z.number(),
    plans:           z.array(z.any()).optional(),
  }).passthrough(),

  ratings: z.object({
    overall: z.number(),
  }).passthrough(),

  meta: z.object({
    published: z.boolean(),
  }).passthrough(),

  // 以下字段结构因产品而异，全部宽松处理
  logo:             z.string().optional(),
  screenshot:       z.string().optional(),
  tagline:          z.string().optional(),
  description:      z.string().optional(),
  founded_year:     z.number().optional(),
  hq_country:       z.string().optional(),
  website:          z.string().optional(),
  performance:      z.any().optional(),
  features:         z.any().optional(),
  platform_support: z.any().optional(),
  support:          z.any().optional(),
  pros:             z.array(z.string()).optional(),
  cons:             z.array(z.string()).optional(),
  best_for:         z.array(z.string()).optional(),
  not_good_for:     z.array(z.string()).optional(),
  awards:           z.array(z.any()).optional(),
  comparison_tags:  z.array(z.string()).optional(),
  deal:             z.any().optional(),
  seo:              z.any().optional(),
});

// ─── Page schema ──────────────────────────────────────────────────
// 只校验路由和 SEO 必填字段，内容字段全部宽松
const pageSchema = z.object({
  slug:           z.string(),
  page_type:      z.enum(['review', 'deal', 'best-of', 'how-to', 'brand']),
  template_style: z.enum(['tech', 'home', 'food', 'pet', 'electronic']),
  product_ref:    z.string().nullable(),

  seo: z.object({
    title:       z.string(),
    description: z.string(),
    keywords: z.object({
      primary: z.string(),
    }).passthrough(),
    on_page: z.object({
      h1:       z.string(),
      h2_list:  z.array(z.string()),
      url_slug: z.string(),
    }).passthrough(),
    canonical: z.string(),
  }).passthrough(),

  meta: z.object({
    publish_date: z.string(),
    published:    z.boolean(),
    author:       z.string(),
  }).passthrough(),

  // 内容字段结构因页面类型而异，全部宽松处理
  hero:             z.any().optional(),
  summary_box:      z.any().optional(),
  content_sections: z.any().optional(),
  steps:            z.any().optional(),
  ranked_items:     z.any().optional(),
  how_to_use:       z.any().optional(),
  methodology:      z.any().optional(),
  comparison:       z.any().optional(),
  trust_signals:    z.any().optional(),
  cta_blocks:       z.any().optional(),
  faqs:             z.any().optional(),
  troubleshooting:  z.any().optional(),
  about_sections:   z.any().optional(),
  related_pages:    z.array(z.string()).optional(),
  internal_links:   z.any().optional(),
});

// ─── Reviews schema ───────────────────────────────────────────────
const reviewsSchema = z.object({
  product_ref: z.string(),
  aggregate: z.object({
    score: z.number(),
    total: z.number(),
  }).passthrough(),
  items: z.array(z.object({
    id:     z.string(),
    author: z.string(),
    rating: z.number(),
    title:  z.string(),
    body:   z.string(),
    date:   z.string(),
  }).passthrough()),
});

export const collections = {
  products: defineCollection({ type: 'data', schema: productSchema }),
  pages:    defineCollection({ type: 'data', schema: pageSchema }),
  reviews:  defineCollection({ type: 'data', schema: reviewsSchema }),
};
