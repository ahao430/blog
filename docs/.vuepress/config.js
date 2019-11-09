module.exports = {
  title: '王昊的个人博客',
  description: '前端',
  themeConfig: {
    // 导航栏
    nav: [
      { text: '技术', link: '/dev/'},
      { text: '随笔', link: '/essay/' },
      { text: '关于', link: '/about/' },
      { 
        text: '资源', 
        items: [
          {text: 'Google', link: 'https://google.com' },
          {text: 'Github', link: 'https://github.com/' },
          {text: '阿里巴巴图标库', link: 'http://www.iconfont.cn/' },
          {text: 'Apizza', link: 'https://apizza.net/' },
          {text: 'Codewars', link: 'https://www.codewars.com/' },
          {text: 'LeetCode', link: 'https://leetcode-cn.com/' },
          {text: '阮一峰', link: 'http://www.ruanyifeng.com/home.html' },
          {text: '张鑫旭', link: 'https://www.zhangxinxu.com/wordpress/' },
          {text: '廖雪峰', link: 'https://www.liaoxuefeng.com/' },
        ]
      }
    ],
    // 自动生成侧边栏
    // sidebar: 'auto',
    sidebarDepth: 3,
    // 侧边栏
    sidebar: {
      '/dev/': [
        '小程序开发填坑总结',
        '公众号h5自定义分享',
        '小程序使用async和await',
        'chrome插件开发',
        'rollup使用',
        'jsPdf生成pdf',
        // 'jsdoc生成文档',
        'vue的provide和inject方法',
        'vue刷新页面',
        'nvm版本管理',
        'npm源管理',
      ],
      '/essay/': [

      ]
    },
    // 侧边栏显示全部标题
    displayAllHeaders: false,
    // 侧边栏动态更新活动标题链接
    activeHeaderLinks: true,
    // 最后更新时间
    lastUpdated: 'Last Updated',
  }
}