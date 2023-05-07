import request from '@/utils/request'

// 查询第三方登录配置列表
export function listAuthConfig(query) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/authConfig/list`,
    method: 'get',
    params: query
  })
}

// 查询第三方登录配置详细
export function getAuthConfig(configId) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/authConfig/` + configId,
    method: 'get'
  })
}

// 新增第三方登录配置
export function addAuthConfig(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/authConfig`,
    method: 'post',
    data: data
  })
}

// 修改第三方登录配置
export function updateAuthConfig(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/authConfig`,
    method: 'put',
    data: data
  })
}

// 删除第三方登录配置
export function delAuthConfig(configId) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/authConfig/` + configId,
    method: 'delete'
  })
}
