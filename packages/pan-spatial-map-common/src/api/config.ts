import { getRequest } from '../utils/request'

export function getConfig(name) {
  return getRequest()({
    url: `/api/config/${name}`,
    method: 'get'
  })
}

export interface WidgetConfigData {
  name: string
  config: string
}

export function getWidgetConfig(name) {
  return getRequest()({
    url: `/api/app/widget-config?name=${name}`,
    method: 'get'
  })
}

export function saveWidgetConfig(data: WidgetConfigData) {
  return getRequest()({
    url: '/api/app/widget-config',
    method: 'put',
    params: data
  })
}
