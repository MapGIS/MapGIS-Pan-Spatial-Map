import { Layer } from '@mapgis/webclient-store'
import { Component, Vue, Mixins, Watch } from 'vue-property-decorator'
import { WidgetMixin, UUID, LayerType } from '@mapgis/web-app-framework'
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
  layerNamesChange(val) {
    const arr: Array<Record<string, unknown>> = []
    val.forEach(name => {
      const info: any = this.config.find(item => item.name === name)
      if (info) {
        const { children } = info
        const newLayers = children.forEach(item => {
          const {
            serverType,
            serverUrl,
            layerType,
            serverip,
            serverport,
            layerName
          } = item
          let layer: Record<string, unknown> = {}
          let templateUrl = serverUrl
          const guid = UUID.uuid()
          switch (serverType) {
            case 'tdt':
            case 'tianDi':
            case 'tianDiWMTS':
              if (!templateUrl) {
                let tempLayerType = layerType
                if (layerType === 'Zondy.Enum.Map.TiandituType.IMG') {
                  // 天地图影像数据
                  tempLayerType = 'img'
                } else if (layerType === 'Zondy.Enum.Map.TiandituType.CIA') {
                  // 天地图影像注记数据
                  tempLayerType = 'cia'
                } else if (layerType === 'Zondy.Enum.Map.TiandituType.VEC') {
                  // 天地图矢量数据
                  tempLayerType = 'vec'
                } else if (layerType === 'Zondy.Enum.Map.TiandituType.CVA') {
                  // 天地图矢量注记数据
                  tempLayerType = 'cia'
                }
                templateUrl = `http://t${Math.round(
                  Math.random() * 7
                )}.tianditu.gov.cn/${tempLayerType}_c/wmts`
              }
              layer = this.createTianDiTuLayer({
                baseURL: templateUrl,
                token: '2ddaabf906d4b5418aed0078e1657029',
                ip: serverip,
                port: serverport,
                guid
              })
              break
            case 'WMTS':
              layer = this.createIgsWmtsLayer({
                ip: serverip,
                port: serverport,
                guid,
                serverName: layerName,
                serverURL: serverUrl
              })
              break
            case 'arcgis':
              // eslint-disable-next-line no-case-declarations
              let tempLayerType: string = layerType
              if (
                layerType === 'Zondy.Enum.Map.ArcGISLayerType.ImageryWorld2D'
              ) {
                // ArcGIS影像图
                tempLayerType = 'ESRI_Imagery_World_2D'
              } else if (
                layerType === 'Zondy.Enum.Map.ArcGISLayerType.StreetMapWorld2D'
              ) {
                // ArcGIS街道图
                tempLayerType = 'ESRI_StreetMap_World_2D'
              } else if (
                layerType === 'Zondy.Enum.Map.ArcGISLayerType.TopoUS2D'
              ) {
                // ArcGIS晕渲图
                tempLayerType = 'NGS_Topo_US_2D'
              }
              templateUrl =
                'http://services.arcgisonline.com/ArcGIS/rest/services/{layerType}/MapServer/tile/{z}/{y}/{x}.jpg'
              layer = this.createArcgisLayer({
                ip: serverip,
                port: serverport,
                layerType: tempLayerType,
                guid,
                baseURL: `http://services.arcgisonline.com/ArcGIS/rest/services/${tempLayerType}/MapServer`,
                serverURL: `http://services.arcgisonline.com/ArcGIS/rest/services/${tempLayerType}/MapServer`
              })
              break
            case 'google':
            case 'googleExt':
              // eslint-disable-next-line no-case-declarations
              const { pType } = item
              layer = this.createGoogleLayer({
                ip: serverip,
                port: serverport,
                layerType,
                serverURL: serverUrl,
                pType,
                guid
              })
              break
            case 'baidu':
              layer = this.createBaiduLayer({
                ip: serverip,
                port: serverport,
                layerType,
                guid
              })
              break
            case 'gaode':
              layer = this.createGaodeLayer({
                ip: serverip,
                port: serverport,
                layerType,
                guid
              })
              break
            case 'OpenWeather':
              // eslint-disable-next-line no-case-declarations
              const { appid } = item
              layer = this.createOpenWeatherLayer({
                ip: serverip,
                port: serverport,
                layerType,
                appid,
                guid
              })
              break
            case 'tile':
              layer = this.createIgsTileLayer({
                ip: serverip,
                port: serverport,
                serverName: layerName,
                guid,
                serverURL: serverUrl
              })
              break
            case 'doc':
              layer = this.createIgsDocLayer({
                ip: serverip,
                port: serverport,
                serverName: layerName,
                guid,
                serverURL: serverUrl
              })
              break
            default:
              break
          }
          arr.push(DataCatalogManager.generateLayerByConfig({ ...layer, name }))
        })
      }
    })
    this.document.baseLayerMap.removeAll()
    arr.forEach(layer => {
      this.document.baseLayerMap.add(layer)
    })
  }

  mounted() {
    const defaultBaseLayer = this.createDefaultBaseLayer(
      baseConfigInstance.config
    )
    let serverType = ''
    if (defaultBaseLayer.serverType === LayerType.IGSMapImage) {
      serverType = 'doc'
    } else if (defaultBaseLayer.serverType === LayerType.IGSTile) {
      serverType = 'tile'
    }
    const tempDefaultBaseLayer = {
      image: defaultBaseLayer.image,
      name: defaultBaseLayer.title,
      scene: '23D',
      visible: 'true',
      children: [
        {
          layerName: defaultBaseLayer.serverName,
          layerType: null,
          projection: null,
          serverType,
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
    this.config = config
    if (this.config.length > 0) {
      this.defaultBaseLayerName = `${this.config[this.config.length - 1].name}` // 初始化加载索引底图
    }
  }

  public createTianDiTuLayer(
    layer: Record<string, unknown>
  ): Record<string, unknown> {
    layer.serverType = LayerType.OGCWMTS
    layer.guid = layer.guid || UUID.uuid()

    return layer
  }

  public createIgsWmtsLayer(
    layer: Record<string, unknown>
  ): Record<string, unknown> {
    layer.serverType = LayerType.OGCWMTS
    layer.guid = layer.guid || UUID.uuid()

    return layer
  }

  public createArcgisLayer(
    layer: Record<string, unknown>
  ): Record<string, unknown> {
    layer.serverType = LayerType.arcGISTile
    layer.guid = layer.guid || UUID.uuid()

    return layer
  }

  public createGoogleLayer(
    layer: Record<string, unknown>
  ): Record<string, unknown> {
    layer.serverType = 'GoogleLayer'
    layer.guid = layer.guid || UUID.uuid()

    return layer
  }

  public createBaiduLayer(
    layer: Record<string, unknown>
  ): Record<string, unknown> {
    layer.serverType = 'BaiduLayer'
    layer.guid = layer.guid || UUID.uuid()

    return layer
  }

  public createGaodeLayer(
    layer: Record<string, unknown>
  ): Record<string, unknown> {
    layer.serverType = 'GaodeLayer'
    layer.guid = layer.guid || UUID.uuid()

    return layer
  }

  public createOpenWeatherLayer(
    layer: Record<string, unknown>
  ): Record<string, unknown> {
    layer.serverType = 'OpenWeatherLayer'
    layer.guid = layer.guid || UUID.uuid()

    return layer
  }

  public createIgsTileLayer(
    layer: Record<string, unknown>
  ): Record<string, unknown> {
    layer.serverType = LayerType.IGSTile
    layer.guid = layer.guid || UUID.uuid()

    return layer
  }

  public createIgsDocLayer(
    layer: Record<string, unknown>
  ): Record<string, unknown> {
    layer.serverType = LayerType.IGSMapImage
    layer.guid = layer.guid || UUID.uuid()

    return layer
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
            obj.serverType = LayerType.IGSMapImage
            break
          case 'tile':
            obj.serverType = LayerType.IGSTile
            break
          default:
            break
        }
        break
      case 'OGCServer':
        break
      default:
        break
    }

    return obj
  }
}
