import { loadInterceptors } from '@/utils/request'
import interceptors from '@/utils/axios-interceptors'

/**
 * 启动引导方法
 * 应用启动时需要执行的操作放在这里
 * @param router 应用的路由实例
 * @param store 应用的 vuex.store 实例
 * @param i18n 应用的 message 实例
 */
function bootstrap({ router, store, message }) {
  // 加载 axios 拦截器
  loadInterceptors(interceptors, { router, store, message })
}

export default bootstrap
