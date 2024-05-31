/** init domain config */
import Vue from 'vue'
// 产品名称
window._CONFIG['productName'] = window._CONFIG.VUE_APP_PRODUCT_NAME
// 产品标题
window._CONFIG['productTitle'] = window._CONFIG.VUE_APP_PRODUCT_TITLE
// 支持国际化
window._CONFIG['supportInternationalization '] = window._CONFIG.VUE_APP_SUPPROT_INTERNATIONALIZATION
// 管理类接口前缀
window._CONFIG['apiPathManagerPrefix'] = `/${window._CONFIG.VUE_APP_PRODUCT_NAME}/rest/manager`
// 服务类接口前缀
window._CONFIG['apiPathServicesPrefix'] = `/${window._CONFIG.VUE_APP_PRODUCT_NAME}/rest/services`
// 设置全局API_BASE_URL
Vue.prototype.API_BASE_URL = window._CONFIG.VUE_APP_API_BASE_URL
  ? window._CONFIG.VUE_APP_API_BASE_URL
  : process.env.VUE_APP_API_BASE_URL
window._CONFIG['domainURL'] = Vue.prototype.API_BASE_URL
// 设置全局路由BASE
window._CONFIG['routerBase'] = `/${window._CONFIG['productName']}/web/`
// 设置公共路径
if (process.env.NODE_ENV === 'production') {
  window.externalPublicPath = `/${window._CONFIG['productName']}/static/web-ui/`
  // eslint-disable-next-line camelcase, no-undef
  __webpack_public_path__ = window.externalPublicPath
}
