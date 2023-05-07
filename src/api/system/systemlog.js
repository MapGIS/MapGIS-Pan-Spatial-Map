import request from '@/utils/request'

// 查询系统日志类别列表
export function getIds() {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/systemlog/getIds`,
    method: 'get'
  })
}

// 查询系统日志列表
export function list(query) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/systemlog/list`,
    method: 'get',
    params: query
  })
}
