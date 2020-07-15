/* eslint-disable max-classes-per-file */
import { Vue, Component } from 'vue-property-decorator'
import { uuid } from '@mapgis/webclient-store/src/utils/uuid'
import baseLayerManagerInstance, { BaseLayersManager } from '../map/base-layers'

@Component({})
export default class BaseLayersMixin extends Vue {
  private baseLayerManager: BaseLayersManager = baseLayerManagerInstance

  public defaultBaseLayerId: any = ''

  protected async created() {
    await this.baseLayerManager.init()
    this.layerNames = [this.baseLayerManager.defaultBaseLayerName] // 初始化加载索引底图
  }

  protected get config() {
    return this.baseLayerManager.config
  }

  protected get layerNames() {
    return this.baseLayerManager.layerNames
  }

  protected set layerNames(names: string[]) {
    names.forEach(name => {
      const layers = this.baseLayerManager.layerCache.get(name)
      if (!layers) {
        const info: any = this.config.find(item => item.name === name)
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
            const id = uuid()
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
                layer = this.baseLayerManager.CreateTianDiTuLayer({
                  baseURL: templateUrl,
                  token: '2ddaabf906d4b5418aed0078e1657029',
                  ip: serverip,
                  port: serverport,
                  id
                })
                break
              case 'WMTS':
                layer = this.baseLayerManager.CreateIgsWmtsLayer({
                  ip: serverip,
                  port: serverport,
                  id,
                  serverName: layerName,
                  url: serverUrl
                })
                break
              case 'arcgis':
                // eslint-disable-next-line no-case-declarations
                let tempLayerType: string
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
                templateUrl = `http://services.arcgisonline.com/ArcGIS/rest/services/${tempLayerType}/MapServer`
                layer = this.baseLayerManager.CreateArcgisLayer({
                  ip: serverip,
                  port: serverport,
                  layerType,
                  id,
                  url: templateUrl
                })
                break
              case 'google':
              case 'googleExt':
                // eslint-disable-next-line no-case-declarations
                const { pType } = item
                layer = this.baseLayerManager.CreateGoogleLayer({
                  ip: serverip,
                  port: serverport,
                  layerType,
                  url: serverUrl,
                  pType,
                  id
                })
                break
              case 'baidu':
                layer = this.baseLayerManager.CreateBaiduLayer({
                  ip: serverip,
                  port: serverport,
                  layerType,
                  id
                })
                break
              case 'gaode':
                layer = this.baseLayerManager.CreateGaodeLayer({
                  ip: serverip,
                  port: serverport,
                  layerType,
                  id
                })
                break
              case 'OpenWeather':
                // eslint-disable-next-line no-case-declarations
                const { appid } = item
                layer = this.baseLayerManager.CreateOpenWeatherLayer({
                  ip: serverip,
                  port: serverport,
                  layerType,
                  appid,
                  id
                })
                break
              case 'tile':
                layer = this.baseLayerManager.CreateIgsTileLayer({
                  ip: serverip,
                  port: serverport,
                  serverName: layerName,
                  id,
                  url: serverUrl
                })
                break
              case 'doc':
                layer = this.baseLayerManager.CreateIgsDocLayer({
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
    return this.baseLayerManager.layerNames
      .map(name => this.baseLayerManager.layerCache.get(name) || [])
      .reduce((x, y) => [...x, ...y], [])
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
}
