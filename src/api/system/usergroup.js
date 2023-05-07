import request from '@/utils/request'

// 查询用户组列表
export function listUsergroup(query) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/usergroup/list`,
    method: 'get',
    params: query
  })
}

// 查询用户组详细
export function getUsergroup(userGroupId) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/usergroup/` + userGroupId,
    method: 'get'
  })
}

// 新增用户组
export function addUsergroup(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/usergroup`,
    method: 'post',
    data: data
  })
}

// 修改用户组
export function updateUsergroup(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/usergroup`,
    method: 'put',
    data: data
  })
}

// 删除用户组
export function delUsergroup(userGroupId) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/usergroup/` + userGroupId,
    method: 'delete'
  })
}
