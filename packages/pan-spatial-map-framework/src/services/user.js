import { LOGIN, ROUTES, LOGOUT, INFO, APPINFO } from '@/services/api'
import { request, METHOD, removeAuthorization } from '@/utils/request'

/**
 * 登录服务
 * @param name 账户名
 * @param password 账户密码
 * @returns {Promise<AxiosResponse<T>>}
 */
export function login(name, password) {
  return request(LOGIN, METHOD.POST, {
    username: name,
    password: password
  })
}

export function getRoutesConfig() {
  return request(ROUTES, METHOD.GET)
}

/**
 * 退出登录
 */
export function logout() {
  request(LOGOUT, METHOD.DELETE).then(() => {
    localStorage.removeItem(process.env.VUE_APP_ROUTES_KEY)
    localStorage.removeItem(process.env.VUE_APP_PERMISSIONS_KEY)
    localStorage.removeItem(process.env.VUE_APP_ROLES_KEY)
    removeAuthorization()
  })
}

export function getInfo() {
  return request(INFO, METHOD.GET)
}

export function getAppInfo() {
  return request(APPINFO, METHOD.GET)
}

export default {
  login,
  logout,
  getRoutesConfig,
  getInfo,
  getAppInfo
}
