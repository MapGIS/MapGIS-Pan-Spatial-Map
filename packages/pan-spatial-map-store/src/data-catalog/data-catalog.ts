import {
  Layer,
  LayerType,
  LoadStatus,
  LOD,
  TileInfo,
  TileLayer,
  MapImageLayer,
  IGSTileLayer,
  IGSMapImageLayer,
  IGSVectorLayer,
  OGCWMTSLayer,
  OGCWMSLayer
} from '@mapgis/web-app-framework/src/store/layer'
import baseConfigInstance from '../config/base'
import { queryIgsServicesInfoInstance } from '../service'

/**
 * 数据目录树管理类
 *
 * @author Yuanye Ma
 * @date 02/03/2021
 * @export
 * @class DataCatalog
 */
export class DataCatalogManager {
  /**
   * 获取数据目录管理对象实例
   *
   * @author Yuanye Ma
   * @date 05/03/2021
   * @static
   * @return {*} 数据目录管理对象实例
   * @memberof DataCatalogManager
   */
  public static getInstance() {
    if (!this._instance) {
      this._instance = new DataCatalogManager()
    }
    return this._instance
  }

  /**
   * 根据目录树中图层节点的配置信息生成webclient-store对应的图层
   * 注意：当前webClient-store中图层类型和图层对象的定义不够规范和成熟，如:LayerType和SubLayerType的划分标准不统一。图层类型对象不全面、
   * 图层的属性不全，如：缺少ogcWMTS图层、igsDocLayer缺少，等。故暂时只用其ILayer图层，将图层的配置参数作为ILayer的外挂属性layerConfig处理。
   * @author Yuanye Ma
   * @date 05/03/2021s
   * @static
   * @param {*} layerConfig 图层配置信息
   * @memberof DataCatalogManager
   */
  public static generateLayerByConfig(layerConfig: any): Layer | undefined {
    // 修改说明：当前webClient-store中图层类型和图层对象的定义不够规范和成熟，如:LayerType和SubLayerType的划分标准不统一。图层类型对象不全面、
    // 图层的属性不全：如：缺少ogcWMTS图层、igsDocLayer缺少子图层等。故使用web-app-framework中定义的图层。
    // 修改人：马原野 2021年03月09日

    let layer: Layer | undefined

    const defaultIp = baseConfigInstance.config.ip
    const defaultPort = baseConfigInstance.config.port

    let ip = ''
    let port = ''
    let serverName = ''
    let url = ''
    const layerID = layerConfig.guid
    const layerTitle = layerConfig.name

    switch (layerConfig.serverType) {
      case LayerType.IGSTile:
        if (layerConfig.serverURL && layerConfig.serverURL !== '') {
          url = layerConfig.serverURL
        } else {
          ip = layerConfig.ip || defaultIp
          port = layerConfig.port || defaultPort
          serverName = layerConfig.serverName

          url = `http://${ip}:${port}/igs/rest/mrms/tile/${serverName}`
        }

        layer = new IGSTileLayer({ url })

        break
      case LayerType.IGSMapImage:
        if (layerConfig.serverURL && layerConfig.serverURL !== '') {
          url = layerConfig.serverURL
        } else {
          ip = layerConfig.ip || defaultIp
          port = layerConfig.port || defaultPort
          serverName = layerConfig.serverName

          url = `http://${ip}:${port}/igs/rest/mrms/docs/${serverName}`
        }

        layer = new IGSMapImageLayer({ url })
        break
      case LayerType.IGSVector:
        // 在老的图层配置中serverURL存的是gdbps。
        ip = layerConfig.ip || defaultIp
        port = layerConfig.port || defaultPort

        url = `http://${ip}:${port}/igs/rest/mrms/layers`

        layer = new IGSVectorLayer({ url, gdbps: layerConfig.gdbps })
        break
      case LayerType.OGCWMTS:
        url = layerConfig.serverURL
        layer = new OGCWMTSLayer({ url })
        break
      case LayerType.OGCWMS:
        url = layerConfig.serverURL
        layer = new OGCWMSLayer({ url })
        break
      default:
        break
    }

    if (layer) {
      layer.title = layerTitle
      layer.id = layerID
    }

    return layer
  }

  /**
   * 通过目录树配置初始化目录树管理对象
   *
   * @author Yuanye Ma
   * @date 05/03/2021
   * @param {*} dataCatalogConfig 目录树配置信息
   * @memberof DataCatalogManager
   */
  public init(dataCatalogConfig: any) {
    this.config = dataCatalogConfig
  }

  /**
   * 更新目录树
   * 目录树有过滤功能,会过滤掉不可用配置项。当服务更新后,可通过该接口更新目录树.
   *
   * @author Yuanye Ma
   * @date 05/03/2021
   * @memberof DataCatalogManager
   */
  public update() {}

  /**
   * 根据节点的id获取对应的服务图层配置信息
   *
   * @author Yuanye Ma
   * @date 05/03/2021
   * @param {string} id 目录树配置中节点的guid,由后台生成,通过该id唯一标识一个服务图层配置项
   * @memberof DataCatalogManager
   */
  public getLayerConfigByID(id: string) {}

  /**
   * 获取处理过的目录树信息
   * 处理包括：
   * 1.格式转换：从一张图vue ant design版本之前的配置转换为新的配置。
   * 2.根据参数决定是否过滤不可用的配置项。过滤功能目前只考虑在基本配置中指定的服务器上发布的IGS服务(即ip和port为空的节点)。
   * 3.对目录树节点添加级别信息
   *
   * @author Yuanye Ma
   * @date 05/03/2021
   * @memberof DataCatalogManager
   */
  public async getDataCatalogTreeData(isFilterInvalidLayer = true) {
    if (isFilterInvalidLayer) {
      this.isFilterInvalidLayerConfig = isFilterInvalidLayer
      // 1.获取基本配置中指定的服务器上发布的IGS服务列表。
      const defaultIp = baseConfigInstance.config.ip
      const defaultPort = baseConfigInstance.config.port

      let tileList: any[] = []
      let docList: any[] = []

      let tileServiceInfo: any = {}
      let docServiceInfo: any = {}

      await queryIgsServicesInfoInstance
        .getTiles({ ip: defaultIp, port: defaultPort })
        .then(tiles => {
          tileServiceInfo = tiles
        })
        .catch(err => {})

      await queryIgsServicesInfoInstance
        .getDocs({ ip: defaultIp, port: defaultPort })
        .then(docs => {
          docServiceInfo = docs
        })
        .catch(err => {})

      // 对请求回来的结果进行处理:考虑有嵌套的服务列表,应该全部展开后放到一个数组中。
      tileList = this.processServiceInfo(tileServiceInfo, 'HDFNames', 'DirHDFs')
      docList = this.processServiceInfo(docServiceInfo, 'DOCNames', 'DirDOCs')

      this.defaultServerList = { tileList, docList }

      // 2.格式转换、为节点添加级别信息、判断服务是否可用。
      this.convertConfigData()
    } else if (this.configConverted.treeConfig.treeData === undefined) {
      this.convertConfigData()
    }

    return this.configConverted.treeConfig.treeData
  }

  /**
   * 判断节点是否为图层节点
   *
   * @author Yuanye Ma
   * @date 10/03/2021
   * @memberof DataCatalogManager
   */
  public isLayerNode(layerConfig: any) {
    if (layerConfig.serverType && layerConfig.serverType !== '') {
      return true
    }

    return false
  }

  // 目录树管理采用单例模式，不允许外部构造
  private constructor() {}

  // 数据目录管理对象实例
  private static _instance: DataCatalogManager

  // 数据目录的配置信息对象
  private config: any = {}

  // 转换后的数据目录的配置信息对象
  private configConverted: any = {}

  // 默认服务器上的服务列表,用于实现服务的过滤功能
  private defaultServerList: any = {}

  // 是否过滤不可用的图层节点
  private isFilterInvalidLayerConfig = true

  // 老版数据目录配置中记录的地图服务类型
  private readonly layerServiceType = {
    /**
     * 地图文档
     * @type {string}
     */
    IGSDOC: 'IGSIMAGE',
    /**
     * 瓦片
     * @type {string}
     */
    IGSTILE: 'IGSTILED',
    /**
     * 动态瓦片
     * @type {string}
     */
    IGSFASTTILED: 'IGSFASTTILED',
    /**
     * 快显
     * @type {string}
     */
    IGSFASTDISPLAY: 'IGSFASTIMAGE',
    /**
     * 图层
     * @type {string}
     */
    IGSVECTOR: 'IGSVECTOR',
    /**
     * 三维地图文档
     * @type {string}
     */
    IGSDOC3D: 'DOC3D',
    /**
     * 同上
     */
    IGSIMAGE3D: 'IGSIMAGE3D',
    /**
     * 模型图层
     * @type {string}
     */
    IGSMODELLAYER: 'MODEL',
    /**
     * 点云模型
     * @type {string}
     */
    POINTCLOUD: 'pointCloud',
    /**
     * 地形
     * @type {string}
     */
    TERRAIN: 'TERRAIN',
    /**
     * 地形缓存
     * @type {string}
     */
    TERRAINCACHE: 'TERRAINCACHE',
    /**
     * 模型缓存或倾斜摄影
     * @type {string}
     */
    TILE3D: 'TILE3D',
    /**
     * CZML
     * @type {string}
     */
    CZML: 'CZML',
    /**
     * GeoJson
     * @type {string}
     */
    GEOJSON: 'GEOJSON',
    /**
     * KML
     * @type {string}
     */
    KML: 'KML',
    /**
     * KMZ
     * @type {string}
     */
    KMZ: 'KMZ',
    /**
     * ImageArcGIS
     * @type {string}
     */
    IMAGEARCGIS: 'IMAGEARCGIS',
    /**
     * TileArcGIS
     * @type {string}
     */
    TILEARCGIS: 'TILEARCGIS',
    /**
     * WMS
     * @type {string}
     */
    WMS: 'WMS',
    /**
     * WFS
     * @type {string}
     */
    WFS: 'WFS',
    /**
     * WMTS
     * @type {string}
     */
    WMTS: 'WMTS',
    /**
     * 矢量瓦片
     * @type {string}
     */
    VECTORTILE: 'VTTILES',
    /**
     * 绘制图层
     * @type {string}
     */
    DRAWVECTOR: 'DRAWVECTOR',
    /**
     * 视频
     * @type {string}
     */
    VIDEO: 'VIDEO'
  }

  // 将老版本的配置转换为新版本的配置
  private convertConfigData() {
    // 1.转换keyConfig
    const keyConfig = {
      name: this.config.paramConfig.NAME, // 节点名称
      description: this.config.paramConfig.TITLE, // 节点描述
      icon: this.config.paramConfig.IMAGE, // 节点的图标(可选)
      level: 'level', // 节点的层次
      children: this.config.paramConfig.CHILDREN, // 子节点数组
      guid: this.config.paramConfig.GUID, // 图层唯一标识
      serverName: this.config.paramConfig.SERVERNAME, // 服务名(可选)
      serverType: 'serverType', // 服务类型
      serverSubType: 'serverSubType', // 服务子类型
      serverURL: this.config.paramConfig.SERVERURL, // 服务URL(可选)
      tokenName: 'tokenName', // token名称(可选)
      tokenValue: this.config.paramConfig.TOKEN, // token值(可选)
      ip: this.config.paramConfig.SERVERIP, // 服务ip(可选)
      port: this.config.paramConfig.SERVERPORT, // 服务端口(可选)
      bindData: 'bindData', // 绑定数据：与该服务图层相关联的服务信息,比如：与该瓦片服务对应的地图服务。应用中利用该字段可实现对瓦片服务的查询功能
      gdbps: 'gdbps' // 图层的gdbp地址，允许多个图层
    }

    this.configConverted.keyConfig = keyConfig

    // 2.转换iconConfig
    this.configConverted.iconConfig = this.config.iconConfig

    // 3.转换treeConfig
    const treeData: any = this.convertTreeData(
      this.config.treeConfig.treeData,
      0
    )
    const treeConfig: any = {
      isShowIcon: false, // 是否显示基础目录树节点图标
      // isShowIcon: this.config.paramConfig.SHOWICON, // 是否显示基础目录树节点图标
      treeData // 目录树配置
    }

    this.configConverted.treeConfig = treeConfig
  }

  // 转换目录树配置信息
  private convertTreeData(nodeArray: any[], nodeLevel: number) {
    const nodeArrayConverted: Array<any> = []
    if (nodeArray && nodeArray.length > 0) {
      nodeArray.forEach(node => {
        let nodeConverted: any = {}
        let isLayerInvalid = true

        // 通用信息
        const commonInfo: any = {
          name: node[this.configConverted.keyConfig.name] || '', // 节点名称
          description: node[this.configConverted.keyConfig.description] || '', // 节点描述
          icon: node[this.configConverted.keyConfig.icon] || '', // 节点的图标(可选)
          level: nodeLevel
        }

        let guid: string = node[this.configConverted.keyConfig.guid]

        // todo:按设计图层节点的guid应该在服务器端生成,并且保持不变,在后台不支持该功能的情况下先在前端处理。
        // 除图层节点外,其它节点在config中的guid不是必需的，这里生成guid是为满足UI显示的需要。
        if (guid === undefined || guid === '') {
          guid = this.genGUID()
        }

        commonInfo.guid = guid

        const layerServeiceType = node[this.config.paramConfig.LAYERSERVICETYPE]

        if (layerServeiceType && layerServeiceType !== '') {
          // 服务图层节点
          const serverLayerInfo: any = {
            children:
              node[this.configConverted.keyConfig.children] || undefined, // 子节点数组
            serverName: node[this.configConverted.keyConfig.serverName] || '', // 服务名(可选)
            serverURL: node[this.configConverted.keyConfig.serverURL] || '', // 服务URL(可选)
            tokenName: node[this.configConverted.keyConfig.tokenName] || '', // token名称(可选)
            tokenValue: node[this.configConverted.keyConfig.tokenValue] || '', // token值(可选)
            ip: node[this.configConverted.keyConfig.ip] || '', // 服务ip(可选)
            port: node[this.configConverted.keyConfig.port] || '', // 服务端口(可选)
            gdbps:
              node[this.configConverted.keyConfig.gdbps] ||
              node[this.configConverted.keyConfig.serverURL] // 图层的gdbp地址，允许多个图层
          }

          // 根据layerServiceType计算serverType
          const serverType = this.convertLayerServiceType(layerServeiceType)

          serverLayerInfo.serverType = serverType // 服务类型

          // 绑定数据：与该服务图层相关联的服务信息,比如：与该瓦片服务对应的地图服务。应用中利用该字段可实现对瓦片服务的查询功能
          // 老版本的配置中仅支持通过searchName指定与瓦片图层同一服务器上发布的在线地图文档
          const searchName = node[this.config.paramConfig.SEARCHNAME]

          if (searchName && searchName !== '') {
            const bindData: any = serverLayerInfo

            bindData.serverName = searchName
            bindData.serverType = LayerType.IGSMapImage

            serverLayerInfo.bindData = bindData
          }

          nodeConverted = { ...commonInfo, ...serverLayerInfo }

          // 图层过滤。
          if (this.isFilterInvalidLayerConfig) {
            isLayerInvalid = this.isServiceVaild(nodeConverted)
          }
        } else {
          nodeConverted = { ...commonInfo }
          // 组节点
          nodeConverted.children = this.convertTreeData(
            node[this.configConverted.keyConfig.children],
            nodeLevel + 1
          )
        }

        if (isLayerInvalid) {
          nodeArrayConverted.push(nodeConverted)
        }
      })
    }

    return nodeArrayConverted
  }

  // 根据layerServiceType计算serverType和serverSubType
  private convertLayerServiceType(layerServiceType: string) {
    let serverType = LayerType.unknown

    switch (layerServiceType) {
      case this.layerServiceType.IGSDOC:
        serverType = LayerType.IGSMapImage
        break
      case this.layerServiceType.IGSTILE:
        serverType = LayerType.IGSTile
        break
      case this.layerServiceType.IGSVECTOR:
        serverType = LayerType.IGSVector
        break
      case this.layerServiceType.WMS:
        serverType = LayerType.OGCWMS
        break
      case this.layerServiceType.WMTS:
        serverType = LayerType.OGCWMTS
        break
      case this.layerServiceType.TILEARCGIS:
        break
      case this.layerServiceType.IGSDOC3D:
      case this.layerServiceType.IGSIMAGE3D:
        break
      case this.layerServiceType.TILE3D:
        break
      case this.layerServiceType.POINTCLOUD:
        break
      case this.layerServiceType.VECTORTILE:
        serverType = LayerType.vectorTile
        break
      case this.layerServiceType.TERRAIN:
        break
      default:
        break
    }

    return serverType
  }

  // 判断服务是否可用.当前,只有服务类型为IGSDoc、IGSTile,且ip和port为空时,才能支持过滤。
  private isServiceVaild(layerConfig: any) {
    let isServiceVaild = true
    const { ip, port, serverName, serverType } = layerConfig
    let serverList: string[] = []
    switch (serverType) {
      case LayerType.IGSMapImage:
        serverList = this.defaultServerList.docList
        if (ip === '' && port === '') {
          if (!serverList.includes(serverName)) {
            isServiceVaild = false
          }
        }
        break
      case LayerType.IGSTile:
        serverList = this.defaultServerList.tileList
        if (ip === '' && port === '') {
          if (!serverList.includes(serverName)) {
            isServiceVaild = false
          }
        }

        break
      default:
        break
    }

    return isServiceVaild
  }

  // 根据图层配置生成栅格瓦片图层
  private static generateRasterTileLayerByConfig(layerConfig: any) {}

  // 生成guid
  private genGUID() {
    let guid = ''
    for (let i = 1; i <= 32; i += 1) {
      const n = Math.floor(Math.random() * 16.0).toString(16)
      guid += n
      if (i === 8 || i === 12 || i === 16 || i === 20) guid += '-'
    }
    return guid
  }

  // 处理服务列表的返回结果:将直接发布的服务和通地目录发布的服务合并为一个列表
  private processServiceInfo(
    serviceInfo: any,
    serviceListKey: string,
    dirKey: string
  ) {
    let serviceList: any[] = []

    if (serviceInfo) {
      if (serviceInfo[serviceListKey]) {
        serviceList = [...serviceInfo[serviceListKey]]
      }

      const dirList: [] = serviceInfo[dirKey]
      if (dirList) {
        dirList.forEach(dirItem => {
          const dirServiceList: [] = dirItem[serviceListKey]
          serviceList = [...serviceList, ...dirServiceList]
        })
      }
    }

    return serviceList
  }
}

export default DataCatalogManager.getInstance()
