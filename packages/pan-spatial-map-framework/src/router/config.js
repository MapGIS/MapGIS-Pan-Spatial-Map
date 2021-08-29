// 路由配置
const options = {
  routes: [
    {
      path: '/',
      name: '首页',
      redirect: '/map'
    },
    {
      path: '/login',
      name: '登录页',
      component: () => import('@/pages/login')
    },
    {
      path: '*',
      name: '404',
      component: () => import('@/pages/exception/404')
    },
    {
      path: '/403',
      name: '403',
      component: () => import('@/pages/exception/403')
    },
    {
      path: '/map',
      name: '地图',
      component: () => import('@/pages/map')
    },
    {
      path: '/builder',
      name: '应用构建器',
      component: () => import('@/pages/builder')
    }
  ]
}

export default options
