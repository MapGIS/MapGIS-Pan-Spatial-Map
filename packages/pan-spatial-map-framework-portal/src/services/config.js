import { CONFIG, WIDGET_CONFIG } from '@/services/api'
import { request, METHOD } from '@/utils/request'

export function getConfig(name) {
  return request({ url: `${CONFIG}/${name}.config.json`, method: METHOD.GET })
}

export function getWidgetConfig(name) {
  return request({
    url: `${WIDGET_CONFIG}/${name}/config.json`,
    method: METHOD.GET
  })
}

export default {
  getConfig,
  getWidgetConfig
}
