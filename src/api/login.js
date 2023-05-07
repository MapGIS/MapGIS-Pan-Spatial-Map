import request from '@/utils/request'

const userApi = {
  Login: `${window._CONFIG['apiPathManagerPrefix']}/auth/login`,
  Logout: `${window._CONFIG['apiPathManagerPrefix']}/auth/logout`,
  // get my info
  UserInfo: `${window._CONFIG['apiPathManagerPrefix']}/system/user/getInfo`
}

/**
 * login func
 * @param parameter
 * @returns {*}
 */
export function login(parameter) {
  return request({
    url: userApi.Login,
    method: 'post',
    data: parameter
  })
}

export function getInfo() {
  return request({
    url: userApi.UserInfo,
    method: 'get',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

export function logout() {
  return request({
    url: userApi.Logout,
    method: 'delete',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

// 获取是否需要显示验证码
export function getIsNeedCode(username) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/auth/isNeedCaptcha/${username}`,
    method: 'get'
  })
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/auth/captchaImage`,
    method: 'get'
  })
}

// 第三方登录
export function thirdLogin(token, source) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/auth/thirdLogin/getLoginUser/${token}/${source}`,
    method: 'get',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

// 创建账号并与第三方授权用户绑定
export function thirdLoginUserCreate(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/auth/thirdLogin/user/create`,
    method: 'post',
    data: data
  })
}

// 创建账号并与第三方授权用户绑定
export function thirdLoginCheckPassword(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/auth/thirdLogin/user/checkPassword`,
    method: 'post',
    data: data
  })
}

// CAS登录
export function casLogin(token) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/auth/casLogin/getLoginUser/${token}`,
    method: 'get',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}
