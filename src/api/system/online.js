import request from '@/utils/request'

// 查询在线用户列表
export function list(query) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/online/list`,
    method: 'get',
    params: query
  })
}

// 强退用户
export function forceLogout(tokenId) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/online/` + tokenId,
    method: 'delete'
  })
}
