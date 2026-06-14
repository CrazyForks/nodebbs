import { headers } from 'next/headers';
import { getApiBaseUrl } from '../api-url';
import { getSiteInfo } from './layout';

const SHARD_CHUNK = 10000;

// ---- 公开站点 base URL ----
// 优先 site_url 设置；未配置时回退到请求头 host + x-forwarded-proto。
// sitemap 必须使用绝对 URL，因此回退很关键。
export async function getPublicBaseUrl() {
  const { siteUrl } = await getSiteInfo();
  if (siteUrl) return siteUrl;
  try {
    const h = await headers();
    const host = h.get('host');
    if (!host) return '';
    const proto = h.get('x-forwarded-proto') || 'https';
    return `${proto}://${host}`;
  } catch {
    return '';
  }
}

// ---- 匿名（不带 cookie）调用 API，强制 guest 视角 ----
async function sitemapApi(endpoint) {
  try {
    const res = await fetch(`${getApiBaseUrl()}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function getShardChunk() {
  return SHARD_CHUNK;
}

export async function fetchSitemapStats() {
  return (await sitemapApi('/sitemap/stats')) || { topicCount: 0, maxTopicId: null };
}

export async function fetchSitemapTaxonomy() {
  return (await sitemapApi('/sitemap/taxonomy')) || { categories: [], tags: [], pages: [] };
}

export async function fetchSitemapTopics(minId, maxId) {
  const data = await sitemapApi(`/sitemap/topics?minId=${minId}&maxId=${maxId}`);
  return data?.items || [];
}

// ---- XML 序列化 ----
function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toIso(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function buildUrlset(entries) {
  const body = entries
    .map((e) => {
      const lines = [`    <loc>${escapeXml(e.loc)}</loc>`];
      const iso = toIso(e.lastmod);
      if (iso) lines.push(`    <lastmod>${iso}</lastmod>`);
      if (e.changefreq) lines.push(`    <changefreq>${e.changefreq}</changefreq>`);
      if (e.priority != null) lines.push(`    <priority>${e.priority}</priority>`);
      return `  <url>\n${lines.join('\n')}\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

export function buildSitemapIndex(locs) {
  const body = locs
    .map((loc) => `  <sitemap>\n    <loc>${escapeXml(loc)}</loc>\n  </sitemap>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>`;
}

export function xmlResponse(xml) {
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
