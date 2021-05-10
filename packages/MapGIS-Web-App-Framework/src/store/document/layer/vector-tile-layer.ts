import * as Zondy from '@mapgis/webclient-es6-service'
import { LoadStatus, LayerType, Layer } from './layer'
import axios from 'axios'

export class VectorTileLayer extends Layer {
  /**
   * Creates an instance of VectorTileLayer.
   * @date 10/05/2021
   * @param {Record<string, any>} [properties]
   * @memberof VectorTileLayer
   */
  constructor(properties?: Record<string, any>) {
    super(properties)

    this.type = LayerType.vectorTile

    if (!properties) return

    if (properties.url) this.url = properties.url
  }

  /**
   * 服务基地址
   * 约定URL格式如下：http://develop.smaryun.com:6163/igs/rest/mrms/vtiles/styles/街道-墨卡托.json,http://develop.smaryun.com:6163/igs/rest/mrms/vtiles/styles/蓝色-墨卡托.json"
   * 指向矢量瓦片图层所对应的style的URL。可同时设置多个style，中间用','号分隔。
   * @date 22/03/2021
   * @memberof VectorTileLayer
   */
  url = ''

  /**
   * 当前采用样式
   *
   * @date 10/05/2021
   * @type {(Record<string, any> | undefined)}
   * @memberof VectorTileLayer
   */
  currentStyle: Record<string, any> | undefined

  /**
   * 图层支持的样式列表
   *
   * @date 10/05/2021
   * @type {Record<string, any>[]}
   * @memberof VectorTileLayer
   */
  styleList: Record<string, any>[] = []

  load(): Promise<Layer> {
    // 只有加载状态是没有加载过时，才会真正进行请求。
    if (this.loadStatus !== LoadStatus.notLoaded) {
      return new Promise(resolve => {
        resolve(this)
      }).then(data => {
        return this
      })
    }

    // 1.获取url中的style地址列表。
    const styleUrlList: string[] = this.url.split(',')

    const promise = new Promise((resolve, reject) => {
      this.loadStatus = LoadStatus.loading
      styleUrlList.forEach((styleUrl, index) => {
        axios.get(styleUrl).then(
          res => {
            const { data } = res
            this.styleList.push(data)

            if (index === styleUrlList.length - 1) {
              this.loadStatus = LoadStatus.loaded

              if (this.styleList.length > 0)
                this.currentStyle = this.styleList[0]
            }
          },
          error => {
            this.loadStatus = LoadStatus.failed
            reject(error)
          }
        )
      })
    })
  }

  /**
   * 深度克隆一个矢量瓦片图层
   *
   * @date 10/05/2021
   * @return {*}  {Layer}
   * @memberof VectorTileLayer
   */
  clone(): Layer {
    const result = new VectorTileLayer()

    Object.entries(this).forEach(element => {
      const key = element[0]
      const valueIndex = 1
      result[key] = this._deepClone(element[valueIndex])
    })

    return result
  }
}
