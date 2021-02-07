import request from '../utils/request'

export function getConfig(name) {
  return request({
    url: `api/config/${name}`,
    method: 'get'
  })
}

export interface WidgetConfigData {
  name: string
  config: string
}

export function getWidgetConfig(name) {
  return request({
    url: `api/app/widget-config?name=${name}`,
    method: 'get'
  })
}

export function saveWidgetConfig(data: WidgetConfigData) {
  return request({
    url: 'api/app/widget-config',
    method: 'put',
    data
  })
}
