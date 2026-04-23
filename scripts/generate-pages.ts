#!/usr/bin/env tsx
/**
 * scripts/generate-pages.ts
 * 批量生成落地页 JSON 配置文件
 *
 * 用法：
 *   npx tsx scripts/generate-pages.ts
 *
 * 配置 PRODUCTS_TO_GENERATE 数组，每个产品自动生成 20 个页面：
 *   - 4 个 review 页（不同关键词角度）
 *   - 4 个 deal 页（月份/节日/折扣码/黑五等）
 *   - 4 个 best-of 页（以该产品为榜首的榜单）
 *   - 4 个 how-to 页（安装/使用/设置/故障排除）
 *   - 4 个 brand 页（品牌详情/品牌对比/品牌历史/品牌评价）
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

// ── 配置：需要批量生成页面的产品
const PRODUCTS_TO_GENERATE = [
  {
    id: 'nordvpn',
    name: 'NordVPN',
    category: 'vpn',
    template_style: 'tech',
    year: '2025',
  },
  // 添加更多产品：
  // { id: 'expressvpn', name: 'ExpressVPN', category: 'vpn', template_style: 'tech', year: '2025' },
];

const PAGES_DIR = join(process.cwd(), 'src', 'content', 'pages');
const months = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
const currentMonth = months[new Date().getMonth()];

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function writeIfNotExists(path: string, content: any) {
  if (existsSync(path)) {
    console.log(`  ⏭  已存在，跳过: ${path.split('/').pop()}`);
    return;
  }
  writeFileSync(path, JSON.stringify(content, null, 2), 'utf-8');
  console.log(`  ✅ 生成: ${path.split('/').pop()}`);
}

// ── 页面模板生成函数

function makeReviewPage(prod: any, variant: number) {
  const variants = [
    { suffix: 'review',          pk: `${prod.id}评测`,      h1: `${prod.name} 评测 ${prod.year}：真的值得买吗？30天亲测报告`,              h2s: ['速度测试', '安全性分析', '价格与套餐', '常见问题解答'] },
    { suffix: 'review-detailed', pk: `${prod.id}怎么样`,    h1: `${prod.name} 怎么样？${prod.year}年深度评测：速度、安全、价格全解析`,    h2s: ['速度与稳定性', '隐私与安全', '客服与退款', '常见问题解答'] },
    { suffix: 'pros-cons',       pk: `${prod.id}优缺点`,    h1: `${prod.name} 优缺点深度分析 ${prod.year}：值得买吗？`,                   h2s: ['主要优点', '主要缺点', '适合哪些用户', '常见问题解答'] },
    { suffix: 'worth-it',        pk: `${prod.id}值得买吗`,  h1: `${prod.name} 值得买吗？${prod.year}年真实用户体验报告`,                  h2s: ['实际使用体验', '性价比分析', '与竞品对比', '常见问题解答'] },
  ];
  const v = variants[variant];
  const slug = `${prod.id}-${v.suffix}`;
  return {
    slug,
    page_type: 'review',
    template_style: prod.template_style,
    product_ref: prod.id,
    seo: {
      title: `${prod.name} ${v.suffix === 'review' ? '评测' : v.pk} ${prod.year}`.slice(0, 58),
      description: `亲测${prod.name}，速度、安全、价格全面分析。附独家优惠码，${prod.name}优缺点一次说清楚。`,
      keywords: {
        primary: v.pk,
        secondary: [`${prod.id} ${prod.year}`, `${prod.id}好用吗`, `${prod.id}推荐`],
        lsi: ['独立评测', '真实测试', '用户口碑'],
      },
      on_page: {
        h1: v.h1,
        h2_list: v.h2s,
        url_slug: slug,
      },
      schema: { type: 'Review', item_reviewed_name: prod.name, item_reviewed_type: 'SoftwareApplication', rating_value: 4.8, rating_count: 10000, best_rating: 5, worst_rating: 1, review_body_summary: `${prod.name}是${prod.year}年综合表现优秀的产品之一。` },
      canonical: `/review/${slug}`,
      og_image: `/images/og/${slug}.png`,
      index: true,
      follow: true,
      priority: 0.9,
      changefreq: 'monthly',
    },
    hero: { headline: v.h1, cta_primary_text: '立即查看优惠', show_countdown: false, badge_text: `${prod.year}年推荐` },
    faqs: [
      { q: `${prod.name} 值得买吗？`, a: `${prod.name}综合表现优秀，性价比高，适合大多数用户。`, keyword: `${prod.id}值得买` },
      { q: `${prod.name} 有退款保证吗？`, a: `是的，提供30天无理由退款保证，购买无风险。`, keyword: `${prod.id}退款` },
    ],
    related_pages: [`${prod.id}-coupon`, `best-${prod.category}-2025`, `${prod.id}-how-to-setup`],
    meta: { publish_date: `${prod.year}-01-01`, update_date: `${prod.year}-06-01`, author: 'admin', published: true },
  };
}

function makeDealPage(prod: any, variant: number) {
  const variants = [
    { suffix: 'coupon',        pk: `${prod.id}优惠码`,    title: `${prod.name} 优惠码 ${prod.year}${currentMonth}：独家折扣` },
    { suffix: 'discount',      pk: `${prod.id}折扣`,      title: `${prod.name} 最新折扣 ${prod.year}：限时优惠` },
    { suffix: 'black-friday',  pk: `${prod.id}黑五折扣`,  title: `${prod.name} 黑五折扣 ${prod.year}：年度最低价` },
    { suffix: 'cheapest',      pk: `${prod.id}最低价`,    title: `${prod.name} 最低价 ${prod.year}：怎么买最便宜` },
  ];
  const v = variants[variant];
  const slug = `${prod.id}-${v.suffix}`;
  return {
    slug,
    page_type: 'deal',
    template_style: prod.template_style,
    product_ref: prod.id,
    seo: {
      title: v.title.slice(0, 58),
      description: `最新${prod.name}优惠码，立省大量费用。已验证可用，含30天退款保证。`,
      keywords: {
        primary: v.pk,
        secondary: [`${prod.id}优惠`, `${prod.id}特惠`, `${prod.id}便宜买`],
        lsi: ['限时优惠', '独家折扣', '优惠码'],
      },
      on_page: {
        h1: v.title,
        h2_list: [`最新可用优惠码（已验证）`, `如何使用优惠码？3步完成`, `常见问题`],
        url_slug: slug,
      },
      schema: { type: 'Product', item_reviewed_name: prod.name, item_reviewed_type: 'SoftwareApplication', rating_value: 4.8, rating_count: 10000, best_rating: 5, worst_rating: 1, review_body_summary: '' },
      canonical: `/deals/${slug}`,
      og_image: `/images/og/${slug}.png`,
      index: true,
      follow: true,
      priority: 0.8,
      changefreq: 'daily',
    },
    hero: { headline: v.title, cta_primary_text: '立即领取折扣', show_countdown: true, badge_text: '独家优惠' },
    how_to_use: [
      { step: 1, text: '点击下方按钮，跳转官网' },
      { step: 2, text: '选择套餐，折扣自动应用' },
      { step: 3, text: '完成支付，立即使用' },
    ],
    faqs: [
      { q: `${prod.name}优惠码还有效吗？`, a: `截至${prod.year}年，优惠码仍然有效，已验证可正常使用。`, keyword: `${prod.id}优惠码有效` },
      { q: `${prod.name}购买后不满意能退款吗？`, a: `可以，提供30天无理由退款保障。`, keyword: `${prod.id}退款` },
    ],
    related_pages: [`${prod.id}-review`, `best-${prod.category}-2025`],
    meta: { publish_date: `${prod.year}-01-01`, update_date: new Date().toISOString().split('T')[0], author: 'admin', published: true },
  };
}

function makeBestOfPage(prod: any, variant: number) {
  const variants = [
    { suffix: `best-${prod.category}-2025`,     pk: `最好的${prod.category} 2025`,    h1: `${prod.year}年最好的10款${prod.category.toUpperCase()}排行榜：测试50款后的真实排名` },
    { suffix: `top-${prod.category}-for-streaming`, pk: `流媒体${prod.category}推荐`, h1: `${prod.year}年流媒体最佳${prod.category.toUpperCase()}推荐：解锁Netflix必备` },
    { suffix: `cheap-${prod.category}`,         pk: `便宜${prod.category}推荐`,       h1: `${prod.year}年最便宜好用的${prod.category.toUpperCase()}排行：价格不贵还好用` },
    { suffix: `best-${prod.category}-security`, pk: `最安全${prod.category}`,         h1: `${prod.year}年最安全的${prod.category.toUpperCase()}排行：隐私保护最强` },
  ];
  const v = variants[variant];
  return {
    slug: v.suffix,
    page_type: 'best-of',
    template_style: prod.template_style,
    product_ref: null,
    seo: {
      title: v.h1.slice(0, 58),
      description: `我们测试了50款产品，筛选出${prod.year}年最值得买的10款，含速度、安全、价格全面对比。每月更新。`,
      keywords: {
        primary: v.pk,
        secondary: [`${prod.category}推荐${prod.year}`, `${prod.category}排行榜`, `哪个${prod.category}好`],
        lsi: ['独立测试', '真实排名', '性价比'],
      },
      on_page: {
        h1: v.h1,
        h2_list: [`第1名：${prod.name} —— 综合最强`, '我们如何测试和评分', '如何选择适合自己的产品', '常见问题解答'],
        url_slug: v.suffix,
      },
      schema: { type: 'ItemList', list_name: v.h1, number_of_items: 10 },
      canonical: `/best/${v.suffix}`,
      og_image: `/images/og/${v.suffix}.png`,
      index: true,
      follow: true,
      priority: 0.85,
      changefreq: 'weekly',
    },
    hero: { headline: v.h1, subheadline: `独立测试50款 · 每月更新 · 真实数据`, badge_text: '每月更新' },
    ranked_items: [{ rank: 1, product_ref: prod.id, verdict: '综合最强', score: 4.8, highlight: '速度最快，安全性最高', cta_text: '查看优惠' }],
    methodology: {
      title: '我们如何测试和评分',
      body: '我们对每款产品进行为期30天的真实测试，涵盖速度、安全性、性价比等维度。',
      criteria: [
        { name: '速度测试', weight: '30%', description: '多地区真实速度测试' },
        { name: '安全性', weight: '25%', description: '加密、隐私政策、审计' },
        { name: '价格', weight: '20%', description: '性价比、退款政策' },
        { name: '易用性', weight: '15%', description: '界面、设置难度' },
        { name: '客服', weight: '10%', description: '响应速度、解决率' },
      ],
    },
    faqs: [
      { q: `${prod.year}年最好用的产品是哪个？`, a: `根据我们的综合测试，${prod.name}在速度、安全性和易用性方面综合表现最好。`, keyword: `${prod.year}最好的${prod.category}` },
    ],
    related_pages: [`${prod.id}-review`, `${prod.id}-coupon`],
    meta: { publish_date: `${prod.year}-01-01`, update_date: new Date().toISOString().split('T')[0], author: 'admin', published: true },
  };
}

function makeHowToPage(prod: any, variant: number) {
  const variants = [
    { suffix: 'how-to-setup',    pk: `${prod.id}怎么用`,      h1: `如何使用${prod.name}：5步详细图文教程（${prod.year}新手版）` },
    { suffix: 'how-to-install',  pk: `${prod.id}怎么安装`,    h1: `如何安装${prod.name}：电脑和手机全平台安装教程` },
    { suffix: 'how-to-settings', pk: `${prod.id}设置教程`,    h1: `${prod.name}最佳设置教程：这样配置速度最快` },
    { suffix: 'how-to-fix',      pk: `${prod.id}连不上怎么办`, h1: `${prod.name}连不上怎么办？5个解决方案（${prod.year}最新）` },
  ];
  const v = variants[variant];
  const slug = `${prod.id}-${v.suffix}`;
  return {
    slug,
    page_type: 'how-to',
    template_style: prod.template_style,
    product_ref: prod.id,
    seo: {
      title: v.h1.slice(0, 58),
      description: `手把手教你${v.pk.replace(prod.id, prod.name)}，全程5分钟，适合新手。含图文步骤和常见问题解答。`,
      keywords: {
        primary: v.pk,
        secondary: [`${prod.id}使用方法`, `${prod.id}教程`, `${prod.id}入门`],
        lsi: ['安装教程', '使用步骤', '操作指南'],
      },
      on_page: {
        h1: v.h1,
        h2_list: ['第一步：准备工作', '第二步：安装配置', '第三步：开始使用', '常见问题排除'],
        url_slug: slug,
      },
      schema: { type: 'HowTo', how_to_name: v.h1, total_time: 'PT5M' },
      canonical: `/how-to/${slug}`,
      og_image: `/images/og/${slug}.png`,
      index: true,
      follow: true,
      priority: 0.7,
      changefreq: 'monthly',
    },
    hero: { headline: v.h1, subheadline: '全程5分钟 · 图文并茂 · 适合新手', cta_primary_text: '先领取优惠再操作', badge_text: '新手友好' },
    steps: [
      { position: 1, name: '注册账号', text: `访问${prod.name}官网，选择套餐完成注册。` },
      { position: 2, name: '下载安装', text: '根据设备选择对应版本下载安装。' },
      { position: 3, name: '登录使用', text: '登录后点击快速连接即可开始使用。' },
      { position: 4, name: '验证连接', text: '访问ipleak.net确认连接成功。' },
      { position: 5, name: '优化设置', text: '根据需求选择最适合的服务器和协议。' },
    ],
    troubleshooting: [
      { problem: `${prod.name}连不上怎么办？`, solution: '尝试切换协议或更换服务器节点。' },
    ],
    faqs: [
      { q: `${prod.name}好上手吗？`, a: `非常容易，点击快速连接即可，新手5分钟内即可学会。`, keyword: `${prod.id}好上手吗` },
    ],
    related_pages: [`${prod.id}-review`, `${prod.id}-coupon`],
    meta: { publish_date: `${prod.year}-01-01`, update_date: `${prod.year}-06-01`, author: 'admin', published: true },
  };
}

function makeBrandPage(prod: any, variant: number) {
  const variants = [
    { suffix: 'brand',          pk: prod.id,                   h1: `${prod.name} 完整指南 ${prod.year}：功能、价格、评价全解析` },
    { suffix: 'brand-review',   pk: `${prod.id}官网`,          h1: `${prod.name} 官方介绍：这家公司到底怎么样？` },
    { suffix: 'brand-features', pk: `${prod.id}功能介绍`,      h1: `${prod.name} 全部功能详解：每个功能有什么用？` },
    { suffix: 'brand-pricing',  pk: `${prod.id}价格`,          h1: `${prod.name} 价格详解 ${prod.year}：哪个套餐最划算？` },
  ];
  const v = variants[variant];
  const slug = `${prod.id}-${v.suffix}`;
  return {
    slug,
    page_type: 'brand',
    template_style: prod.template_style,
    product_ref: prod.id,
    seo: {
      title: v.h1.slice(0, 58),
      description: `${prod.name}的功能、定价、优缺点详细介绍。含用户评价、独家优惠码及购买建议。`,
      keywords: {
        primary: v.pk,
        secondary: [`${prod.id}怎么样`, `${prod.id}介绍`, `${prod.id}评价`],
        lsi: ['品牌介绍', '功能详解', '用户评价'],
      },
      on_page: {
        h1: v.h1,
        h2_list: [`${prod.name}是什么？`, '核心功能详解', '价格与套餐', '用户真实评价', '常见问题解答'],
        url_slug: slug,
      },
      schema: { type: 'Product', item_reviewed_name: prod.name, item_reviewed_type: 'SoftwareApplication', rating_value: 4.8, rating_count: 10000, best_rating: 5, worst_rating: 1, review_body_summary: `${prod.name}是领先的产品之一。` },
      canonical: `/brand/${slug}`,
      og_image: `/images/og/${slug}.png`,
      index: true,
      follow: true,
      priority: 0.75,
      changefreq: 'monthly',
    },
    hero: { headline: v.h1, cta_primary_text: '立即领取优惠', cta_secondary_text: '查看详细评测', badge_text: `${prod.year}年推荐` },
    about_sections: [
      { title: `${prod.name}是什么？`, body: `${prod.name}是一款领先的${prod.category}产品，以其出色的性能和可靠性著称。` },
      { title: '核心功能', features: [{ name: '核心功能1', desc: '功能描述，请填写实际内容。' }] },
    ],
    faqs: [
      { q: `${prod.name}值得买吗？`, a: `对于有需求的用户来说非常值得，且有退款保证，购买风险极低。`, keyword: `${prod.id}值得买` },
    ],
    related_pages: [`${prod.id}-review`, `${prod.id}-coupon`],
    meta: { publish_date: `${prod.year}-01-01`, update_date: `${prod.year}-06-01`, author: 'admin', published: true },
  };
}

// ── 主程序
ensureDir(PAGES_DIR);

let totalGenerated = 0;
let totalSkipped   = 0;

for (const prod of PRODUCTS_TO_GENERATE) {
  console.log(`\n📦 处理产品：${prod.name}`);

  for (let i = 0; i < 4; i++) {
    const page = makeReviewPage(prod, i);
    const path = join(PAGES_DIR, `${page.slug}.json`);
    existsSync(path) ? totalSkipped++ : totalGenerated++;
    writeIfNotExists(path, page);
  }

  for (let i = 0; i < 4; i++) {
    const page = makeDealPage(prod, i);
    const path = join(PAGES_DIR, `${page.slug}.json`);
    existsSync(path) ? totalSkipped++ : totalGenerated++;
    writeIfNotExists(path, page);
  }

  for (let i = 0; i < 4; i++) {
    const page = makeBestOfPage(prod, i);
    const path = join(PAGES_DIR, `${page.slug}.json`);
    existsSync(path) ? totalSkipped++ : totalGenerated++;
    writeIfNotExists(path, page);
  }

  for (let i = 0; i < 4; i++) {
    const page = makeHowToPage(prod, i);
    const path = join(PAGES_DIR, `${page.slug}.json`);
    existsSync(path) ? totalSkipped++ : totalGenerated++;
    writeIfNotExists(path, page);
  }

  for (let i = 0; i < 4; i++) {
    const page = makeBrandPage(prod, i);
    const path = join(PAGES_DIR, `${page.slug}.json`);
    existsSync(path) ? totalSkipped++ : totalGenerated++;
    writeIfNotExists(path, page);
  }
}

console.log(`\n🎉 完成！新生成 ${totalGenerated} 个页面，跳过 ${totalSkipped} 个已存在页面。`);
console.log(`📁 页面文件位置：${PAGES_DIR}\n`);
