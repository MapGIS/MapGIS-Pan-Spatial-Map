import request from '@/utils/request'

// 获取系统配置信息
export function getSystemConfig() {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/webConfig/system`,
    method: 'get'
  })
}
