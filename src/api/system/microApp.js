import request from '@/utils/request'

// 查询微应用路由列表
export function listMicroApp(query) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/microApp/list`,
    method: 'get',
    params: query
  })
}

// 查询微应用路由详细
export function getMicroApp(microAppId) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/microApp/` + microAppId,
    method: 'get'
  })
}

// 查询微应用路由详细
export function getMicroApps() {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/microApp/getMicroApps`,
    method: 'get'
  })
}

// 新增微应用路由
export function addMicroApp(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/microApp`,
    method: 'post',
    data: data
  })
}

// 修改微应用路由
export function updateMicroApp(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/microApp`,
    method: 'put',
    data: data
  })
}

// 删除微应用路由
export function delMicroApp(microAppId) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/microApp/` + microAppId,
    method: 'delete'
  })
}
