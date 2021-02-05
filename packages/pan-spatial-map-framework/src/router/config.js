// 路由配置
const options = {
  routes: [
    {
      path: '/',
      name: 'map',
      redirect: '/map'
    },
    {
      path: '*',
      name: '404',
      component: () => import('@/pages/exception/404')
    }
  ]
}

export default options
