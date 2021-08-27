import createAxiosInstance from '../utils/request'

export default class ConfigService {
  constructor(baseAPI, appConfigPath, appAssetsPath, request) {
    this.baseAPI = baseAPI
    this.appConfigPath = appConfigPath
    this.appAssetsPath = appAssetsPath
    if (request) {
      this.request = request
    } else {
      this.request = createAxiosInstance(baseAPI)
    }
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

  getThemeLayout(themeUri) {
    return this.request({
      url: `${this.appAssetsPath}${themeUri}/layout.json`,
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
