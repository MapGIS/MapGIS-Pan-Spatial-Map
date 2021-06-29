import * as Zondy from '@mapgis/webclient-es6-service'
import { LoadStatus, LayerType, Layer } from './layer'
import { SpatialReference } from '../spatial-reference'

export class IGSVectorLayer extends Layer {
  /**
   * 网络分析类特有字段，此字段等于Net时为网络分析类
   *
   * @date 24/06/2021
   * @memberof IGSVectorLayer
   */
  geomType = ''

  /**
   * 深度克隆一个IGS在线矢量图层
   *
   * @date 06/04/2021
   * @return {*}  {Layer}
   * @memberof IGSVectorLayer
   */
  clone(): Layer {
    const result = new IGSVectorLayer()

    Object.entries(this).forEach(element => {
      const key = element[0]
      const valueIndex = 1
      result[key] = this._deepClone(element[valueIndex])
    })

    return result
  }

  /**
   * Creates an instance of IGSVectorLayer.
   *
   * @date 22/03/2021
   * @param {Record<string, any>} properties
   * @memberof IGSVectorLayer
   */
  constructor(properties?: Record<string, any>) {
    super(properties)

    this.type = LayerType.IGSVector

    if (!properties) return

    if (properties.url) this.url = properties.url
    if (properties.gdbps) this.gdbps = properties.gdbps
  }

  /**
   * 服务基地址
   * 约定URL格式如下：[protocol]://[ip]:[port]/igs/rest/mrms/layers
   * @date 22/03/2021
   * @memberof IGSVectorLayer
   */
  url = ''

  /**
   * 图层的gdbp地址，允许多个图层
   * 语法：gdbp1,gdbp2,gdbp3
   * 例：gdbps= gdbp://MapGisLocal/示例数据/ds/世界地图/sfcls/海洋陆地, gdbp://MapGisLocal/示例数据/ds/世界地图/sfcls/国界
   *
   * @date 29/03/2021
   * @memberof IGSVectorLayer
   */
  gdbps = ''

  getImageUrl(extent: any, width: number, height: number): string {
    throw new Error('Method not implemented.')
  }

  /**
   * 空间参数信息
   *
   * @date 28/04/2021
   * @memberof IGSVectorLayer
   */
  spatialReference: SpatialReference = new SpatialReference()

  load(): Promise<Layer> {
    // 只有加载状态是没有加载过时，才会真正进行请求。
    if (this.loadStatus !== LoadStatus.notLoaded) {
      return new Promise(resolve => {
        resolve(this)
      }).then(data => {
        return this
      })
    }

    // 1.从URL中解析出ip、port参数
    const parms = this._parseUrl(this.url)

    // 2.获取gdbpUrl参数,默认获取gdbps中第0个图层的信息。
    const gdbpList: string[] = this.gdbps.split(',')
    let gdbp = ''

    if (gdbpList && gdbpList.length > 1) {
      ;[gdbp] = gdbpList
    } else {
      gdbp = this.gdbps
    }

    const promise = new Promise((resolve, reject) => {
      // 3.调用es6service中的接口进行网络请求。
      const vectorLayer = new Zondy.MRCS.VectorLayer(parms)
      this.loadStatus = LoadStatus.loading
      vectorLayer.getLayerInfo(
        gdbp,
        res => {
          if (res && res.Range) {
            // 2.1获取图层全图范围
            this.fullExtent = new Zondy.Common.Rectangle(
              res.Range.xmin,
              res.Range.ymin,
              res.Range.xmax,
              res.Range.ymax
            )
          }

          if (res && res.Type == 22) {
            // 当Type为22 设置geomType为网络类
            this.geomType = 'Net'
          }

          // 2.2获取字段名称、类型

          this.loadStatus = LoadStatus.loaded
          resolve(this)
        },
        failInfo => {
          this.loadStatus = LoadStatus.failed
          reject(failInfo)
        }
      )
    })

    return promise.then(data => {
      return this
    })
  }

  /**
   * url解析,提取对应的ip、port
   * 约定URL格式如下：[protocol]://[ip]:[port]/igs/rest/mrms/map/layers
   *
   * @date 23/03/2021
   * @private
   * @param {*} url
   * @return {*}  {{ ip; port;}}
   * @memberof IGSTileLayer
   */
  _parseUrl(url): { ip; port } {
    const ipReg = '/://[a-zA-Z0-9]+:*/g'
    const portReg = '/:+[0-9]+//g'

    const ips = url.match(/:\/\/[a-zA-Z0-9.]+:*/g)
    const ports = url.match(/:+[0-9]+\//g)

    const matchIp = ips ? ips[0] : '://localhost'
    const matchPort = ports ? ports[0] : ':6163'

    let ip = ''
    let port = ''
    if (matchIp && matchIp.length > 3) {
      ip = matchIp.slice(3, matchIp.length - 1)
    }
    if (matchPort && matchPort.length > 2) {
      port = matchPort.slice(1, matchPort.length - 1)
    }

    return { ip, port }
  }
}
