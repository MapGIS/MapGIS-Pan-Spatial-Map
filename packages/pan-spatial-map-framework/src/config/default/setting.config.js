// 此配置为系统默认设置，需修改的设置项，在src/config/config.js中添加修改项即可。也可直接在此文件中修改。
module.exports = {
  lang: 'CN', // 语言，可选 CN(简体)、HK(繁体)、US(英语)，也可扩展其它语言
  theme: {
    // 主题
    color: '#1890ff', // 主题色
    mode: 'dark', // 主题模式 可选 dark、 light 和 night
    success: '#52c41a', // 成功色
    warning: '#faad14', // 警告色
    error: '#f5222f' // 错误色
  },
  weekMode: false, // 色弱模式，true:开启，false:不开启
  systemName: '全空间一张图', // 系统名称
  copyright: '2021 武汉中地数码科技有限公司 Version 10.5.5.12', // copyright
  asyncRoutes: false, // 异步加载路由，true:开启，false:不开启
  showPageTitle: true, // 是否显示页面标题（PageLayout 布局中的页面标题），true:显示，false:不显示
  filterMenu: true, // 根据权限过滤菜单，true:过滤，false:不过滤
  footerLinks: [
    // 页面底部链接，{link: '链接地址', name: '名称/显示文字', icon: '图标，支持 ant design vue 图标库'}
  ]
}
