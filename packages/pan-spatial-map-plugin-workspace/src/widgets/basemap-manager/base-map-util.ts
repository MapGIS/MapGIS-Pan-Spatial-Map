import { Layer } from '@mapgis/webclient-store'
import { Component, Vue, Mixins, Watch } from 'vue-property-decorator'
import {
  WidgetMixin,
  UUID,
  LayerType,
  LoadStatus
} from '@mapgis/web-app-framework'
import {
  utilInstance,
  baseConfigInstance,
  api,
  DataCatalogManager
} from '@mapgis/pan-spatial-map-store'

@Component
export default class BaseMapUtil extends Mixins(WidgetMixin) {
  config: Array<Record<string, unknown>> = []

  defaultBaseLayerName = ''

  layerNames: Array<string> = []

  widgetInfo: any

  document: any

  @Watch('layerNames', { deep: true, immediate: true })
  async layerNamesChange(newValue: Array<string>, oldValue: Array<string>) {
    // 取消勾选的时候删除图层
    for (let index = 0; index < oldValue.length; index++) {
      const name = oldValue[index]
      if (!newValue.includes(name)) {
        const info: any = this.config.find(item => item.name === name)
        for (let i = 0; i < info.children.length; i++) {
          const layer = info.children[i]
          this.document.baseLayerMap.remove(layer)
        }
      }
    }

    // 勾选的时候添加图层，这里使用for是为了 异步await
    for (let index = 0; index < newValue.length; index++) {
      const name = newValue[index]
      if (!oldValue.includes(name)) {
        const info: any = this.config.find(item => item.name === name)
        for (let i = 0; i < info.children.length; i++) {
          const layer = info.children[i]
          if (layer.loadStatus === LoadStatus.notLoaded) {
            await layer.load()
            this.document.baseLayerMap.add(layer)
          } else {
            this.document.baseLayerMap.add(layer)
          }
        }
      }
    }
  }

  mounted() {
    const defaultBaseLayer = this.createDefaultBaseLayer(
      baseConfigInstance.config
    )
    const tempDefaultBaseLayer = {
      image: defaultBaseLayer.image,
      name: defaultBaseLayer.title,
      scene: '23D',
      visible: 'true',
      children: [
        {
          layerName: defaultBaseLayer.serverName,
          layerType: '',
          projection: '',
          serverType: defaultBaseLayer.serverType,
          serverUrl: '',
          serverip: defaultBaseLayer.ip,
          serverport: defaultBaseLayer.port
        }
      ]
    }
    if (this.widgetInfo) {
      const { config } = this.widgetInfo
      config.push(tempDefaultBaseLayer)
      this.init(config)
      if (config.length > 0) {
        this.layerNames = [this.defaultBaseLayerName] // 初始化加载索引底图
      } else {
        this.layerNames = [] // 初始化加载索引底图
      }
    }
  }

  public init(config: Record<string, unknown>[]) {
    this.config = this.setConfig(config)
    if (this.config.length > 0) {
      this.defaultBaseLayerName = `${this.config[this.config.length - 1].name}` // 初始化加载索引底图
    }
  }

  // 将配置类型转换为新版一张图可用的类型
  setConfig(config) {
    const arr = config.map(element => {
      const { children } = element
      const configChildren = children.map(item => {
        return this.convertConfigToLayer(item)
      })
      return {
        ...element,
        children: configChildren
      }
    })
    return arr
  }

  convertConfigToLayer(item) {
    const {
      serverType,
      serverUrl,
      layerType,
      serverip,
      serverport,
      layerName,
      projection
    } = item
    const layer: Record<string, string> = {
      ip: serverip,
      port: serverport,
      guid: UUID.uuid(),
      serverName: layerName,
      serverURL: serverUrl,
      name: layerName,
      serverType: ''
    }
    // 类型映射表
    let map: Record<string, string>
    switch (serverType) {
      case 'tdt':
        if (!serverUrl) {
          map = {
            // 天地图影像数据
            'Zondy.Enum.Map.TiandituType.IMG': 'img',
            // 天地图影像注记数据
            'Zondy.Enum.Map.TiandituType.CIA': 'cia',
            // 天地图矢量数据
            'Zondy.Enum.Map.TiandituType.VEC': 'vec',
            // 天地图矢量注记数据
            'Zondy.Enum.Map.TiandituType.CVA': 'cia'
          }
          const type = map[layerType] || layerType
          const tilematrixSet = projection.includes('EPSG:4326') ? 'c' : 'w'
          layer.serverURL = `http://t${Math.round(
            Math.random() * 7
          )}.tianditu.gov.cn/${type}_${tilematrixSet}/wmts`
        }

        layer.serverType = LayerType.OGCWMTS
        layer.tokenKey = 'tk'
        layer.tokenValue = '2ddaabf906d4b5418aed0078e1657029'
        break
      case 'WMTS':
        layer.serverType = LayerType.OGCWMTS
        break
      case 'arcgis':
        // 目前只支持arcGISTile类型
        map = {
          // ArcGIS影像图
          'Zondy.Enum.Map.ArcGISLayerType.ImageryWorld2D':
            'ESRI_Imagery_World_2D',
          // ArcGIS街道图
          'Zondy.Enum.Map.ArcGISLayerType.StreetMapWorld2D':
            'ESRI_StreetMap_World_2D',
          // ArcGIS晕渲图
          'Zondy.Enum.Map.ArcGISLayerType.TopoUS2D': 'NGS_Topo_US_2D'
        }
        const type = map[layerType] || layerType
        layer.serverURL = `http://services.arcgisonline.com/ArcGIS/rest/services/${type}/MapServer`
        layer.serverType = LayerType.arcGISTile
        break
      case 'baidu':
        // TODO:
        break
      case 'gaode':
        // TODO:
        break
      case 'OpenWeather':
        // TODO:
        break
      case 'tile':
        layer.serverType = LayerType.IGSTile
        break
      case 'doc':
        layer.serverType = LayerType.IGSMapImage
        break
      default:
        break
    }
    const mapLayer = DataCatalogManager.generateLayerByConfig(layer)
    // if (mapLayer.loadStatus === LoadStatus.notLoaded) {
    //   await mapLayer.load()
    // }
    return mapLayer
  }

  public createDefaultBaseLayer(baseConfig: Record<string, unknown>) {
    const {
      name,
      serverType,
      ip,
      port,
      defaultMapType,
      defaultMapName,
      image
    } = baseConfig

    // 构建图层基本信息
    const obj: Record<string, unknown> = {
      ip,
      port,
      title: name,
      type: 'RasterTile',
      image
    }

    // 根据服务类型初始化图层信息
    switch (serverType) {
      case 'IGServer':
        obj.serverName = defaultMapName
        switch (defaultMapType) {
          case 'doc':
            obj.serverType = 'doc'
            break
          case 'tile':
            obj.serverType = 'tile'
            break
          default:
            break
        }
        break
      default:
        break
    }

    return obj
  }
}
