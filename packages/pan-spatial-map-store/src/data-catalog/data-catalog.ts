import axios from 'axios'
import QueryOGCInfo from '../service/query-ogc-info'
import systemConfigInstance, { SystemConfig } from '../config/system'
import dataCatalogConfigIntance, {
  DataCatalogConfig
} from '../config/data-catalog'

export class DataCatalog {
  /**
   * igs发布的地图文档名称集合
   */
  private docList: string[] = []

  /**
   * igs发布的瓦片名称集合
   */
  private tileList: string[] = []

  /**
   * 目录树参数对象
   * @enum {string}
   * @type {Object}
   */
  public readonly nodeParam = {
    /**
     * 子节点
     */
    CHILDREN: 'children',
    /**
     * 目录树显示名称
     */
    NAME: 'label',
    /**
     * 标题
     */
    TITLE: 'describe',
    /**
     * 服务名
     */
    SERVERNAME: 'name',
    /**
     * 三位模式
     */
    SCENEMODEL: 'sceneModel',
    /**
     * 服务ip
     */
    SERVERIP: 'ip',
    /**
     * 服务port
     */
    SERVERPORT: 'port',
    /**
     * 范围
     */
    EXTENT: 'extent',
    /**
     * 服务地址
     */
    SERVERURL: 'serverUrl',
    /**
     * 服务绑定数据
     */
    BINDDATALIST: 'bindDataList',
    /**
     * 服务类型
     */
    LAYERSERVICETYPE: 'layerServiceType',
    /**
     * OGCWFS服务地址
     */
    WFSURL: 'wfsUrl',
    /**
     * token
     */
    TOKEN: 'token',
    /**
     * guid
     */
    GUID: 'guid',
    /**
     * 查询服务名
     */
    SEARCHNAME: 'searchName',
    /**
     * 父节点
     */
    PARENT: 'parent',
    /**
     * 过滤字段
     */
    TIP: 'tip',
    /**
     * 索引号
     */
    LAYERINDEX: 'layerIndex',
    /**
     * 状态
     */
    STATUS: 'status',
    /**
     * 其他信息
     */
    DATA: 'data',
    /**
     * 是否展现图标
     */
    SHOWICON: 'true'
  }

  /**
   * 地图服务类型
   * @constant
   * @enum {string}
   * @type {object}
   */
  public readonly layerServiceType = {
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

  private configTreeData = []

  public baseTreeData = undefined

  public checkedLayers

  private _checkedLayerIds: string[] = []

  private static _instance: DataCatalog

  private constructor() {
    this.configTreeData = []
  }

  public static getInstance() {
    if (!this._instance) {
      this._instance = new DataCatalog()
    }
    return this._instance
  }

  public async init() {
    await DataCatalogConfig.loadConfig()
    this.configTreeData = dataCatalogConfigIntance.config.treeConfig.treeData
  }

  /**
   * 获取目录树数据
   * @param refresh 是否刷新目录树
   */
  public async getBaseTreeData(refresh?: boolean) {
    if (!this.baseTreeData || refresh) {
      await SystemConfig.loadConfig()
      const defaultIp = systemConfigInstance.config.ip
      const defaultPort = systemConfigInstance.config.port
      const fun1 = this.getIgsMapList('docs', defaultIp, defaultPort)
      const fun2 = this.getIgsMapList('tiles', defaultIp, defaultPort)
      await Promise.all([fun1, fun2])
        .then(result => {
          ;[this.docList, this.tileList] = result
        })
        .catch(error => {
          console.warn(error)
        })
      this.baseTreeData = this.formatBaseTreeData(this.configTreeData, 0)
    }
    return this.baseTreeData
  }

  /**
   * 递归给每一级加id,level,title
   * @param treeData
   * @param k
   */
  private formatBaseTreeData(treeData: any[], k: number, parentTitle?: string) {
    const data: any = []
    for (let i = 0; i < treeData.length; i += 1) {
      data[i] = { ...treeData[i] }
      if (!data[i].id) {
        data[i].id = this.newGuid()
      }
      data[i].title =
        (parentTitle ? `${parentTitle} ` : '') + data[i][this.nodeParam.NAME]
      data[i].level = k
      if (treeData[i][this.nodeParam.CHILDREN]) {
        let str = ''
        if (k > 0) {
          str = data[i].title
        }
        data[i].children = this.formatBaseTreeData(
          treeData[i].children,
          k + 1,
          str
        )
      } else {
        data[i].label = treeData[i][this.nodeParam.NAME]
        data[i].serverName = treeData[i][this.nodeParam.SERVERNAME]
        data[i].sceneModel = treeData[i][this.nodeParam.SCENEMODEL]
        data[i].extent = treeData[i][this.nodeParam.EXTENT]
        data[i].serverUrl = treeData[i][this.nodeParam.SERVERURL]
        data[i].bindDataList = treeData[i][this.nodeParam.BINDDATALIST]
        data[i].layerServiceType = treeData[i][this.nodeParam.LAYERSERVICETYPE]
        data[i].wfsUrl = treeData[i][this.nodeParam.WFSURL]
        data[i].token = treeData[i][this.nodeParam.TOKEN]
        data[i].guid = treeData[i][this.nodeParam.GUID]
        data[i].searchName = treeData[i][this.nodeParam.SEARCHNAME]
        data[i].layerIndex = treeData[i][this.nodeParam.LAYERINDEX]
        const layerServiceType = treeData[i][this.nodeParam.LAYERSERVICETYPE]
        if (layerServiceType === this.layerServiceType.IGSVECTOR) {
          data[i].gdbps = treeData[i][this.nodeParam.SERVERNAME]
        }
        const ip = treeData[i][this.nodeParam.SERVERIP]
        const port = treeData[i][this.nodeParam.SERVERPORT]
        if (!ip || ip === '' || !port || port === '') {
          data[i].ip = systemConfigInstance.config.ip
          data[i].port = systemConfigInstance.config.port
          if (
            layerServiceType === this.layerServiceType.IGSDOC ||
            layerServiceType === this.layerServiceType.IGSTILE
          ) {
            let mapList: string[] = []
            if (layerServiceType === this.layerServiceType.IGSDOC) {
              mapList = this.docList
            } else if (layerServiceType === this.layerServiceType.IGSTILE) {
              mapList = this.tileList
            }
            if (!mapList.includes(data[i].serverName)) {
              data[i].disabled = true
            }
          }
        }
      }
    }
    return data
  }

  /**
   * 根据id获取数据,获取的是末级节点数据
   * @param id
   */
  public getLayerInfoById(id: string) {
    const layerInfo = this.getCheckedData([id], this.baseTreeData)[0]
    return layerInfo
  }

  public get checkedLayerIds() {
    return this._checkedLayerIds
  }

  public set checkedLayerIds(ids: string[]) {
    this._checkedLayerIds = ids
  }

  public getCheckedLayers() {
    return this.getCheckedData(this._checkedLayerIds, this.baseTreeData)
  }

  /**
   * 获取选中的图层,获取的是末级节点数据集合
   * @param ids 选中节点id集合
   */
  public async getLayersByIds(ids: Array<string>) {
    this.checkedLayers = this.getCheckedData(ids, this.baseTreeData)
    const tempLayers: any[] = []
    let obj: any = {}
    for (let i = 0; i < this.checkedLayers.length; i += 1) {
      const layer = this.checkedLayers[i]
      const layerServiceType = layer[this.nodeParam.LAYERSERVICETYPE]
      const tempUrl: string = layer[this.nodeParam.SERVERURL]
      if (layerServiceType === this.layerServiceType.WMS) {
        // eslint-disable-next-line no-await-in-loop
        const wmsInfo = await QueryOGCInfo.getWMSInfo(tempUrl)
        let wmsInfoObj = {}
        if (wmsInfo) {
          const { layers, version, bounds, wmsServerType } = wmsInfo
          wmsInfoObj = {
            layers,
            version,
            bounds,
            wmsServerType
          }
        }
        obj = {
          type: 'RasterTile',
          subtype: 'IgsWmsLayer',
          ...wmsInfoObj
        }
      } else if (layerServiceType === this.layerServiceType.WMTS) {
        // eslint-disable-next-line no-await-in-loop
        const wmtsInfo = await QueryOGCInfo.getWMTSInfo(tempUrl)
        let wmtsInfoObj = {}
        if (wmtsInfo) {
          const {
            tilematrixSet,
            tilematrixIds,
            pro,
            scaleDenominator,
            bounds,
            url,
            origin
            // eslint-disable-next-line no-await-in-loop
          } = await QueryOGCInfo.getWMTSInfo(tempUrl)
          wmtsInfoObj = {
            tilematrixSet,
            tilematrixIds,
            pro,
            scaleDenominator,
            bounds,
            url,
            origin
          }
        }
        obj = {
          type: 'RasterTile',
          subtype: 'IgsWmtsLayer',
          ...wmtsInfoObj
        }
      } else if (layerServiceType === this.layerServiceType.IGSDOC) {
        obj = {
          type: 'RasterTile',
          subtype: 'IgsDocLayer'
        }
      } else if (layerServiceType === this.layerServiceType.IGSTILE) {
        obj = {
          type: 'RasterTile',
          subtype: 'IgsTileLayer'
        }
      } else if (layerServiceType === this.layerServiceType.IGSVECTOR) {
        obj = {
          type: 'RasterTile',
          subtype: 'IgsVectorLayer',
          gdbps: layer[this.nodeParam.SERVERNAME]
        }
      }
      const tempLayer = { ...layer, ...obj }
      tempLayers.push(tempLayer)
    }
    return tempLayers
  }

  /**
   * 找出两个图层数组中不同的图层
   * @param ticked
   * @param oldTicked
   */
  public getTickedDiff(ticked: string[], oldTicked: string[]) {
    return ticked
      .concat(oldTicked)
      .filter((currentValue: string, index: number, arr: string[]) => {
        return arr.indexOf(currentValue) === arr.lastIndexOf(currentValue)
      })
  }

  /**
   * 递归获取最后一级选中的数据
   * @param ids
   * @param treeData
   */
  private getCheckedData(ids: Array<string>, treeData: any) {
    let data: any = []
    for (let i = 0; i < treeData.length; i += 1) {
      if (!treeData[i].children) {
        if (ids.includes(treeData[i].id)) {
          data.push(treeData[i])
        }
      } else {
        const checkedData: any = this.getCheckedData(ids, treeData[i].children)
        data = [...data, ...checkedData]
      }
    }
    return data
  }

  /**
   * 生成一个新的guid
   */
  public newGuid() {
    let guid = ''
    for (let i = 1; i <= 32; i += 1) {
      const n = Math.floor(Math.random() * 16.0).toString(16)
      guid += n
      if (i === 8 || i === 12 || i === 16 || i === 20) guid += '-'
    }
    return guid
  }

  /**
   * 请求igs已发布地图文档和瓦片的列表
   * @param type 地图文档（docs）|瓦片（tiles）
   * @param ip
   * @param port
   * @param domain 服务域名
   * @param protocol 网络协议
   */
  public getIgsMapList(
    type: string,
    ip?: string,
    port?: string,
    domain?: string,
    protocol?: string
  ) {
    let tempDomain = domain || null
    if (!domain) {
      const tempProtocol = protocol || 'http'
      const tempIp = ip || systemConfigInstance.config.ip
      const tempPort = port || systemConfigInstance.config.port
      tempDomain = `${tempProtocol}://${tempIp}:${tempPort}`
    }
    const url = `${tempDomain}/igs/rest/mrcs/${type}?f=json&v=2`
    const promise = new Promise<string[]>(resolve => {
      axios.get(url).then(
        res => {
          const { data } = res
          if (!data) {
            resolve([])
          } else {
            let dataNodeLabel: string[] = []
            if (type === 'docs') {
              dataNodeLabel = ['DOCNames', 'DirDOCs']
            } else if (type === 'tiles') {
              dataNodeLabel = ['HDFNames', 'DirHDFs']
            }
            let names: string[] = []
            if (data[dataNodeLabel[0]]) {
              names = [...data[dataNodeLabel[0]]]
            }
            if (data[dataNodeLabel[1]] && data[dataNodeLabel[1]].length > 0) {
              for (let i = 0; i < data[dataNodeLabel[1]].length; i += 1) {
                if (data[dataNodeLabel[1]][i][dataNodeLabel[0]]) {
                  names = [
                    ...names,
                    ...data[dataNodeLabel[1]][i][dataNodeLabel[0]]
                  ]
                }
              }
            }
            resolve(names)
          }
        },
        error => {
          console.warn(error)
          resolve([])
        }
      )
    })
    return promise.then(data => {
      return data
    })
  }
}

export default DataCatalog.getInstance()
