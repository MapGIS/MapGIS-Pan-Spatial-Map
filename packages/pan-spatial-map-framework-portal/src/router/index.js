import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/**
 * 初始化路由实例
 * @returns {VueRouter}
 */
function initRouter() {
  const options = require('./config').default
  return new Router(options)
}
export { initRouter }
