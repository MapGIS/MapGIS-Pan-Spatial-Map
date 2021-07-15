// 路由配置
const options = {
  routes: [
    {
      path: '/',
      name: '首页',
      redirect: '/map'
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
    }
  ]
}

export default options
