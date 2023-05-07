// eslint-disable-next-line
import { constantRouterMap } from '@/config/router.config'

// 前端未找到页面路由（固定不用改）
const notFoundRouter = {
  path: '*',
  redirect: '/404',
  hidden: true
}

export const generatorStaticRouter = () => {
  return new Promise((resolve, reject) => {
    resolve(generatorRouter(constantRouterMap.concat([])))
  })
}

function generatorRouter(routerData) {
  routerData.push(notFoundRouter)
  return routerData
}
