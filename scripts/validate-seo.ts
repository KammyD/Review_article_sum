#!/usr/bin/env tsx
/**
 * scripts/validate-seo.ts
 * 构建前 SEO 自动校验脚本
 * 运行：npx tsx scripts/validate-seo.ts
 *
 * 校验规则：
 * 1. title ≤ 60 字（含站点后缀）
 * 2. description ≤ 160 字
 * 3. 每页 primary keyword 全局唯一（不同页面不能抢同一主关键词）
 * 4. H1 必须存在
 * 5. canonical 必须以 / 开头
 * 6. og_image 必须存在
 * 7. slug 全局唯一
 * 8. primary keyword 必须出现在 title 或 H1 中
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const TITLE_SUFFIX = ' | BestPicks';
const MAX_TITLE_LEN = 60;
const MAX_DESC_LEN  = 160;

interface PageData {
  slug: string;
  page_type: string;
  seo: {
    title: string;
    description: string;
    keywords: { primary: string };
    on_page: { h1: string; url_slug: string };
    canonical: string;
    og_image?: string;
    index?: boolean;
  };
  meta: { published: boolean };
}

function readJsonFiles(dir: string): PageData[] {
  const results: PageData[] = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        results.push(...readJsonFiles(fullPath));
      } else if (extname(entry) === '.json') {
        try {
          const content = readFileSync(fullPath, 'utf-8');
          const data = JSON.parse(content);
          if (data.page_type && data.seo) {
            results.push(data);
          }
        } catch {
          // not a page file, skip
        }
      }
    }
  } catch {
    // dir doesn't exist yet
  }
  return results;
}

const pagesDir = join(process.cwd(), 'src', 'content', 'pages');
const pages    = readJsonFiles(pagesDir).filter(p => p.meta?.published !== false);

const errors:   string[] = [];
const warnings: string[] = [];

const primaryKeywords = new Map<string, string>();
const slugs           = new Map<string, string>();

for (const page of pages) {
  const { slug, seo } = page;
  const titleFull = seo.title + TITLE_SUFFIX;

  // 1. Title 长度
  if (titleFull.length > MAX_TITLE_LEN) {
    errors.push(`[${slug}] title 超过${MAX_TITLE_LEN}字 (${titleFull.length}字): "${titleFull}"`);
  }

  // 2. Description 长度
  if (!seo.description) {
    errors.push(`[${slug}] 缺少 description`);
  } else if (seo.description.length > MAX_DESC_LEN) {
    errors.push(`[${slug}] description 超过${MAX_DESC_LEN}字 (${seo.description.length}字)`);
  }

  // 3. Primary keyword 全局唯一
  const pk = seo.keywords?.primary;
  if (!pk) {
    errors.push(`[${slug}] 缺少 seo.keywords.primary`);
  } else if (primaryKeywords.has(pk)) {
    errors.push(`[${slug}] 主关键词 "${pk}" 与 [${primaryKeywords.get(pk)}] 重复！会导致自我竞争`);
  } else {
    primaryKeywords.set(pk, slug);
  }

  // 4. H1 必须存在
  if (!seo.on_page?.h1) {
    errors.push(`[${slug}] 缺少 seo.on_page.h1`);
  }

  // 5. Canonical 格式
  if (!seo.canonical) {
    errors.push(`[${slug}] 缺少 canonical`);
  } else if (!seo.canonical.startsWith('/')) {
    errors.push(`[${slug}] canonical 必须以 / 开头，当前: "${seo.canonical}"`);
  }

  // 6. OG image
  if (!seo.og_image) {
    warnings.push(`[${slug}] 缺少 og_image（影响社交分享展示效果）`);
  }

  // 7. Slug 唯一性
  if (slugs.has(slug)) {
    errors.push(`[${slug}] slug 与另一个页面重复！`);
  } else {
    slugs.set(slug, page.page_type);
  }

  // 8. 主关键词必须出现在 title 或 H1 中
  if (pk && seo.on_page?.h1) {
    const pkLower = pk.toLowerCase();
    const inTitle = (seo.title ?? '').toLowerCase().includes(pkLower);
    const inH1    = (seo.on_page.h1 ?? '').toLowerCase().includes(pkLower);
    if (!inTitle && !inH1) {
      warnings.push(`[${slug}] 主关键词 "${pk}" 未出现在 title 或 H1 中`);
    }
  }
}

// ── 输出结果
console.log(`\n🔍 SEO 校验 — 共检查 ${pages.length} 个已发布页面\n`);

if (warnings.length > 0) {
  console.log('⚠️  警告（不阻断构建）：');
  warnings.forEach(w => console.log(`   ⚠  ${w}`));
  console.log('');
}

if (errors.length > 0) {
  console.error('❌ 错误（必须修复）：');
  errors.forEach(e => console.error(`   ✗  ${e}`));
  console.error(`\n共 ${errors.length} 个错误，请修复后重新构建。\n`);
  process.exit(1);
} else {
  console.log(`✅ 所有页面 SEO 校验通过！\n`);
}
