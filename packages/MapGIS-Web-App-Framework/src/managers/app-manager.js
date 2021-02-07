import ConfigService from '../services/config-service'
import { deepClone } from '../utils'
import { default2DMapRender } from '../utils/map-render'
import WidgetState from '../utils/widget-state'

const { IDocument } = require('@mapgis/webclient-store')

export default class AppManager {
  constructor() {
    this.config = null
    this.app = {}
  }

  static getInstance() {
    // 单例
    if (!this.instance) {
      this.instance = new AppManager()
    }
    return this.instance
  }

  getApplication() {
    return this.app
  }

  // 加载应用
  async loadConfig(baseAPI, appConfigPath, appAssetsPath) {
    // 创建配置服务
    this.configService = new ConfigService(
      baseAPI,
      appConfigPath,
      appAssetsPath
    )

    // 将资源配置添加到app上
    this.app.baseAPI = baseAPI
    this.app.appConfigPath = appConfigPath
    this.app.appAssetsPath = appAssetsPath

    // 获取应用配置
    this.config = await this.configService.getAppConfig()
    // 创建document
    if (this.config.layers) {
      this.app.document = IDocument.deepclone(this.config)
    } else {
      this.app.document = { layers: [], maprender: default2DMapRender }
    }
    // 拷贝应用logo、标题和链接列表
    this.app.logo = this.config.logo
    this.app.title = this.config.title
    this.app.subtitle = this.config.subtitle
    this.app.links = deepClone(this.config.links)

    // 加载主题配置
    await this.loadThemeConfig()
    // 加载地图widgets
    await this.loadMapWidgetConfig()

    // 加载内容widgets
    await this.loadContentWidgetConfig()
  }

  async loadThemeConfig() {
    // 克隆
    this.app.theme = deepClone(this.config.theme)

    // 确保theme可响应，给可选的不存在的属性赋值null
    if (!this.app.theme.style) this.app.theme.style = null
    if (!this.app.theme.customStyle) this.app.theme.customStyle = null

    // 获取清单
    this.app.theme.manifest = await this.configService.getThemeManifest(
      `themes/${this.config.theme.name}`
    )
  }

  async loadMapWidgetConfig() {
    // 克隆
    this.app.mapWidgets = deepClone(this.config.mapWidgets)

    // 循环获取widget信息
    await Promise.all(
      this.app.mapWidgets.widgets.map(widget => this.loadWidgetConfig(widget))
    )
  }

  async loadContentWidgetConfig() {
    // 克隆
    this.app.contentWidgets = deepClone(this.config.contentWidgets)

    // 循环组
    for (let i = 0; i < this.app.contentWidgets.groups.length; i++) {
      // 循环组内widget信息
      await Promise.all(
        this.app.contentWidgets.groups[i].widgets.map(widget =>
          this.loadWidgetConfig(widget)
        )
      )

      // 确保group可响应，给可选的不存在的属性赋值null
      if (!this.app.contentWidgets.groups[i].widgetStructure)
        this.app.contentWidgets.groups[i].widgetStructure = null
    }
  }

  async loadWidgetConfig(widget) {
    if (!widget.uri) return

    // 获取widget清单
    widget.manifest = await this.configService.getWidgetManifest(widget.uri)

    // 默认微件的初始状态为关闭
    widget.state = WidgetState.CLOSED

    // 处理widget配置信息
    // 存在配置
    if (widget.manifest.properties.hasConfig) {
      // 默认Url
      let widgetConfigUrl = `${widget.uri}/config.json`
      if (
        typeof widget.config === 'object' &&
        widget.config.constructor === Object
      ) {
        // 如果为对象，直接使用
        widget.configDetial = deepClone(widget.config)
      } else {
        if (
          typeof widget.config === 'string' &&
          widget.config.constructor === String
        ) {
          // 如果为字符串，替换默认Url
          widgetConfigUrl = widget.config
        }

        // 获取widget配置
        widget.configDetial = await this.configService.getWidgetConfig(
          widgetConfigUrl
        )
      }
    }
  }
}
