#!/usr/bin/env node
/**
 * 由 elog.cache.json 生成 README.md 博客目录（按更新时间倒序）。
 * 在每次 `elog sync` 之后由 GitHub Actions 调用。
 * README.md 为自动生成，请勿手动编辑 —— 改部署说明请编辑 DEPLOY.md。
 */
const fs = require('fs');
const path = require('path');

const cwd = process.cwd();
const cacheFile = path.join(cwd, 'elog.cache.json');
const outFile = path.join(cwd, 'README.md');

if (!fs.existsSync(cacheFile)) {
  console.warn('[build-readme] 未找到 elog.cache.json，跳过生成');
  process.exit(0);
}

const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
const docs = Array.isArray(cache.docs) ? cache.docs : [];

const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');

const rows = docs
  .filter((d) => d && d.properties && d.properties.title)
  .map((d) => {
    const title = String(d.properties.title);
    const updated = String(d.properties.updated || d.properties.date || '');
    const rel = d.relativePath || `/${d.realName || title}.md`;
    const href = encodeURI(`docs${rel}`);
    return { title, updated, href, ts: Date.parse(updated) || 0 };
  })
  .sort((a, b) => b.ts - a.ts);

const genTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

const lines = [];
lines.push('# ahao430 的博客');
lines.push('');
lines.push(
  '> 本目录由 `scripts/build-readme.cjs` 在每次语雀同步后**自动生成**，请勿手动编辑。部署 / 同步说明见 [`DEPLOY.md`](./DEPLOY.md)。'
);
lines.push('');
lines.push(`共 **${rows.length}** 篇文章 · 目录生成时间：${genTime} UTC`);
lines.push('');
lines.push('| 更新时间 | 标题 |');
lines.push('| --- | --- |');
for (const r of rows) {
  lines.push(`| ${r.updated.slice(0, 10)} | [${esc(r.title)}](${r.href}) |`);
}
lines.push('');

fs.writeFileSync(outFile, lines.join('\n'), 'utf8');
console.log(`[build-readme] 生成 README.md，共 ${rows.length} 篇`);
