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
  IGSPanoramicLayer,
  IGSVectorLayer,
  OGCWMTSLayer,
  OGCWMSLayer,
  ArcGISTileLayer,
  ArcGISMapImageLayer,
  VectorTileLayer,
  IGSSceneLayer,
  DataFlowLayer,
  IGSFeatureLayer,
  GeoJsonLayer,
  ModelCacheLayer,
  ModelCacheFormat,
  GraphicsLayer,
  UUID,
  Catalog,
  UrlUtil,
} from '@mapgis/web-app-framework'
import baseConfigInstance from '../config/base'
import axios from 'axios'

/**
 * 数据目录管理类
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

  public static parseModelCacheFormatType(
    typeString: string
  ): ModelCacheFormat {
    const type = ModelCacheFormat[typeString]
    if (type === undefined) {
      return LayerType.m3d
    }

    return type
  }

  public static parseLayerType(typeString: string): LayerType {
    const type = LayerType[typeString]
    if (type === undefined) {
      return LayerType.Unknown
    }

    return type
  }

  /**
   * 根据数据目录中图层节点的配置信息生成webclient-store对应的图层
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
    let gdbps = ''
    let modelCacheFormat = ModelCacheFormat.m3d
    const layerID = layerConfig.guid
    const layerTitle = layerConfig.name
    const tokenKey = layerConfig.tokenKey ? layerConfig.tokenKey : ''
    const tokenValue = layerConfig.tokenValue ? layerConfig.tokenValue : ''

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
      case LayerType.IGSPanoramic:
        if (layerConfig.serverURL && layerConfig.serverURL !== '') {
          url = layerConfig.serverURL
        } else {
          ip = layerConfig.ip || defaultIp
          port = layerConfig.port || defaultPort
          serverName = layerConfig.serverName

          url = `http://${ip}:${port}/igs/rest/mrms/docs/${serverName}`
        }

        layer = new IGSPanoramicLayer({ url })
        console.log(layer)
        break
      case LayerType.IGSVector:
        // 在老的图层配置中serverURL存的是gdbps。
        if (
          layerConfig.serverURL &&
          layerConfig.serverURL !== '' &&
          UrlUtil.isUrlValid(layerConfig.serverURL)
        ) {
          url = UrlUtil.getQueryPath(layerConfig.serverURL)
          const queryParams = UrlUtil.getQueryParams(layerConfig.serverURL)

          if (queryParams.gdbps) gdbps = queryParams.gdbps
        } else {
          ip = layerConfig.ip || defaultIp
          port = layerConfig.port || defaultPort

          url = `http://${ip}:${port}/igs/rest/mrms/layers`

          gdbps = layerConfig.gdbps
        }

        layer = new IGSVectorLayer({ url, gdbps })
        break
      case LayerType.OGCWMTS:
        url = layerConfig.serverURL
        layer = new OGCWMTSLayer({ url })
        break
      case LayerType.OGCWMS:
        url = layerConfig.serverURL
        layer = new OGCWMSLayer({ url })
        break
      case LayerType.ArcGISTile:
        url = layerConfig.serverURL
        layer = new ArcGISTileLayer({ url })
        break
      case LayerType.ArcGISMapImage:
        url = layerConfig.serverURL
        layer = new ArcGISMapImageLayer({ url })
        break
      case LayerType.VectorTile:
        url = layerConfig.serverURL
        layer = new VectorTileLayer({ url })
        break
      case LayerType.DataFlow:
        url = layerConfig.serverURL
        layer = new DataFlowLayer({ url })
        break
      case LayerType.IGSScene:
        if (layerConfig.serverURL && layerConfig.serverURL !== '') {
          url = layerConfig.serverURL
        } else {
          ip = layerConfig.ip || defaultIp
          port = layerConfig.port || defaultPort
          serverName = layerConfig.serverName

          url = `http://${ip}:${port}/igs/rest/g3d/${serverName}`
        }

        layer = new IGSSceneLayer({ url })

        if (layerConfig.customParameters) {
          layerConfig.customParameters.forEach((param) => {
            const extendedPropKeys = param.extendedPropKeys

            if (extendedPropKeys) {
              layer.extendedPropKeys = extendedPropKeys
            }
          })
        }
        break
      case LayerType.IGSFeature:
        if (layerConfig.serverURL && layerConfig.serverURL !== '') {
          url = layerConfig.serverURL
        }

        layer = new IGSFeatureLayer({ url })
        break
      case LayerType.GeoJson:
        if (layerConfig.serverURL && layerConfig.serverURL !== '') {
          url = layerConfig.serverURL

          layer = new GeoJsonLayer({ ...layerConfig, url })
        } else {
          layer = new GeoJsonLayer(layerConfig)
        }

        break
      case LayerType.ModelCache:
        if (layerConfig.serverURL && layerConfig.serverURL !== '') {
          url = layerConfig.serverURL

          if (
            layerConfig.customParameters &&
            layerConfig.customParameters.length > 0
          ) {
            modelCacheFormat = this.parseModelCacheFormatType(
              layerConfig.customParameters[0].format
            )
          }
        }

        layer = new ModelCacheLayer({ url, format: modelCacheFormat })

        break
      case LayerType.Graphics:
        layer = new GeoJsonLayer(layerConfig)

        break
      default:
        break
    }

    if (layer) {
      layer.title = layerTitle
      layer.id = layerID
      layer.tokenKey = tokenKey
      layer.tokenValue = tokenValue
    }
    return layer
  }

  /**
   * 数据目录中选中的图层节点的guid
   * guid为图层节点配置中的guid字段的值。该字段用于唯一标识一个节点配置。
   *
   * @date 16/04/2021
   * @type {string[]}
   * @memberof DataCatalogManager
   */
  public checkedLayerConfigIDs: string[] = []

  /**
   * 通过数据目录配置初始化数据目录管理对象
   *
   * @author Yuanye Ma
   * @date 05/03/2021
   * @param {*} dataCatalogConfig 数据目录配置信息
   * @memberof DataCatalogManager
   */
  public init(dataCatalogConfig: any) {
    this.config = dataCatalogConfig
  }

  /**
   * 更新数据目录
   * 数据目录有过滤功能,会过滤掉不可用配置项。当服务更新后,可通过该接口更新数据目录.
   *
   * @author Yuanye Ma
   * @date 05/03/2021
   * @memberof DataCatalogManager
   */
  public update() {}

  /**
   * 根据节点的id获取对应的服务图层配置信息
   * @author Yuanye Ma
   * @date 15/04/2021
   * @param {string} id  数据目录配置项中的guid
   * @return {*}  {(Record<string, any> | undefined)}
   * @memberof DataCatalogManager
   */
  public getLayerConfigByID(id: string): Record<string, any> | undefined {
    let ret: Record<string, any> | undefined
    this._allLayerConfigItems.forEach((element) => {
      if (element.guid === id) ret = element
    })

    return ret
  }

  /**
   * 根据节点的name获取对应的服务图层配置信息
   * @author Yuanye Ma
   * @date 15/04/2021
   * @param {string} name 数据目录配置项中的name
   * @return {*}  {(Record<string, any> | undefined)}
   * @memberof DataCatalogManager
   */
  public getLayerConfigByName(name: string): Record<string, any> | undefined {
    let ret: Record<string, any> | undefined
    this._allLayerConfigItems.forEach((element) => {
      if (element.name === name) ret = element
    })

    return ret
  }

  /**
   * 根据节点的serverUrl和serverType获取对应的服务图层配置信息
   * @author HeLong
   * @date 04/08/2021
   * @param {string} url 数据目录配置项中的serverURL
   * @param {string} type 数据目录配置项中的serverType(需转化)
   * @return {*}  {(Record<string, any> | undefined)}
   * @memberof DataCatalogManager
   */
  public getLayerConfigByServerUrlAndType(
    url: string,
    type: string
  ): Record<string, any> | undefined {
    let ret: Record<string, any> | undefined
    const serverType = this.convertLayerServiceType(type)
    this._allLayerConfigItems.forEach((element) => {
      if (element.serverURL === url && element.serverType === serverType)
        ret = element
    })
    return ret
  }

  /**
   * 根据节点的serverName和serverType获取对应的服务图层配置信息
   * @author HeLong
   * @date 04/08/2021
   * @param {string} serverName 数据目录配置项中的serverName
   * @param {string} type 数据目录配置项中的serverType(需转化)
   * @return {*}  {(Record<string, any> | undefined)}
   * @memberof DataCatalogManager
   */
  public getLayerConfigByServerNameAndType(
    serverName: string,
    type: string
  ): Record<string, any> | undefined {
    let ret: Record<string, any> | undefined
    const serverType = this.convertLayerServiceType(type)
    this._allLayerConfigItems.forEach((element) => {
      if (
        element.serverName === serverName &&
        element.serverType === serverType
      )
        ret = element
    })
    return ret
  }

  /**
   * 判断添加的数据是否在目录树中已存在
   * @author HeLong
   * @date 11/08/2021
   * @param {object} data 服务添加微件中添加的数据
   * @return {boolean}  {true | false)}
   * @memberof DataCatalogManager
   */
  public hasRepeatedService(data) {
    let isRepeated = false

    if (
      this._allLayerConfigItems.some((item) => {
        const layer = DataCatalogManager.generateLayerByConfig(item)
        return layer.url === data.url
      })
    ) {
      isRepeated = true
    }
    return isRepeated
  }

  /**
   * 获取处理过的数据目录信息
   * 处理包括：
   * 1.格式转换：从一张图vue ant design版本之前的配置转换为新的配置。
   * 2.根据参数决定是否过滤不可用的配置项。过滤功能目前只考虑在基本配置中指定的服务器上发布的IGS服务(即ip和port为空的节点)。
   * 3.对数据目录节点添加级别信息
   *
   * @author Yuanye Ma
   * @date 05/03/2021
   * @memberof DataCatalogManager
   */
  public async getDataCatalogTreeData(isFilterInvalidLayer = false) {
    this.isFilterInvalidLayerConfig = isFilterInvalidLayer
    // 修改说明：优先采用this.config.treeConfig.treeData中的数据目录。如果this.config.treeConfig.treeData不可用,
    // 则看是否配置了treeDataUrl。如果配置了，则从服务请求数据目录。
    // 修改人：马原野 2021年7月28日
    if (
      this.config.treeConfig.treeData == undefined ||
      this.config.treeConfig.treeData.length === 0
    ) {
      if (
        this.config.urlConfig.treeDataUrl &&
        this.config.urlConfig.treeDataUrl !== ''
      ) {
        // 通过服务获取配置
        // 通过服务获取配置,不开启过滤功能。
        this.isFilterInvalidLayerConfig = false

        let res: any
        if (
          this.config.urlConfig.treeDataUrl.includes('https') ||
          this.config.urlConfig.treeDataUrl.includes('http')
        ) {
          const { treeDataUrl } = this.config.urlConfig
          const Authorization = this.getQueryString(
            'Authorization',
            treeDataUrl
          )
          res = await axios.get(
            this.config.urlConfig.treeDataUrl.split('?')[0],
            {
              headers: {
                Authorization,
              },
            }
          )
        } else {
          const protocol = window.location.protocol
          const host = window.location.host
          const url = `${protocol}//${host}${this.config.urlConfig.treeDataUrl}`

          res = await axios.get(url)
        }

        if (res.data.data) {
          this.serviceTreeData = res.data.data
        } else {
          this.serviceTreeData = res.data.treeData
        }
      }
    }

    const defaultIp = baseConfigInstance.config.ip
    const defaultPort = baseConfigInstance.config.port

    if (defaultIp == '' || defaultPort == '') {
      this.isFilterInvalidLayerConfig = false
    }

    if (this.isFilterInvalidLayerConfig) {
      // 1.获取基本配置中指定的服务器上发布的IGS服务列表。
      let tileList: any[] = []
      let docList: any[] = []
      let sceneList: any[] = []

      let tileServiceInfo: any = {}
      let docServiceInfo: any = {}
      const url = `http://${defaultIp}:${defaultPort}/igs/rest/g3d/GetDocList`

      await Promise.race([
        this._timeOut(),
        Promise.all([
          Catalog.DocumentCatalog.getTiles({
            ip: defaultIp,
            port: defaultPort,
          }),
          Catalog.DocumentCatalog.getDocs({
            ip: defaultIp,
            port: defaultPort,
          }),
          axios.get(url),
        ]),
      ])
        .then((resArr: any) => {
          tileServiceInfo = resArr[0]
          docServiceInfo = resArr[1]
          // const url = `http://${defaultIp}:${defaultPort}/igs/rest/g3d/GetDocList`
          // const res = await axios.get(url)
          sceneList = resArr[2].data

          // 对请求回来的结果进行处理:考虑有嵌套的服务列表,应该全部展开后放到一个数组中。
          tileList = this.processServiceInfo(
            tileServiceInfo,
            'HDFNames',
            'DirHDFs'
          )
          docList = this.processServiceInfo(
            docServiceInfo,
            'DOCNames',
            'DirDOCs'
          )

          this.defaultServerList = { tileList, docList, sceneList }
          // 2.格式转换、为节点添加级别信息、判断服务是否可用。
          this.convertConfigData()
        })
        .catch(() => {
          if (
            this.configConverted.treeConfig === undefined ||
            this.configConverted.treeConfig.treeData === undefined
          ) {
            this.convertConfigData()
          }
        })

      // await Catalog.DocumentCatalog.getTiles({
      //   ip: defaultIp,
      //   port: defaultPort
      // })
      //   .then(tiles => {
      //     tileServiceInfo = tiles
      //   })
      //   .catch(err => {})
      // await Catalog.DocumentCatalog.getDocs({
      //   ip: defaultIp,
      //   port: defaultPort
      // })
      //   .then(docs => {
      //     docServiceInfo = docs
      //   })
      //   .catch(err => {})
    } else if (
      this.configConverted.treeConfig === undefined ||
      this.configConverted.treeConfig.treeData === undefined
    ) {
      this.convertConfigData()
    }

    return this.configConverted.treeConfig.treeData
  }

  _timeOut(millisecond = 5000) {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        reject('timeout')
      }, millisecond)
    })
  }

  /**
   * 判断节点是否为服务图层节点
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

  // 云服务目录数据
  private serviceTreeData: any

  // 数据目录管理采用单例模式，不允许外部构造
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

  /**
   * 数据目录配置中记录的地图服务类型,兼容jquery版一张图中的配置
   *
   * @date 10/01/2022
   * @private
   * @memberof DataCatalogManager
   */
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
     * jquery版一张图中使用，特指cesium3dTileset模型缓存类型已废弃。建议使用ModelCache。
     * @type {string}
     */
    TILE3D: 'TILE3D',
    /**
     * CZML
     * @type {string}
     */
    CZML: 'CZML',
    /**
     * GeoJSON
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
    VIDEO: 'VIDEO',

    /**
     * 数据流
     * 10.5.6.10版本中新增，与LayerType的枚举名保持一致。
     * @type {string}
     */
    DataFlow: 'DataFlow',

    /**
     * 模型缓存图层
     * 10.5.6.10版本中新增，与LayerType的枚举名保持一致。
     * 支持cesium3dTileset、m3d等模型缓存类型，可通过配置项中的customParameters，指定具体的格式类型。不指定时，默认为m3d类型。
     * 如：
            "customParameters": [
              {
                "format": "cesium3dTileset"
              }
            ]
     * @type {string}
     */
    ModelCache: 'ModelCache',

    /**
     * IGS的三维场景服务
     * 10.5.6.10版本中新增，与LayerType的枚举名保持一致。
     * @type {string}
     */
    IGSScene: 'IGSScene',
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
      serverURL: this.config.paramConfig.SERVERURL, // 服务URL(可选)
      tokenName: 'tokenName', // token名称(可选),已废弃,请使用customParameters记录该信息
      tokenValue: this.config.paramConfig.TOKEN, // token值(可选),已废弃,请使用customParameters记录该信息
      ip: this.config.paramConfig.SERVERIP, // 服务ip(可选)
      port: this.config.paramConfig.SERVERPORT, // 服务端口(可选)
      bindData: 'bindData', // 绑定数据：与该服务图层相关联的服务信息,比如：与该瓦片服务对应的地图服务。应用中利用该字段可实现对瓦片服务的查询功能
      gdbps: 'gdbps', // 图层的gdbp地址，允许多个图层
      data: 'data', // 非空间数据节点中用于记录数据在ftp服务器上的目录名,
      customParameters: 'customParameters', // 自定义请求参数(可选),类型：数组，以key,value列表的形式记录的服务的额外请求参数。如场景服务的extendedPropKeys等。
    }

    this.configConverted.keyConfig = keyConfig

    // 2.转换iconConfig
    this.configConverted.iconConfig = this.config.iconConfig

    // 3.转换treeConfig
    // 将缓存的图层节点置空
    this._allLayerConfigItems = []
    let treeData: any

    // 修改说明：优先采用this.config.treeConfig.treeData中的配置。
    // 修改人：马原野 2021年7月28日
    if (
      this.config.treeConfig.treeData &&
      this.config.treeConfig.treeData.length > 0
    ) {
      treeData = this.convertTreeData(this.config.treeConfig.treeData, 0)
    } else {
      const treeArr = []
      this.convertCloudToTreeData(this.serviceTreeData, treeArr)
      debugger
      treeData = this.convertTreeData(treeArr, 0)
    }

    const treeConfig: any = {
      isShowIcon: false, // 是否显示基础数据目录节点图标
      // isShowIcon: this.config.paramConfig.SHOWICON, // 是否显示基础数据目录节点图标
      treeData, // 数据目录配置
    }

    this.configConverted.treeConfig = treeConfig
  }

  /**
   * 将云管数据目录转换为一张图的treeData
   */
  private convertCloudToTreeData(serviceTreeData, treeArr) {
    serviceTreeData.forEach((treeData) => {
      const { name, type, children, resource, treeInfo } = treeData
      const treeChildren = []
      if (!resource && (children || treeInfo)) {
        this.convertCloudToTreeData(children || treeInfo, treeChildren)
        treeArr.push({
          label: name,
          describe: type || '',
          children: treeChildren,
        })
      } else if (
        resource &&
        resource.services &&
        resource.services.length > 0
      ) {
        // 存储云管目录树里面  服务列表
        const serverArr: Array<any> = []
        resource.services.forEach((service) => {
          const { protocolTypes, name, proto, ip, port } = service
          // 将同一数据支持多种类型构造成多个子节点
          if (protocolTypes && protocolTypes.length > 1) {
            const cloudLeafNodes: Array<any> = []
            protocolTypes.forEach((protocolType) => {
              const cloudLeaf = {
                label: `${name}-${protocolType}`,
                name,
                protocolTypes: [protocolType],
                proto,
                ip,
                port,
              }
              // 转换成一张图的叶子节点
              const dataCatalogLeaf =
                this.convertTreeDataByProtocolTypes(cloudLeaf)
              if (dataCatalogLeaf) {
                cloudLeafNodes.push(dataCatalogLeaf)
              }
            })
            serverArr.push({
              label: name,
              describe: type || '',
              children: cloudLeafNodes,
            })
          } else {
            // 转换成一张图的叶子节点
            const dataCatalogLeaf = this.convertTreeDataByProtocolTypes(service)
            if (dataCatalogLeaf) {
              serverArr.push(dataCatalogLeaf)
            }
          }
        })
        // 将服务列表存储在 资源目录中，资源目录是可以查看云管元数据的
        treeArr.push({
          label: name,
          describe: type || '',
          metaData: resource.metaData || '',
          children: serverArr,
        })
      }
    })
  }

  /**
   * 通过ProtocolTypes转成一张图数据目录的叶子节点
   * @param service 云管叶子节点
   */
  convertTreeDataByProtocolTypes(service) {
    const {
      label,
      protocolTypes: [cloudDataType],
      name,
      proto,
      ip,
      port,
    } = service
    const commonData = {
      label: label || name,
      describe: label || name,
      ip,
      port,
      name,
      guid: UUID.uuid(),
      searchName: '',
    }
    let leafData
    switch (cloudDataType) {
      case 'IGSRestTile':
        leafData = {
          layerServiceType: this.layerServiceType.IGSTILE,
          token: '',
          serverUrl: '',
          wfsUrl: '',
          extent: '',
        }
        break
      case 'IGSRestScene':
        leafData = {
          layerServiceType: this.layerServiceType.IGSDOC3D,
          model: '',
          serverUrl: '',
        }
        break
      case 'IGSRestMap':
        leafData = {
          layerServiceType: this.layerServiceType.IGSDOC,
          token: '',
          serverUrl: '',
          wfsUrl: '',
          extent: '',
          gdbTypeList: '',
        }
        break
      case 'WMS':
        leafData = {
          layerServiceType: this.layerServiceType.WMS,
          token: '',
          serverUrl: `${proto}://${ip}:${port}/igs/rest/ogc/doc/${name}/WMSServer`,
          wfsUrl: '',
          extent: '',
        }
        break
      case 'WFS':
        break

      case 'IGSRestVectorTile':
        leafData = {
          layerServiceType: this.layerServiceType.VECTORTILE,
          token: '',
          serverUrl: `${proto}://${ip}:${port}/igs/rest/mrcs/vtiles/0/${name}`,
          wfsUrl: '',
          extent: '',
        }
        break

      default:
        break
    }
    if (leafData) {
      return {
        ...commonData,
        ...leafData,
      }
    }
    return undefined
  }

  // 转换数据目录配置信息
  private convertTreeData(nodeArray: any[], nodeLevel: number) {
    const nodeArrayConverted: Array<any> = []
    if (nodeArray && nodeArray.length > 0) {
      nodeArray.forEach((node) => {
        let nodeConverted: any = {}
        let isLayerValid = true

        // 通用信息
        const commonInfo: any = {
          name: node[this.configConverted.keyConfig.name] || '', // 节点名称
          description: node[this.configConverted.keyConfig.description] || '', // 节点描述
          icon: node[this.configConverted.keyConfig.icon] || '', // 节点的图标(可选)
          level: nodeLevel,
        }
        // 如果该节点有元数据信息，则将元数据信息存储起来
        if (node.metaData) {
          commonInfo.metaData = node.metaData
        }

        const guid: string = node[this.configConverted.keyConfig.guid]

        // todo:按设计图层节点的guid应该在服务器端生成,并且保持不变,在后台不支持该功能的情况下先在前端处理。
        // 除图层节点外,其它节点在config中的guid不是必需的，这里生成guid是为满足UI显示的需要。
        if (guid === undefined || guid === '') {
          // 当treedata的guid为空时，随机生成一个guid，同时在这里修改treedata源数据，防止后续重复多次生成guid
          node[this.configConverted.keyConfig.guid] = this.genGUID()
        }

        commonInfo.guid = node[this.configConverted.keyConfig.guid]

        const layerServeiceType = node[this.config.paramConfig.LAYERSERVICETYPE]
        const data = node[this.config.paramConfig.DATA]

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
              node[this.configConverted.keyConfig.serverURL], // 图层的gdbp地址，允许多个图层
            customParameters:
              node[this.configConverted.keyConfig.customParameters] || [], // 服务额外请求参数。
          }

          // 根据layerServiceType计算serverType
          const serverType = this.convertLayerServiceType(layerServeiceType)

          // 修改说明：兼容jquery版TILE3D类型的配置。类型对应于新版配置中的ModelCache类型，需要增加format为cesium3dTileset的参数。
          // 修改人：马原野 2022年01月10日
          if (layerServeiceType === 'TILE3D') {
            serverLayerInfo.customParameters.push({ format: 'cesium3dTileset' })
          }

          serverLayerInfo.serverType = serverType // 服务类型

          // 绑定数据：与该服务图层相关联的服务信息,比如：与该瓦片服务对应的地图服务。应用中利用该字段可实现对瓦片服务的查询功能
          // 老版本的配置中仅支持通过searchName指定与瓦片图层同一服务器上发布的在线地图文档
          const searchName = node[this.config.paramConfig.SEARCHNAME]

          if (searchName && searchName !== '') {
            const bindData: any = { ...serverLayerInfo }
            if (searchName.includes('gdbp')) {
              bindData.gdbps = searchName
              bindData.serverType = LayerType.IGSVector
            } else {
              bindData.serverName = searchName
              if (serverType === LayerType.IGSScene) {
                bindData.serverType = LayerType.IGSScene
              } else {
                bindData.serverType = LayerType.IGSMapImage
              }
            }

            serverLayerInfo.bindData = bindData
          }

          nodeConverted = { ...commonInfo, ...serverLayerInfo }

          // 图层过滤。
          if (this.isFilterInvalidLayerConfig) {
            isLayerValid = this.isServiceVaild(nodeConverted)
          }

          // IGS服务（IGSTile、IGSMapImage、IGSVector）,如果ip和port为空，则采用默认值。
          this.setDefaultConfig(nodeConverted)

          if (isLayerValid) {
            this._allLayerConfigItems.push(nodeConverted)
          }
        } else if (
          node[this.configConverted.keyConfig.description].includes(
            '非空间数据'
          )
        ) {
          /**
           * 修改说明：修改非空间数据的判断
           * 修改人：龚跃健
           * 修改时间：2022/1/24
           */
          // 非空间数据节点
          nodeConverted = { ...commonInfo, data }
        } else {
          nodeConverted = { ...commonInfo }
        }
        if (
          node[this.configConverted.keyConfig.children] &&
          node[this.configConverted.keyConfig.children].length > 0
        ) {
          /**
           * 修改说明：只要存在children，并且children有长度，则需要再次递归
           * 修改人：龚跃健
           * 修改时间：2022/1/24
           */
          nodeConverted.children = this.convertTreeData(
            node[this.configConverted.keyConfig.children],
            nodeLevel + 1
          )
        }

        if (isLayerValid) {
          nodeArrayConverted.push(nodeConverted)
        }
      })
    }

    return nodeArrayConverted
  }

  /**
   * 将layerServiceType中记录的服务类型字符串，转换成serverType类型的枚举。serverType的定义采用LayerType的定义。
   *
   * @date 10/01/2022
   * @private
   * @param {string} layerServiceType
   * @return {*}
   * @memberof DataCatalogManager
   */
  private convertLayerServiceType(layerServiceType: string) {
    let serverType = LayerType.Unknown

    // 1.先处理新增的类型，新增的服务类型直接采用LayerType中的定义。
    serverType = DataCatalogManager.parseLayerType(layerServiceType)

    if (serverType !== LayerType.Unknown) {
      return serverType
    }

    // 2.处理jquery版中定义的服务类型。
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
        serverType = LayerType.ArcGISTile
        break
      case this.layerServiceType.IMAGEARCGIS:
        serverType = LayerType.ArcGISMapImage
        break
      case this.layerServiceType.IGSDOC3D:
      case this.layerServiceType.IGSIMAGE3D:
        serverType = LayerType.IGSScene
        break
      case this.layerServiceType.TILE3D:
        serverType = LayerType.ModelCache
        break
      case this.layerServiceType.POINTCLOUD:
        break
      case this.layerServiceType.VECTORTILE:
        serverType = LayerType.VectorTile
        break
      case this.layerServiceType.TERRAIN:
        break
      case this.layerServiceType.GEOJSON:
        serverType = LayerType.GeoJson
        break
      default:
        break
    }

    return serverType
  }

  // 判断服务是否可用.当前,只有服务类型为IGSDoc、IGSTile,且ip和port为空时,才能支持过滤。
  private isServiceVaild(layerConfig: any) {
    let isServiceVaild = true
    const { ip, port, serverName, serverType, serverURL } = layerConfig
    let serverList: string[] = []

    if (serverURL !== '') {
      return true
    }

    switch (serverType) {
      case LayerType.IGSMapImage:
        serverList = this.defaultServerList.docList
        if (ip === '' && port === '') {
          if (serverList && !serverList.includes(serverName)) {
            isServiceVaild = false
          }
        }
        break
      case LayerType.IGSTile:
        serverList = this.defaultServerList.tileList
        if (ip === '' && port === '') {
          if (serverList && !serverList.includes(serverName)) {
            isServiceVaild = false
          }
        }

        break
      case LayerType.IGSScene:
        serverList = this.defaultServerList.sceneList
        if (ip === '' && port === '') {
          if (serverList && !serverList.includes(serverName)) {
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
    return UUID.uuid()
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
        dirList.forEach((dirItem) => {
          const dirServiceList: [] = dirItem[serviceListKey]
          serviceList = [...serviceList, ...dirServiceList]
        })
      }
    }

    return serviceList
  }

  // IGS服务（IGSTile、IGSMapImage、IGSVector）,如果ip和port为空，则采用默认值。
  private setDefaultConfig(layerConfig: any) {
    const defaultIp = baseConfigInstance.config.ip
    const defaultPort = baseConfigInstance.config.port

    switch (layerConfig.serverType) {
      case LayerType.IGSTile:
      case LayerType.IGSMapImage:
      case LayerType.IGSVector:
        if (layerConfig.ip === '') layerConfig.ip = defaultIp
        if (layerConfig.port === '') layerConfig.port = defaultPort
        break
      default:
        break
    }
  }

  private getQueryString(name, searchString) {
    const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i')

    if (searchString && searchString.split('?').length > 1) {
      // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
      const r = searchString.split('?')[1].match(reg)
      if (r !== null) {
        return decodeURIComponent(r[2])
      }
      return null
    }
  }

  // 数据目录中所有的图层节点列表（转换后的）
  private _allLayerConfigItems: Record<string, any> = []

  // 数据目录中所有的节点列表（转换后的）
  private _allConfigItems: Record<string, any> = []
}

export default DataCatalogManager.getInstance()
