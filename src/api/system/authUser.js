import request from '@/utils/request'

// 查询用户授权信息
export function getAuthInfo() {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/authUser/info`,
    method: 'get'
  })
}

// 检查是否授权
export function checkAuthUser(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/authUser/check`,
    method: 'post',
    data: data
  })
}

// 绑定授权
export function bindAuth(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/authUser/bind`,
    method: 'post',
    data: data
  })
}

// 取消授权
export function unbindAuth(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/authUser/unbind`,
    method: 'post',
    data: data
  })
}
