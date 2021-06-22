import axios from 'axios'

export interface MetadataQueryParam {
  protocol?: string // 网络协议
  ip?: string // 服务ip
  port?: string // 服务port
  domain?: string // 域名
  gdbp?: string
  f?: string
  mode?: string
  encryptPassword?: string
  docName?: string
  mapIndex?: number
  tree?: boolean
  layerIdxs?: string
  guid?: string
  tileName?: string
  globe?: string
}

export interface LayerList {
  名称: string
  URL: string
  图层类型: string
  是否可用: string
  参考系ID: string
  参考系名称: string
  状态: string
  符号比例: number
  排序权值: number
  原始范围: string
  投影范围: string
  子图层: LayerList[]
}

export interface LayerTable {
  Description: string
  IsProjTrans: boolean
  LayerCount: number
  MapName: string
  MaxScale: number
  MinScale: number
  ProjTrans: string
  ProjTransName: string
  Range: string
  SymbolScale: number
  图层列表: LayerList[]
}

export interface Metadata {
  名称?: string // 网络协议
  磁盘路径?: string // 服务ip
  是否启用?: string // 服务port
  发布日期?: string // 域名
  发布作者?: string
  发布IP?: string
  描述信息?: string
  范围?: string
  是否支持动态投影?: string
  动态裁图?: string
  地图列表?: LayerTable[]
}

export default class MetaDataQuery {
  public static metadata = {}

  public static query(option: MetadataQueryParam) {
    if (!option) {
      return null
    }
    const name = option.gdbp || option.docName + (option.layerIdxs || '')
    if (this.metadata[name]) {
      return this.metadata[name]
    }
    let domain = option.domain || null
    if (!domain) {
      const protocol = option.protocol
      const ip = option.ip
      const port = option.port
      domain = `${protocol}://${ip}:${port}`
    }
    const queryParam: Record<string, unknown> = {}
    queryParam.f = option.f || 'json'
    queryParam.mode = option.mode || 'All'
    let url = `${domain}/onemap/metadata/`
    if (option.gdbp) {
      queryParam.gdbp = option.gdbp
      queryParam.encryptPassword = option.encryptPassword
      url += 'layer/query'
    } else if (option.docName) {
      const { docName } = option
      queryParam.dataService = option.docName
      queryParam.tree = option.tree || 'true'
      queryParam.guid = option.guid || '__readonly_user__'
      if (!option.layerIdxs) {
        if (option.globe) {
          url = `${url}g3d/doc/${docName}`
        } else {
          url = `${url}doc/${docName}`
        }
      } else {
        queryParam.layerIdxs = option.layerIdxs
        const mapIndex = option.mapIndex || 0
        url = `${url}doc/${docName}/${mapIndex}`
      }
    } else if (option.tileName) {
      url = `${url}tile/${option.tileName}`
    }
    const self = this
    const promise = new Promise<Metadata>((resolve, reject) => {
      axios.get(url, { params: queryParam }).then(
        res => {
          const { data } = res
          if (!data) {
            resolve(undefined)
          } else {
            self.metadata[name] = data
            resolve(data)
          }
        },
        error => {
          reject(error)
        }
      )
    })
    return promise.then(data => {
      return data
    })
  }

  /**
   * 获取矢量地图或瓦片数据信息
   * @param {Object} param
   * @param {string} param.ip 服务器IP
   * @param {Number} param.port 服务端口
   * @param {string} param.name 服务名
   */
  public static getMapServiceInfo({ ip, port, name }) {
    const url = `http://${ip}:${port}/igs/rest/mrms/info/${name}?guid=`
    const promise = new Promise((resolve, reject) => {
      axios.get(url).then(
        res => {
          const { data } = res
          if (!data) {
            resolve(undefined)
          } else {
            resolve(data)
          }
        },
        error => {
          reject(error)
        }
      )
    })
    return promise.then(data => {
      return data
    })
  }
}
