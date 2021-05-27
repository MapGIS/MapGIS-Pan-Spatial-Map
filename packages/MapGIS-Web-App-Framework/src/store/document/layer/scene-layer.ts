import { LoadStatus, LayerType, Layer } from './layer'
import { SpatialReference } from '../spatial-reference'
import { Layer3D } from './3d-layer'

/**
 * 三维场景服务图层
 *
 * @date 20/05/2021
 * @export
 * @class SceneLayer
 * @extends {Layer}
 */
export abstract class SceneLayer extends Layer3D {
  /**
   * Creates an instance of SceneLayer.
   * @date 24/05/2021
   * @param {Record<string, any>} [properties]
   * @memberof SceneLayer
   */
  constructor(properties?: Record<string, any>) {
    super(properties)

    this.type = LayerType.scene

    if (!properties) return

    if (properties.url) this.url = properties.url
  }

  /**
   * 基地址
   *
   * @date 20/05/2021
   * @memberof SceneLayer
   */
  url = ''
}
