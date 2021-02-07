import * as Zondy from '@mapgis/webclient-es6-service'

import axios from 'axios'
import baseConfigInstance from '../config/base'

class QueryFeatures {
  public systemConfig: any

  // 地图默认站点信息
  private defaultServer = {
    protocol: 'http',
    ip: 'develop.smaryun.com',
    port: '6163',
    guid: '',
    token: '',
    projection: ''
  }

  constructor() {
    this.systemConfig = baseConfigInstance.config || this.defaultServer
  }

  getSystemlibrarieNameByGuid(params) {
    let domain = params.domain || null
    if (!domain) {
      const protocol =
        params.protocol ||
        this.systemConfig.protocol ||
        this.defaultServer.protocol
      const ip = params.ip || this.systemConfig.ip
      const port = params.port || this.systemConfig.port
      domain = `${protocol}://${ip}:${port}`
    }
    let tempParams: Record<string, any> = {}
    tempParams.f = params.f || 'json'
    const tempUrl = `${domain}/igs/rest/mrcs/systemlibraries`
    const promise = new Promise((resolve, reject) => {
      axios.get(tempUrl, { params: tempParams }).then(
        res => {
          const { data } = res
          if (!data) {
            resolve(undefined)
          } else {
            if (data.length < 1) {
              resolve(undefined)
            } else {
              for (let i = 0; i < data.length; i += 1) {
                const guid = data[i].Guid
                if (guid === params.sysLibraryGuid) {
                  resolve(data[i].Name)
                }
              }
            }
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

  getSymbols(params) {
    let domain = params.domain || null
    if (!domain) {
      const protocol =
        params.protocol ||
        this.systemConfig.protocol ||
        this.defaultServer.protocol
      const ip = params.ip || this.systemConfig.ip
      const port = params.port || this.systemConfig.port
      domain = `${protocol}://${ip}:${port}`
    }
    let tempParams: Record<string, any> = {}
    tempParams.type = params.geomType
    tempParams.systemLib = params.systemLibName
    tempParams.page = params.page || 0
    tempParams.size = params.size || 200000
    tempParams.f = params.f || 'json'
    const tempUrl = `${domain}/igs/rest/mrcs/symbols`
    const promise = new Promise((resolve, reject) => {
      axios.get(tempUrl, { params: tempParams }).then(
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

  getColorNo(params) {
    const clrInfo1 = new Zondy.MRCS.ColorInfo({
      ip: params.ip || this.systemConfig.ip,
      port: params.port || this.systemConfig.port
    })
    // if (!Zondy.Catalog) {
    //   clrInfo1 = new Zondy.Service.Catalog.ColorInfo({
    //     ip: params.ip || this.systemConfig.ip,
    //     port: params.port || this.systemConfig.port
    //   })
    // } else {
    //   clrInfo1 = new Zondy.Catalog.ColorInfo({
    //     ip: params.ip || this.systemConfig.ip,
    //     port: params.port || this.systemConfig.port
    //   })
    // }
    const color = params.color
    const promise = new Promise((resolve, reject) => {
      clrInfo1.getColorNO(
        {
          SystemLibID:
            params.sysLibraryGuid === undefined ? 1 : params.sysLibraryGuid,
          Red: parseInt(color.substr(1, 2), 16),
          Green: parseInt(color.substr(3, 2), 16),
          Blue: parseInt(color.substr(5, 2), 16),
          addNew: true
        },
        data => {
          if (data && data.succeed) {
            resolve(data)
          } else {
            resolve(undefined)
          }
        }
      )
    })
    return promise.then(data => {
      return data
    })
  }

  /**
   * 要素修改
   * @param {object} params
   * @param {string} params.gdbp gdbp地址
   * @param {string} params.featureSet featureSet对象
   * @param {string|null} params.ip
   * @param {string|null} params.port
   * @param {boolean|null} params.updateAttribute
   * @param {boolean|null} params.updateGeometry
   * @param {boolean|null} params.updateGeomInfo
   */
  editFeature(params) {
    if (!params || !params.gdbp || !params.featureSet) {
      return
    }
    let tempParams: Record<string, any> = {}
    tempParams.gdbp = params.gdbp
    tempParams.featureSet = params.featureSet
    tempParams.ip = params.ip || this.systemConfig.ip
    tempParams.port = params.port || this.systemConfig.port
    tempParams.guid = params.guid || '__readonly_user__'
    tempParams.updateAttribute =
      params.updateAttribute != undefined ? params.updateAttribute : true
    tempParams.updateGeometry =
      params.updateGeometry != undefined ? params.updateGeometry : true
    tempParams.updateGeomInfo =
      params.updateGeomInfo != undefined ? params.updateGeomInfo : true
    const editService = new Zondy.MRFS.EditLayerFeature(tempParams.gdbp, {
      ip: tempParams.ip,
      port: tempParams.port,
      guid: tempParams.guid,
      updateAttribute: tempParams.updateAttribute,
      updateGeometry: tempParams.updateGeometry
    })
    const promise = new Promise((resolve, reject) => {
      editService.update(tempParams.featureSet, data => {
        if (data) {
          resolve(data)
        } else {
          resolve(undefined)
        }
      })
    })
    return promise.then(data => {
      return data
    })
  }
}

export default new QueryFeatures()
