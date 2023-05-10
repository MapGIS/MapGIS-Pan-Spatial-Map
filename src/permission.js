import router from './router'
import store from './store'
import storage from 'store'
import NProgress from 'nprogress' // progress bar
import '@/components/NProgress/nprogress.less' // progress bar custom style
import notification from 'ant-design-vue/es/notification'
import { setDocumentTitle } from '@/utils/domUtil'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { i18nRender } from '@/locales'
import qs from 'qs'
import { getSystemConfig } from '@/api/system/config'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const allowList = ['login', 'register'] // no redirect allowList
const loginRoutePath = '/user/login'
const defaultRoutePath = '/map'

router.beforeEach((to, from, next) => {
  NProgress.start() // start progress bar
  if (to.meta && typeof to.meta.title !== 'undefined') {
    setDocumentTitle(`${i18nRender(to.meta.title)} - ${store.getters.domTitle}`)
  }
  /* has token */
  if (storage.get(ACCESS_TOKEN)) {
    if (to.path === loginRoutePath || to.path === '/') {
      next({ path: defaultRoutePath })
      NProgress.done()
    } else {
      // check login user.roles is null
      if (store.getters.roles.length === 0) {
        // request login userInfo
        store
          .dispatch('getInfo')
          .then(async res => {
            // get cas info
            await store.dispatch('getCasInfo')
            // const roles = res.result && res.result.role
            const roles = res.roles
            // generate static router
            store.dispatch('generateStaticRoutes', { roles }).then(() => {
              // 根据roles权限生成可访问的路由表
              // 动态添加可访问路由表
              // VueRouter@3.5.0+ New API
              store.getters.addRouters.forEach(r => {
                router.addRoute(r)
              })
              // 请求带有 redirect 重定向时，登录自动重定向到该地址
              next({ ...to, replace: true }) // hack方法 确保addRoutes已完成
              // const redirect = decodeURIComponent(from.query.redirect || to.path)
              // if (to.path === redirect) {
              //   // set the replace: true so the navigation will not leave a history record
              //   next({ ...to, replace: true })
              // } else {
              //   // 跳转到目的路由
              //   next({ path: redirect })
              // }
            })
          })
          .catch(() => {
            notification.error({
              message: '错误',
              description: '请求用户信息失败，请重试'
            })
            // 失败时，获取用户信息失败时，调用登出，来清空历史保留信息
            store.dispatch('logout').then(() => {
              location.href = `${window._CONFIG['routerBase']}`
            })
          })
      } else {
        next()
      }
    }
  } else {
    if (allowList.includes(to.name)) {
      // 在免登录名单，直接进入
      next()
    } else {
      getSystemConfig().then(res => {
        const casInfo = res.data.casConfig

        if (casInfo.enabled) {
          const queryParams = qs.parse(document.location.toString().split('?')[1])
          const token = queryParams.token

          // 判断来源是不是cas的地址
          if (
            token &&
            (casInfo.casLoginUrl.includes(document.referrer) || document.referrer.includes(document.location.host))
          ) {
            validateToken(casInfo, token, to, from, next)
          } else {
            nextToLogin(casInfo, to, from, next)
          }
        } else {
          next({ path: loginRoutePath, query: { redirect: to.fullPath } })
        }

        NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
      })
    }
  }
})

router.afterEach(() => {
  document.body.scrollTop = 0
  document.documentElement.scrollTop = 0
  NProgress.done() // finish progress bar
})

function validateToken(casInfo, token, to, from, next) {
  store
    .dispatch('validateLogin', token)
    .then(res => {
      const url = document.location.toString().split('?')[0]
      window.location.href = url
    })
    .catch(() => {
      nextToLogin(casInfo, to, from, next)
    })
}

function nextToLogin(casInfo, to, from, next) {
  if (casInfo.isReserveDefaultLogin) {
    next({ path: loginRoutePath, query: { redirect: to.fullPath } })
  } else {
    window.location.href = casInfo.casLoginUrl
  }
}
