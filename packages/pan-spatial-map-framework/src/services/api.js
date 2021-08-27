// 跨域代理前缀
// const API_PROXY_PREFIX='/api'
// const BASE_URL = process.env.NODE_ENV === 'production' ? process.env.VUE_APP_API_BASE_URL : API_PROXY_PREFIX
const BASE_URL = process.env.VUE_APP_API_BASE_URL
module.exports = {
  BASE_URL: BASE_URL,
  LOGIN: `${BASE_URL}/auth/login`,
  ROUTES: `${BASE_URL}/routes`,
  LOGOUT: `${BASE_URL}/auth/logout`,
  INFO: `${BASE_URL}/auth/info`,
  APPINFO: `${BASE_URL}/auth/app-info`,
  APP_WIDGETS: `${BASE_URL}/api/app/widgets`,
  APP_THEMES: `${BASE_URL}/api/app/themes`,
  APP_CONFIG: `${BASE_URL}/api/app/config`
}
