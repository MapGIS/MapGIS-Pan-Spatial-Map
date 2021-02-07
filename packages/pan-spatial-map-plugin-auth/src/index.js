import {
  userModule,
  configRouterPermission
} from '@mapgis/pan-spatial-map-store'

const install = (Vue, { store, router, loginIgnore }) => {
  // user模块注册
  if (store) {
    store.registerModule('user', userModule)
  }

  // 添加登录路由
  if (router) {
    router.addRoutes([
      {
        path: loginIgnore.loginPath,
        component: () => import('./pages/Login.vue')
      }
    ])
  }

  // 配置路由权限
  if (store && router) {
    configRouterPermission({ store, router, loginIgnore })
  }
}

export { default as LoginPage } from './pages/Login.vue'

export default {
  install
}
