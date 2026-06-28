// 还原被 prepare-posts.cjs 转义的 Nunjucks 冲突字符
hexo.extend.filter.register('after_render:html', function (str) {
  return str
    .replace(/‹‹/g, '{{')
    .replace(/››/g, '}}')
    .replace(/‹%/g, '{%')
    .replace(/%›/g, '%}');
});
