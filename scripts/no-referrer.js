hexo.extend.filter.register('after_render:html', function (str) {
  return str.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n  <meta name="referrer" content="no-referrer">');
});
