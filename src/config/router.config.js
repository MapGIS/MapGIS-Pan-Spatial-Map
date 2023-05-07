// eslint-disable-next-line
import { UserLayout } from '@/layouts'

/**
 * 静态路由，不管登录与否都会注册
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '',
    name: '',
    redirect: '/map'
  },
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        meta: { title: '登录' },
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      }
    ]
  },
  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  },
  {
    path: '/403',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/403')
  },
  {
    path: '/map',
    name: 'Map',
    component: () => import(/* webpackChunkName: "map" */ '@/views/app/map/index')
  }
]
