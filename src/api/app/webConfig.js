import request from '@/utils/request'

// 查询应用资源
export function getAppResource(query) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/webConfig/app/resource`,
    method: 'get',
    params: query
  })
}

// 查询应用基本配置信息
export function getAppBase(query) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/webConfig/app/base`,
    method: 'get',
    params: query
  })
}
