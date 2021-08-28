import { AppManager } from '@mapgis/web-app-framework'

export function getRequest() {
  return AppManager.getInstance().getRequest()
}
