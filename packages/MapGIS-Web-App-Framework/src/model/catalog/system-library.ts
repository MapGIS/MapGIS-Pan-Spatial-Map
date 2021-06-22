import * as Zondy from '@mapgis/webclient-es6-service'
import axios from 'axios'

export default class SystemLibraryCatalog {
  public static getSystemLibraryNameByGuid(params) {
    let domain = params.domain || null
    if (!domain) {
      const protocol = params.protocol
      const ip = params.ip
      const port = params.port
      domain = `${protocol}://${ip}:${port}`
    }
    const tempParams: Record<string, any> = {}
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

  public static getSymbols(params) {
    let domain = params.domain || null
    if (!domain) {
      const protocol = params.protocol
      const ip = params.ip
      const port = params.port
      domain = `${protocol}://${ip}:${port}`
    }
    const tempParams: Record<string, any> = {}
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

  public static getColorNo(params) {
    const clrInfo1 = new Zondy.MRCS.ColorInfo({
      ip: params.ip,
      port: params.port
    })
    // if (!Zondy.Catalog) {
    //   clrInfo1 = new Zondy.Service.Catalog.ColorInfo({
    //     ip: params.ip,
    //     port: params.port
    //   })
    // } else {
    //   clrInfo1 = new Zondy.Catalog.ColorInfo({
    //     ip: params.ip,
    //     port: params.port
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
}
