import request from '@/utils/request'

// 查询角色列表
export function listRole(query) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/role/list`,
    method: 'get',
    params: query
  })
}

// 查询角色详细
export function getRole(roleId) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/role/` + roleId,
    method: 'get'
  })
}

// 新增角色
export function addRole(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/role`,
    method: 'post',
    data: data
  })
}

// 修改角色
export function updateRole(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/role`,
    method: 'put',
    data: data
  })
}

// 刷新角色权限
export function refresh(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/role/refresh`,
    method: 'get'
  })
}

// 角色数据权限
export function dataScope(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/role/dataScope`,
    method: 'put',
    data: data
  })
}

// 删除角色
export function delRole(roleId) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/role/` + roleId,
    method: 'delete'
  })
}

// 查询角色已授权用户列表
export function allocatedUserList(query) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/role/authUser/allocatedList`,
    method: 'get',
    params: query
  })
}

// 查询角色未授权用户列表
export function unallocatedUserList(query) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/role/authUser/unallocatedList`,
    method: 'get',
    params: query
  })
}

// 取消用户授权角色
export function authUserCancel(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/role/authUser/cancel`,
    method: 'put',
    data: data
  })
}

// 批量取消用户授权角色
export function authUserCancelAll(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/role/authUser/cancelAll`,
    method: 'put',
    params: data
  })
}

// 授权用户选择
export function authUserSelectAll(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/role/authUser/selectAll`,
    method: 'put',
    params: data
  })
}

// 根据角色ID查询部门树结构
export function deptTreeSelect(roleId) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/role/deptTree/${roleId}`,
    method: 'get'
  })
}
