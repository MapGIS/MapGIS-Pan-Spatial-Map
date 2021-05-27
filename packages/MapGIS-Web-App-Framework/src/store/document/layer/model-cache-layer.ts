import { LoadStatus, LayerType, Layer } from './layer'
import { SpatialReference } from '../spatial-reference'
import { Layer3D } from './3d-layer'

/**
 * 三维模型缓存格式
 *
 * 目录形式的模型缓存服务图层
 *
 * @date 20/05/2021
 * @export
 * @enum {number}
 */
export enum ModelCacheFormat {
  /**
   * 中地m3d格式
   */
  m3d,

  /**
   * cesium 3D Tileset
   */
  cesium3dTileset,

  /**
   * osg格式
   */
  osgb
}

/**
 * 三维模型缓存图层
 *
 * @date 20/05/2021
 * @export
 * @class ModelCacheLayer
 * @extends {Layer}
 */
export class ModelCacheLayer extends Layer3D {
  /**
   * 模型缓存格式
   *
   * @date 20/05/2021
   * @type {ModelCacheFormat}
   * @memberof ModelCacheLayer
   */
  format: ModelCacheFormat = ModelCacheFormat.m3d

  /**
   * 缓存基地址
   *
   * @date 20/05/2021
   * @memberof ModelCacheLayer
   */
  url = ''

  load(): Promise<Layer> {
    return new Promise(resolve => {
      this.loadStatus = LoadStatus.loaded
      resolve(this)
    }).then(data => {
      return this
    })
  }

  clone(): Layer {
    const result = new ModelCacheLayer()

    Object.entries(this).forEach(element => {
      const key = element[0]
      const valueIndex = 1
      result[key] = this._deepClone(element[valueIndex])
    })

    return result
  }
}
