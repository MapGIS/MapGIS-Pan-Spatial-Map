import request from '@/utils/request'

// 根据参数键名查询参数值
export function getConfigValueByKey(configKey) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/config/configKey/` + configKey,
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
