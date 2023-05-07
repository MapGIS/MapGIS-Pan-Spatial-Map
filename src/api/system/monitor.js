import request from '@/utils/request'

// 查询服务器性能信息
export function getServerPerformance() {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/monitor/serverPerformance`,
    method: 'get'
  })
}

// 查询服务器详细
export function getServer() {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/monitor/server`,
    method: 'get'
  })
}

// 查询服务器详细
export function getServerRange(query) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/monitor/server/range`,
    method: 'get',
    params: query
  })
}
