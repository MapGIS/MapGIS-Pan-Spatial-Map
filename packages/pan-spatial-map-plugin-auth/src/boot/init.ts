import VueRouter from 'vue-router'
import { Store } from 'vuex'
import user from '../store/modules/user'
import { IAuthConfig } from '../api/types'
import { getAuthConfig } from '../api/auth-config'
import { configService } from '../utils/request'
import { configRouter } from '../utils/permission'

export default async ({
  store,
  router
}: {
  store: Store<unknown>
  router: VueRouter
}) => {
  // user模块注册
  store.registerModule('user', user)

  // 获取权限认证配置信息
  const { data } = await getAuthConfig()
  const config: IAuthConfig = data

  // 配置服务器
  configService(store, config.proxyTable)

  // 配置路由
  configRouter({ store, router }, config)
}
