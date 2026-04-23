# Affiliate Astro — 联盟推广落地页系统

基于 Astro 构建的批量联盟推广落地页系统，支持 5 种页面类型 × 5 种视觉模板 = 25 个模板，每个联盟链接可自动生成 20 个 SEO 优化落地页。

---

## 项目结构

```
affiliate-astro/
├── src/
│   ├── components/          # 可复用 UI 组件
│   │   ├── SEOHead.astro    # 五层 SEO 标签（第4层Meta + 第5层Schema）
│   │   ├── UTMLink.astro    # 联盟链接 + UTM 参数自动注入
│   │   ├── CTAButton.astro  # 统一 CTA 按钮
│   │   ├── StarRating.astro # 星级评分
│   │   ├── FAQAccordion.astro  # FAQ 手风琴（触发 Google FAQ 富媒体摘要）
│   │   ├── UserReviews.astro   # 用户评价展示
│   │   ├── TrustBadges.astro   # 信任徽章
│   │   ├── CountdownTimer.astro # 倒计时组件
│   │   ├── RelatedPages.astro   # 相关推荐
│   │   └── Breadcrumb.astro     # 面包屑导航（触发 BreadcrumbList Schema）
│   │
│   ├── layouts/             # 25 个落地页模板
│   │   ├── BaseLayout.astro         # 基础 HTML 骨架
│   │   ├── review/                  # 评测/对比页 × 5 种风格
│   │   │   ├── ReviewTech.astro     # T1：科技/工具风（VPN、SaaS）
│   │   │   ├── ReviewHome.astro     # T2：家居/生活风
│   │   │   ├── ReviewFood.astro     # T3：食品/健康风
│   │   │   ├── ReviewPet.astro      # T4：宠物/母婴风
│   │   │   └── ReviewElectronic.astro # T5：电子/数码风
│   │   ├── deal/            # 优惠/促销页 × 5 种风格
│   │   ├── best-of/         # 专题榜单页 × 5 种风格
│   │   ├── how-to/          # 问题解决/教程页 × 5 种风格
│   │   └── brand/           # 品牌专属页 × 5 种风格
│   │
│   ├── pages/               # Astro 动态路由
│   │   ├── index.astro              # 首页
│   │   ├── review/[slug].astro      # 评测页路由
│   │   ├── deals/[slug].astro       # 促销页路由
│   │   ├── best/[slug].astro        # 榜单页路由
│   │   ├── how-to/[slug].astro      # 教程页路由
│   │   ├── brand/[slug].astro       # 品牌页路由
│   │   ├── sitemap.xml.ts           # 自动生成 Sitemap
│   │   └── robots.txt.ts            # 自动生成 robots.txt
│   │
│   ├── content/             # 数据层（JSON 驱动）
│   │   ├── config.ts                # Zod Schema 校验定义
│   │   ├── products/                # 产品基础数据（每产品一个 JSON）
│   │   │   └── nordvpn.json
│   │   ├── pages/                   # 落地页配置（每页一个 JSON）
│   │   │   ├── nordvpn-review.json
│   │   │   ├── nordvpn-coupon.json
│   │   │   ├── best-vpn-2025.json
│   │   │   ├── nordvpn-how-to-setup.json
│   │   │   └── nordvpn-brand.json
│   │   └── reviews/                 # 用户评论数据
│   │       └── nordvpn-reviews.json
│   │
│   └── config/              # 全局配置
│       ├── seo.config.json          # 站点级 SEO 配置
│       └── categories/              # 品类关键词库
│           └── vpn.json
│
└── scripts/
    ├── validate-seo.ts      # 构建前 SEO 自动校验（8项规则）
    └── generate-pages.ts    # 批量生成 20 个落地页 JSON
```

---

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 修改站点域名

编辑 `src/config/seo.config.json`，将 `domain` 改为你的实际域名：

```json
{
  "site": {
    "name": "你的站点名",
    "domain": "https://www.yoursite.com"
  }
}
```

### 3. 添加你的第一个联盟产品

复制 `src/content/products/nordvpn.json`，修改以下核心字段：

```json
{
  "id": "your-product-id",
  "name": "产品名称",
  "affiliate": {
    "link": "https://你的联盟链接",
    "id": "你的推广ID"
  }
}
```

### 4. 批量生成 20 个落地页

编辑 `scripts/generate-pages.ts` 中的 `PRODUCTS_TO_GENERATE` 数组，添加你的产品，然后运行：

```bash
npm run generate-pages
```

这会自动生成 20 个页面配置文件（4种评测 + 4种促销 + 4种榜单 + 4种教程 + 4种品牌）。

### 5. SEO 校验

```bash
npm run validate-seo
```

会检查所有页面的 title 长度、description 长度、主关键词唯一性、H1 存在性等 8 项规则。

### 6. 构建

```bash
npm run build
```

构建前自动运行 SEO 校验，有错误会阻止构建。

### 7. 本地预览

```bash
npm run dev
```

---

## 五种页面类型说明

| 页面类型 | URL 前缀 | 适用场景 | Schema 类型 |
|---------|---------|---------|------------|
| review  | /review/ | 产品深度评测、竞品对比 | Review |
| deal    | /deals/  | 优惠码、折扣、促销 | Product + Offer |
| best-of | /best/   | 排行榜、推荐榜单 | ItemList |
| how-to  | /how-to/ | 教程、操作指南 | HowTo |
| brand   | /brand/  | 品牌介绍、产品详情 | Product |

---

## 五种视觉风格说明

| 风格值 | 适用品类 | 视觉调性 |
|-------|---------|---------|
| `tech` | VPN、SaaS、安全工具 | 深色Hero、数据仪表盘感 |
| `home` | 家居、厨房、扫地机器人 | 温暖米色、大图沉浸 |
| `food` | 保健品、有机食品、功能饮料 | 清新绿白、成分分析 |
| `pet`  | 宠物用品、母婴用品 | 圆润大圆角、马卡龙色 |
| `electronic` | 耳机、手机配件、智能设备 | 深灰精密、参数驱动 |

在 `pages/xxx.json` 中设置：
```json
{
  "template_style": "tech"
}
```

---

## SEO 五层架构

| 层级 | 标签 | 规范 | 作用 |
|-----|-----|-----|-----|
| 第一层 | `<h1>` | 每页唯一，主关键词在前15字，20-60字 | 告诉 Google 页面主题 |
| 第二层 | `<h2>` | 3-8个，含次级关键词，顺序匹配用户决策流程 | 告诉 Google 页面结构 |
| 第三层 | `<h3>` | FAQ 用问句形式，长尾词自然融入 | 告诉 Google 细节内容 |
| 第四层 | `<title>` + `<meta description>` | title≤60字，description≤160字，含CTA | 搜索结果片段展示 |
| 第五层 | JSON-LD Schema | 根据页面类型自动选择正确 Schema | 实体关系声明，富媒体摘要 |

---

## 添加新品类

1. 在 `src/config/categories/` 下新建 `your-category.json`，参考 `vpn.json` 填写品类关键词库
2. 在 `src/content/products/` 下新建产品 JSON 文件
3. 运行 `npm run generate-pages` 批量生成页面
4. 运行 `npm run validate-seo` 校验
5. 运行 `npm run build` 构建

---

## 关键词维护原则

- **每个页面的 `seo.keywords.primary` 必须全局唯一** — 不同页面不能争抢同一个主关键词，否则自我竞争，全部排名下降
- 20个页面各攻20个不同关键词，通过内链互相支撑
- `seo.meta.update_date` 定期更新（哪怕只改一行内容），让 Google 持续抓取

---

## 联盟链接规范

所有对外链接必须通过 `UTMLink.astro` 组件，不能直接写 `<a href>`：

```astro
<UTMLink
  href={product.affiliate.link}
  affiliateId={product.affiliate.id}
  position="hero"
  campaign="nordvpn-review"
>
  立即购买
</UTMLink>
```

UTM 参数自动注入：`?utm_source=bestpicks&utm_medium=affiliate&utm_campaign=nordvpn-review&utm_content=hero&ref=aff_id`
