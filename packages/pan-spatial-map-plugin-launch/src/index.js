import WebAppFrameworkUI from '@mapgis/web-app-framework'

const install = (Vue, { store, router, loginIgnore }) => {
  // UI组件注册
  Vue.use(WebAppFrameworkUI)

  // 添加登录路由
  if (router) {
    router.addRoutes([
      {
        path: '/map',
        component: () => import('./pages/Map.vue')
      }
    ])
  }
}

export { default as MapPage } from './pages/Map.vue'

export default {
  install
}
