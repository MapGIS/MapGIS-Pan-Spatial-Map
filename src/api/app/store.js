import request from '@/utils/request'

// 获取应用配置信息
export function getAppConfig() {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/store/config`,
    method: 'get'
  })
}
