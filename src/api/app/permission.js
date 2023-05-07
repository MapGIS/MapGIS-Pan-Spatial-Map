import request from '@/utils/request'

// 获取数据权限
export function getDataPermission(roleId) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/permission/data`,
    method: 'get',
    params: {
      roleId
    }
  })
}

// 修改数据权限
export function updateDataPermission(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/permission/data`,
    method: 'put',
    data: data
  })
}

// 获取微件权限
export function getWidgetPermission(roleId) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/permission/widget`,
    method: 'get',
    params: {
      roleId
    }
  })
}

// 修改微件权限
export function updateWidgetPermission(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/permission/widget`,
    method: 'put',
    data: data
  })
}
