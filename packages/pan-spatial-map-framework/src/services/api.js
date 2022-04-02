// 跨域代理前缀
// const API_PROXY_PREFIX='/api'
// const BASE_URL = process.env.NODE_ENV === 'production' ? process.env.VUE_APP_API_BASE_URL : API_PROXY_PREFIX
const BASE_URL = process.env.VUE_APP_API_BASE_URL
module.exports = {
  BASE_URL: BASE_URL,
  LOGIN: '/auth/login',
  ROUTES: '/routes',
  LOGOUT: '/auth/logout',
  INFO: '/auth/info',
  APPINFO: '/auth/app-info',
  APP_WIDGETS: '/api/app/widgets',
  APP_THEMES: '/api/app/themes',
  APP_CONFIG: '/api/app/config'
}
