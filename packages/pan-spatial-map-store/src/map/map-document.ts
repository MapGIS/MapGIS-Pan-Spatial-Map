import { IDocument } from '@mapgis/webclient-store'
import { uuid } from '@mapgis/webclient-store/src/utils/uuid'
import systemConfigInstance, { SystemConfig } from '../config/system'

export class MapDocument {
  private _document: IDocument

  private static _instance: MapDocument

  private _defaultBaseLayer: any

  private constructor() {
    this._document = {
      layers: [],
      maprender: 'mapboxgl'
    }
  }

  public static getInstance() {
    if (!this._instance) {
      this._instance = new MapDocument()
    }
    return this._instance
  }

  public get document() {
    return this._document
  }

  public set document(document: IDocument) {
    this._document = document
  }

  /**
   * 索引底图
   */
  public get defaultBaseLayer() {
    return this._defaultBaseLayer
  }

  public static async init() {
    if (this._instance.defaultBaseLayer) {
      return
    }
    await SystemConfig.loadConfig()
    const {
      name,
      serverType,
      ip,
      port,
      defaultMapType,
      defaultMapName,
      image
    } = systemConfigInstance.config

    // 构建图层基本信息
    const obj: Record<string, unknown> = {
      id: uuid(),
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
    this._instance._defaultBaseLayer = obj
    const { xmin, ymin, xmax, ymax } = systemConfigInstance.config
    const document = {
      name: '地图文档',
      layers: [],
      maprender: 'mapboxgl',
      bounds: {
        east: xmin,
        south: ymin,
        west: xmax,
        north: ymax
      }
    }
    this._instance.document = document // 索引底图加在切换底图里，document只与目录树和图层树关联
  }
}

export default MapDocument.getInstance()
