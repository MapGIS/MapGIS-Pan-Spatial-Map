import request from '@/utils/request'

// 查询网关路由列表
export function listRoute(query) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/route/list`,
    method: 'get',
    params: query
  })
}

// 查询网关路由详细
export function getRoute(gatewayRouteId) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/route/` + gatewayRouteId,
    method: 'get'
  })
}

// 新增网关路由
export function addRoute(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/route`,
    method: 'post',
    data: data
  })
}

// 修改网关路由
export function updateRoute(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/route`,
    method: 'put',
    data: data
  })
}

// 删除网关路由
export function delRoute(gatewayRouteId) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/route/` + gatewayRouteId,
    method: 'delete'
  })
}
