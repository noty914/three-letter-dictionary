import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import path from 'node:path';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { applyEnvPages } from './scripts/apply-env-pages.mjs';

// ローカルでは `.env.pages` を1回用意すると毎回の環境変数設定が不要（scripts/apply-env-pages.mjs）
applyEnvPages();

// GitHub Pages（プロジェクトサイト）向けに site / base を自動設定
// 公開 URL: https://<owner>.github.io/<repo>/
//
// GITHUB_ACTIONS には依存しない。OWNER が空でも GITHUB_REPOSITORY（owner/repo）から復元する。
//
// PUBLIC_SITE_URL が設定されていれば「その値」を site に使う（独自ドメインやローカルで本番 URL を試すとき用）。
const repoFull = process.env.GITHUB_REPOSITORY ?? '';
const repoParts = repoFull.split('/').filter(Boolean);
const repoFromSlug =
  repoParts.length >= 2 ? repoParts[repoParts.length - 1] : undefined;
const ownerFromSlug =
  process.env.GITHUB_REPOSITORY_OWNER?.trim() ||
  (repoParts.length >= 2 ? repoParts[0] : undefined);
const isGithubRepoBuild = Boolean(ownerFromSlug && repoFromSlug);

const envSite = process.env.PUBLIC_SITE_URL?.trim();
const site =
  envSite ||
  (isGithubRepoBuild
    ? `https://${ownerFromSlug}.github.io`
    : 'https://example.com');
const base = isGithubRepoBuild ? `/${repoFromSlug}/` : '/';

/** @astrojs/sitemap と同じ前提で sitemap-index.xml の絶対 URL を組み立てる */
function sitemapIndexHref(siteOrigin, basePath) {
  const origin = siteOrigin.replace(/\/$/, '');
  const seg = basePath.replace(/^\/+|\/+$/g, '');
  const pathname = seg ? `/${seg}/sitemap-index.xml` : '/sitemap-index.xml';
  return new URL(pathname, `${origin}/`).href;
}

function robotsTxtIntegration(siteOrigin, basePath) {
  return {
    name: 'robots-txt',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const outDir = fileURLToPath(dir);
        const body = [
          'User-agent: *',
          'Allow: /',
          '',
          `Sitemap: ${sitemapIndexHref(siteOrigin, basePath)}`,
          '',
        ].join('\n');
        await fs.writeFile(path.join(outDir, 'robots.txt'), body, 'utf8');
      },
    },
  };
}

export default defineConfig({
  site,
  base,
  integrations: [sitemap(), robotsTxtIntegration(site, base)],
  compressHTML: true,
  trailingSlash: 'always',
});
