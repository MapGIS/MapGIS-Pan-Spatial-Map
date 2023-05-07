import request from '@/utils/request'

// 获取应用配置信息
export function getAppConfig() {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/store/config`,
    method: 'get'
  })
}

// 修改主题
export function updateApp(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/store/config`,
    method: 'put',
    data: data
  })
}

// 获取应用微件列表
export function listAppWidget(query) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/store/config/widget/list`,
    method: 'get',
    params: query
  })
}

// 获取应用微件配置信息
export function getAppWidgetConfig(appWidgetId) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/store/config/widget/config`,
    method: 'get',
    params: {
      appWidgetId
    }
  })
}

// 获取应用微件配置信息
export function updateAppWidget(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/store/config/widget/config`,
    method: 'put',
    data: data
  })
}
