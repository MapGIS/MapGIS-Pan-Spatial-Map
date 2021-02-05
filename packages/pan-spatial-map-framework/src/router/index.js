import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/**
 * 初始化路由实例
 * @param isAsync 是否异步路由模式
 * @returns {VueRouter}
 */
function initRouter() {
  const options = require('./config').default
  return new Router(options)
}
export { initRouter }
