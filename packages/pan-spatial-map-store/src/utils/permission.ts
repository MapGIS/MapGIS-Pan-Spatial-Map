import VueRouter, { Route } from 'vue-router'
import { Store } from 'vuex'

export const configRouterPermission = ({
  store,
  router,
  loginIgnore
}: {
  store: Store<unknown>
  router: VueRouter
  loginIgnore: { whiteList: string[]; loginPath: string }
}) => {
  // 路由守卫，在进入每个路由之前执行
  router.beforeEach((to: Route, _: Route, next: any) => {
    if (store.getters['user/isAuthenticated']) {
      if (to.path === loginIgnore.loginPath) {
        // If is logged in, redirect to the home page
        next({ path: '/' })
      } else {
        next()
      }
    } else if (loginIgnore.whiteList.includes(to.path)) {
      // Has no token
      // In the whitelist, go directly
      next()
    } else {
      // Other pages that do not have permission to access are redirected to the login page.
      next({ path: loginIgnore.loginPath })
    }
  })
}
