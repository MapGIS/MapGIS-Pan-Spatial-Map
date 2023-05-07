import request from '@/utils/request'

// 查询登录日志列表
export function list(query) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/logininfor/list`,
    method: 'get',
    params: query
  })
}

// 删除登录日志
export function delLogininfor(infoId) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/logininfor/` + infoId,
    method: 'delete'
  })
}

// 解锁用户登录状态
export function unlockLogininfor(userName, ip) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/logininfor/unlock/${userName}/${ip}`,
    method: 'get'
  })
}

// 清空登录日志
export function cleanLogininfor() {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/logininfor/clean`,
    method: 'delete'
  })
}
