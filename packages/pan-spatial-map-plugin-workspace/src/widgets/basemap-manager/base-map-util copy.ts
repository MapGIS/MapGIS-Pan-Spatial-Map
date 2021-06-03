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
                guid,
                layerType
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
                baseURL: templateUrl,
                serverURL: `http://services.arcgisonline.com/ArcGIS/rest/services/${tempLayerType}/MapServer`
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

          const mapLayer = DataCatalogManager.generateLayerByConfig({
            ...layer,
            name
          })
          // 2.将图层添加到全局的document中。
          if (mapLayer) {
            arr.push(mapLayer)
          }
        })
      }
    })
    this.document.baseLayerMap.removeAll()
    arr.map(async layer => {
      if (layer.loadStatus === LoadStatus.notLoaded) {
        await layer.load()
      }
      this.document.baseLayerMap.add(layer)
      return null
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
    item: Record<string, string>
  ): Record<string, unknown> {
    // layer.serverType = LayerType.OGCWMTS
    // layer.guid = layer.guid || UUID.uuid()

    const { baseURL, token, ip, port, guid } = item
    let { layerType } = item

    let url_tdt = ''
    const layerLabelMap = {
      vec: 'cva',
      ter: 'cta',
      img: 'cia'
    }
    const layerZoomMap = {
      vec: 18,
      ter: 14,
      img: 18
    }
    const version = '1.0.0'
    const tdtStyle = 'default'
    const format = 'tiles'
    const tileSize = 512

    let layer: string = layerType
    const tilematrixSet = 'c'
    if (baseURL) {
      let str = baseURL.split('gov.cn/')[1]
      if (baseURL.indexOf('?') > 0) {
        str = str.split('?')[0]
      }
      layerType = str.substring(0, str.length - 7)
      layer = layerType
      url_tdt = baseURL
      if (!baseURL.includes('?')) {
        url_tdt += '?'
      }
    } else {
      const tempUrl = `http://t${Math.round(
        Math.random() * 7
      )}.tianditu.gov.cn/{layer}_{proj}/wmts?`
      url_tdt = tempUrl
        .replace('{layer}', layer)
        .replace('{proj}', tilematrixSet)
    }

    const params: Array<string> = []
    if (!layerType.includes('igs')) {
      params.push('request=GetTile')
      params.push(`version=${version}`)
      params.push(`style=${tdtStyle}`)
      params.push(`tilematrixSet=${tilematrixSet}`)
      params.push(`format=${format}`)
      params.push(`width=${tileSize}`)
      params.push(`height=${tileSize}`)
      params.push(`layer=${layer}`)
      params.push('tilematrix={TileMatrix}')
      params.push('tilerow={TileRow}')
      params.push('tilecol={TileCol}')
    }
    if (token) {
      params.push(`tk=${token}`)
    }
    params.push('service=WMTS')
    url_tdt += params.join('&')

    return {
      serverType: LayerType.OGCWMTS,
      guid: item.guid || UUID.uuid(),
      ip,
      port,
      serverURL: url_tdt
    }
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
    layer.serverType = (layer.baseURL as string).includes('{z}/{y}/{x}')
      ? LayerType.arcGISTile
      : LayerType.arcGISMapImage
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
