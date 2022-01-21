import { APP_WIDGETS, APP_THEMES, APP_CONFIG } from '@/services/api'
import { request, METHOD, removeAuthorization } from '@/utils/request'

// 获取所有的Widgets
export function getWidgets() {
  return request({ url: APP_WIDGETS, method: METHOD.GET })
}

// 获取所有的Themes
export function getThemes() {
  return request({ url: APP_THEMES, method: METHOD.GET })
}

// 保存应用配置
export function edit(data) {
  return request({ url: APP_CONFIG, method: METHOD.PUT, params: data })
}
