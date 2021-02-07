import axios from 'axios'
import { defaultServer } from './query-default-server'

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

class QueryIGSMetaData {
  public metadata = {}

  constructor() {}

  public getMetadta(option: MetadataQueryParam) {
    if (!option) {
      return null
    }
    const name = option.gdbp || option.docName + (option.layerIdxs || '')
    if (this.metadata[name]) {
      return this.metadata[name]
    }
    let domain = option.domain || null
    if (!domain) {
      const protocol = option.protocol || defaultServer.protocol
      const ip = option.ip || defaultServer.ip
      const port = option.port || defaultServer.port
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
    // eslint-disable-next-line @typescript-eslint/no-this-alias
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
}

export default new QueryIGSMetaData()
