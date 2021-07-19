import { CONFIG, WIDGET_CONFIG } from '@/services/api'
import { request, METHOD } from '@/utils/request'

export function getConfig(name) {
  return request({ url: `${CONFIG}/${name}.config.json`, method: METHOD.GET })
}

export function getWidgetConfig(name) {
  return request({
    url: `${CONFIG}/${name}/config.json`,
    method: METHOD.GET
  })
    .then(response => {
      return Promise.resolve(response)
    })
    .catch(error => {
      return request({
        url: `${WIDGET_CONFIG}/${name}/config.json`,
        method: METHOD.GET
      })
    })
}

export function saveWidgetConfig(data) {
  return Promise.resolve({ code: 200, data: {} })
}

export default {
  getConfig,
  getWidgetConfig,
  saveWidgetConfig
}
