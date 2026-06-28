#!/usr/bin/env node
/**
 * 把 docs/*.md 注入 frontmatter 后生成到 source/_posts/，供 Hexo 构建。
 * 数据来源：elog.cache.json（title / date / updated / categories）。
 * master 上的 docs/ 保持原样（无 frontmatter），本脚本仅在构建期产出带 frontmatter 的副本。
 */
const fs = require('fs');
const path = require('path');

const cwd = process.cwd();
const cacheFile = path.join(cwd, 'elog.cache.json');
const docsDir = path.join(cwd, 'docs');
const postsDir = path.join(cwd, 'source', '_posts');

if (!fs.existsSync(cacheFile)) {
  console.warn('[prepare-posts] 未找到 elog.cache.json，跳过');
  process.exit(0);
}

const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
const docs = Array.isArray(cache.docs) ? cache.docs : [];

fs.rmSync(postsDir, { recursive: true, force: true });
fs.mkdirSync(postsDir, { recursive: true });

const q = (s) => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';

let count = 0;
for (const d of docs) {
  const p = d.properties || {};
  const title = p.title || d.realName;
  if (!title) continue;
  const rel = String(d.relativePath || `/${d.realName || title}.md`).replace(/^\/+/, '');
  const src = path.join(docsDir, rel);
  if (!fs.existsSync(src)) {
    console.warn('[prepare-posts] 缺正文: docs/' + rel);
    continue;
  }
  let body = fs.readFileSync(src, 'utf8');
  let fm = '';
  if (!body.startsWith('---')) {
    const date = p.date || p.updated || '';
    const updated = p.updated || p.date || '';
    const cats =
      Array.isArray(d.catalog) && d.catalog.length
        ? d.catalog.map((c) => q(c.title)).join(', ')
        : '';
    fm = [
      '---',
      `title: ${q(title)}`,
      date ? `date: ${q(date)}` : null,
      updated ? `updated: ${q(updated)}` : null,
      cats ? `categories: [${cats}]` : null,
      '---',
      '',
    ]
      .filter(Boolean)
      .join('\n') + '\n';
  }
  // 用 raw 包裹正文：避免正文里的 {{ }} / {% %} 被 Hexo(Nunjucks) 当模板解析而报错
  const out = fm + '{% raw %}\n' + body + '\n{% endraw %}\n';
  const outName = (d.realName || title) + '.md';
  fs.writeFileSync(path.join(postsDir, outName), out, 'utf8');
  count++;
}
console.log(`[prepare-posts] 生成 ${count} 篇到 source/_posts/`);
