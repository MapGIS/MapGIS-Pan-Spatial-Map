import { APP_WIDGETS, APP_THEMES, APP_CONFIG } from '@/services/api'
import { request, METHOD, removeAuthorization } from '@/utils/request'

// 获取所有的Widgets
export function getWidgets() {
  return request(APP_WIDGETS, METHOD.GET)
}

// 获取所有的Themes
export function getThemes() {
  return request(APP_THEMES, METHOD.GET)
}

// 保存应用配置
export function edit(data) {
  return request(APP_CONFIG, METHOD.PUT, data)
}
