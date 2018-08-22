module.exports = {
  title: '王昊的个人博客',
  description: '前端',
  themeConfig: {
    // 导航栏
    nav: [
      { text: '主页', link: '/' },
      { text: '技术', link: '/dev/' },
      { text: '随笔', link: '/essay/' },
      { text: '关于', link: '/about/' },
      { 
        text: '链接', 
        items: [
          {text: 'Google', link: 'https://google.com' },
        ]
      }
    ],
    // 自动生成侧边栏
    sidebar: 'auto',
    sidebarDepth: 3,
    // 侧边栏
    // sidebar: [
    //   {
    //     title: 'Group 1',
    //     collapsable: false,
    //     children: [
    //       '/'
    //     ]
    //   },
    //   {
    //     title: 'Group 2',
    //     children: [ /* ... */ ]
    //   }
    // ],
    // 侧边栏显示全部标题
    displayAllHeaders: false,
    // 侧边栏动态更新活动标题链接
    activeHeaderLinks: true,
    // 最后更新时间
    lastUpdated: 'Last Updated',
  }
}