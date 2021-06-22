import * as Zondy from '@mapgis/webclient-es6-service'

import axios from 'axios'

export default class AttributeStatistic {
  /** *
   * igs属性统计接口
   * options 属性统计条件
   */
  public static statisticField(options: any) {
    // 统计查询
    const { layerType } = options
    const baseUrl = `http://${options.ip}:${options.port}/onemap/`
    let queryOption
    let url
    if (layerType === 'doc') {
      // 文档图层查询
      queryOption = {
        docName: options.docName,
        layerIdxs: options.layerIdxs,
        field: options.field,
        type: options.type ? options.type : '1,2', // 1最大值，2最小值，7去重返回
        where: options.where ? options.where : ''
      }
      url = `${baseUrl}docs/${queryOption.docName}/0/*/statisticalField?layerIdxs=${queryOption.layerIdxs}&where=${queryOption.where}&field=${queryOption.field}&type=${queryOption.type}&f=json`
    } else if (layerType === 'layer') {
      // 图层查询
      queryOption = {
        gdbp: options.gdbp,
        field: options.field,
        type: options.type ? options.type : '1,2',
        where: options.where ? options.where : ''
      }
      url = `${baseUrl}layer/statisticalField?gdbp=${queryOption.gdbp}&where=${queryOption.where}&field=${queryOption.field}&type=${queryOption.type}&f=json`
    }
    const promise = new Promise(resolve => {
      axios({
        url,
        method: 'get'
      })
        .then(res => {
          if (!res.data || res.data.length <= 0) {
            resolve(null)
          } else {
            resolve(res.data)
          }
        })
        .catch(function(error) {})
    })
    return promise.then(res => {
      return res
    })
  }

  /** *
   * dataStore属性统计接口,以及获取属性字段，当options里没有statisticFields，就是获取属性字段
   * options 属性统计条件
   */
  public static statisticFieldByDS(options: any) {
    const tableData = options.tableArr
    const type = tableData[0]
    const libName = tableData[1]
    let queryOptions
    let func
    if (type === 'pg') {
      const schemas = tableData[2]
      const tableName = tableData[3]
      queryOptions = {
        libName,
        schemas,
        tableName,
        pageSize: options.pageSize || 1,
        pageNo: options.pageNo || 1,
        includeProperites: true
      }
      func = Zondy.DataStore.PGQueryStats
    } else if (type === 'es') {
      const tableName = tableData[2]
      queryOptions = {
        libName, // 'sp_taxibj_200_2';
        tableName, // 'sptype';
        pageSize: options.pageSize || 1,
        pageNo: options.pageNo || 1,
        includeProperites: true
      }
      func = Zondy.DataStore.ESQueryStats
    }
    if (options.statisticFields) {
      queryOptions.statisticFields = options.statisticFields
    }
    if (options.fields) {
      queryOptions.fields = options.fields
    }
    const promise = new Promise(resolve => {
      func(options.ip, options.port, queryOptions, res => {
        if (!res || !res.features || res.features.length <= 0) {
          resolve(null)
        } else {
          resolve(res)
        }
      })
    })
    return promise.then(res => {
      return res
    })
  }
}
