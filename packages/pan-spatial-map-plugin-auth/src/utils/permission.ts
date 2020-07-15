import VueRouter, { Route } from 'vue-router'
import { Store } from 'vuex'
import { IAuthConfig } from '../api/types'

export const configRouter = (
  {
    store,
    router
  }: {
    store: Store<unknown>
    router: VueRouter
  },
  config: IAuthConfig
) => {
  // 添加登录路由
  router.addRoutes([
    {
      path: config.loginPath,
      component: () => import('../pages/Login.vue')
    }
  ])

  // 路由守卫，在进入每个路由之前执行
  router.beforeEach((to: Route, _: Route, next: any) => {
    if (store.getters['user/isAuthenticated']) {
      if (to.path === config.loginPath) {
        // If is logged in, redirect to the home page
        next({ path: '/' })
      } else {
        next()
      }
    } else if (config.whiteList.includes(to.path)) {
      // Has no token
      // In the whitelist, go directly
      next()
    } else {
      // Other pages that do not have permission to access are redirected to the login page.
      next({ path: config.loginPath })
    }
  })
}
