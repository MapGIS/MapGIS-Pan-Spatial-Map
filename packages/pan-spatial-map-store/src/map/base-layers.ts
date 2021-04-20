import { UUID } from '@mapgis/webclient-store/src/utils'
import { getConfig } from '../api/config'

export class BaseLayersManager {
  private _layerCache: Map<string, Record<string, unknown>[]>

  private _layerNames: string[] = []

  private _config: Record<string, unknown>[]

  // private mapDocument: MapDocument = mapDocumentInstance

  private _defaultBaseLayerName = ''

  constructor() {
    this._layerCache = new Map()
    this._config = []
  }

  public get layerCache() {
    return this._layerCache
  }

  public get layerNames() {
    return this._layerNames
  }

  public set layerNames(layerNames: string[]) {
    this._layerNames = layerNames
  }

  public get config() {
    return this._config
  }

  /**
   * 索引底图名
   */
  public get defaultBaseLayerName() {
    return this._defaultBaseLayerName
  }

  public init(config: Record<string, unknown>[]) {
    this._config = config
    if (this._config.length > 0) {
      this._defaultBaseLayerName = `${
        this._config[this._config.length - 1].name
      }` // 初始化加载索引底图
    }
    // })
  }

  public CreateTianDiTuLayer(
    layer: Record<string, unknown>
  ): Record<string, unknown> {
    layer.subtype = 'TianDiTuLayer'
    layer.id = layer.id || UUID.uuid()

    return layer
  }

  public CreateIgsWmtsLayer(
    layer: Record<string, unknown>
  ): Record<string, unknown> {
    layer.subtype = 'WmtsLayer'
    layer.id = layer.id || UUID.uuid()

    return layer
  }

  public CreateArcgisLayer(
    layer: Record<string, unknown>
  ): Record<string, unknown> {
    layer.subtype = 'ArcgisLayer'
    layer.id = layer.id || UUID.uuid()

    return layer
  }

  public CreateGoogleLayer(
    layer: Record<string, unknown>
  ): Record<string, unknown> {
    layer.subtype = 'GoogleLayer'
    layer.id = layer.id || UUID.uuid()

    return layer
  }

  public CreateBaiduLayer(
    layer: Record<string, unknown>
  ): Record<string, unknown> {
    layer.subtype = 'BaiduLayer'
    layer.id = layer.id || UUID.uuid()

    return layer
  }

  public CreateGaodeLayer(
    layer: Record<string, unknown>
  ): Record<string, unknown> {
    layer.subtype = 'GaodeLayer'
    layer.id = layer.id || UUID.uuid()

    return layer
  }

  public CreateOpenWeatherLayer(
    layer: Record<string, unknown>
  ): Record<string, unknown> {
    layer.subtype = 'OpenWeatherLayer'
    layer.id = layer.id || UUID.uuid()

    return layer
  }

  public CreateIgsTileLayer(
    layer: Record<string, unknown>
  ): Record<string, unknown> {
    layer.subtype = 'TileLayer'
    layer.id = layer.id || UUID.uuid()

    return layer
  }

  public CreateIgsDocLayer(
    layer: Record<string, unknown>
  ): Record<string, unknown> {
    layer.subtype = 'DocLayer'
    layer.id = layer.id || UUID.uuid()

    return layer
  }
}

const baseLayerManagerInstance: BaseLayersManager = new BaseLayersManager()

export default baseLayerManagerInstance
