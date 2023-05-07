import request from '@/utils/request'

// 获取应用基本配置信息
export function getAppBaseConfig() {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/webConfig/app/base`,
    method: 'get'
  })
}

// 获取系统配置信息
export function getSystemConfig() {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/webConfig/system`,
    method: 'get'
  })
}
