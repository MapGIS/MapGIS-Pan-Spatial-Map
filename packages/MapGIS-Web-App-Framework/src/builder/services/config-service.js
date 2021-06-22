import createAxiosInstance from '../utils/request'

export default class ConfigService {
  constructor(baseAPI, appConfigPath, appAssetsPath) {
    this.baseAPI = baseAPI
    this.appConfigPath = appConfigPath
    this.appAssetsPath = appAssetsPath
    this.request = createAxiosInstance(baseAPI)
  }

  getRequest() {
    return this.request
  }

  getAppConfig() {
    return this.request({
      url: this.appConfigPath,
      method: 'get'
    })
  }

  getThemeManifest(themeUri) {
    return this.request({
      url: `${this.appAssetsPath}${themeUri}/manifest.json`,
      method: 'get'
    })
  }

  getWidgetManifest(widgetUri) {
    return this.request({
      url: `${this.appAssetsPath}${widgetUri}/manifest.json`,
      method: 'get'
    })
  }

  getWidgetConfig(widgetConfigUrl) {
    return this.request({
      url: `${this.appAssetsPath}${widgetConfigUrl}`,
      method: 'get'
    })
  }
}
