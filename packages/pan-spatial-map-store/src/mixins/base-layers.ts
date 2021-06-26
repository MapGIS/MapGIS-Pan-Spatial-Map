/* eslint-disable max-classes-per-file */
import { Vue, Component, Prop } from 'vue-property-decorator'
import { UUID } from '@mapgis/web-app-framework'
import baseLayerManagerInstance, { BaseLayersManager } from '../map/base-layers'
import { getConfig } from '../api/config'
import { baseConfigInstance } from '../config'

@Component({})
export default class BaseLayersMixin extends Vue {
  private baseLayerManager: BaseLayersManager = baseLayerManagerInstance

  public defaultBaseLayerId: any = ''

  arr = []

  widgetInfo: any

  protected mounted() {
    const defaultBaseLayer = this.createDefaultBaseLayer(
      baseConfigInstance.config
    )
    let serverType = ''
    if (defaultBaseLayer.subtype === 'IgsDocLayer') {
      serverType = 'doc'
    } else if (defaultBaseLayer.subtype === 'IgsTileLayer') {
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
      this.baseLayerManager.init(config)
      if (config.length > 0) {
        this.layerNames = [this.baseLayerManager.defaultBaseLayerName] // 初始化加载索引底图
      } else {
        this.layerNames = [] // 初始化加载索引底图
      }
    }
  }

  protected get baseLayerConfig() {
    return this.baseLayerManager.config
  }

  protected get layerNames() {
    return this.baseLayerManager.layerNames
  }

  protected set layerNames(names: string[]) {
    names.forEach(name => {
      const layers = this.baseLayerManager.layerCache.get(name)
      if (!layers) {
        const info: any = this.baseLayerConfig.find(item => item.name === name)
        if (info) {
          const { children } = info
          const newLayers = children.map(item => {
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
            const id = UUID.uuid()
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
                layer = this.baseLayerManager.createTianDiTuLayer({
                  baseURL: templateUrl,
                  token: '2ddaabf906d4b5418aed0078e1657029',
                  ip: serverip,
                  port: serverport,
                  id
                })
                break
              case 'WMTS':
                layer = this.baseLayerManager.createIgsWmtsLayer({
                  ip: serverip,
                  port: serverport,
                  id,
                  serverName: layerName,
                  url: serverUrl
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
                  layerType ===
                  'Zondy.Enum.Map.ArcGISLayerType.StreetMapWorld2D'
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
                layer = this.baseLayerManager.createArcgisLayer({
                  ip: serverip,
                  port: serverport,
                  layerType: tempLayerType,
                  id,
                  baseURL: `http://services.arcgisonline.com/ArcGIS/rest/services/${tempLayerType}/MapServer`,
                  url: templateUrl
                })
                break
              case 'google':
              case 'googleExt':
                // eslint-disable-next-line no-case-declarations
                const { pType } = item
                layer = this.baseLayerManager.createGoogleLayer({
                  ip: serverip,
                  port: serverport,
                  layerType,
                  url: serverUrl,
                  pType,
                  id
                })
                break
              case 'baidu':
                layer = this.baseLayerManager.createBaiduLayer({
                  ip: serverip,
                  port: serverport,
                  layerType,
                  id
                })
                break
              case 'gaode':
                layer = this.baseLayerManager.createGaodeLayer({
                  ip: serverip,
                  port: serverport,
                  layerType,
                  id
                })
                break
              case 'OpenWeather':
                // eslint-disable-next-line no-case-declarations
                const { appid } = item
                layer = this.baseLayerManager.createOpenWeatherLayer({
                  ip: serverip,
                  port: serverport,
                  layerType,
                  appid,
                  id
                })
                break
              case 'tile':
                layer = this.baseLayerManager.createIgsTileLayer({
                  ip: serverip,
                  port: serverport,
                  serverName: layerName,
                  id,
                  url: serverUrl
                })
                break
              case 'doc':
                layer = this.baseLayerManager.createIgsDocLayer({
                  ip: serverip,
                  port: serverport,
                  serverName: layerName,
                  id,
                  url: serverUrl
                })
                break
              default:
                break
            }
            if (name === this.baseLayerManager.defaultBaseLayerName) {
              this.defaultBaseLayerId = id
            }
            return layer
          })
          this.baseLayerManager.layerCache.set(name, newLayers)
        }
      } else if (name === this.baseLayerManager.defaultBaseLayerName) {
        this.defaultBaseLayerId = layers[0].id
      }
    })
    this.baseLayerManager.layerNames = names
  }

  protected get layers() {
    const arr = this.baseLayerManager.layerNames.map(
      name => this.baseLayerManager.layerCache.get(name) || []
    )
    return arr
      .reduce((x, y) => [...x, ...y], [])
      .map((item, index) => ({
        ...item,
        layerIndex: index + 1
      }))
  }

  protected get tdtLayers() {
    return this.layers.filter(({ subtype }) => subtype === 'TianDiTuLayer')
  }

  protected get wmtsLayers() {
    return this.layers.filter(({ subtype }) => subtype === 'WmtsLayer')
  }

  protected get arcgisLayers() {
    return this.layers.filter(({ subtype }) => subtype === 'ArcgisLayer')
  }

  protected get googleLayers() {
    return this.layers.filter(({ subtype }) => subtype === 'GoogleLayer')
  }

  protected get baiduLayers() {
    return this.layers.filter(({ subtype }) => subtype === 'BaiduLayer')
  }

  protected get gaodeLayers() {
    return this.layers.filter(({ subtype }) => subtype === 'GaodeLayer')
  }

  protected get openWeatherLayers() {
    return this.layers.filter(({ subtype }) => subtype === 'OpenWeatherLayer')
  }

  protected get tileLayers() {
    return this.layers.filter(({ subtype }) => subtype === 'TileLayer')
  }

  protected get docLayers() {
    return this.layers.filter(({ subtype }) => subtype === 'DocLayer')
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
            obj.subtype = 'IgsDocLayer'
            break
          case 'tile':
            obj.subtype = 'IgsTileLayer'
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
