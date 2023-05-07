import request from '@/utils/request'

// 查询应用基本配置信息
export function getAppBaseConfig(query) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/webConfig/app/base`,
    method: 'get',
    params: query
  })
}
