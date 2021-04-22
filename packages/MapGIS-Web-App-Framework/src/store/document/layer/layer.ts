import { Rectangle } from '@mapgis/webclient-es6-service/common/Rectangle'
import { ObjectTool } from '../../utils/object-tool'
/**
 * 图层加载状态
 *
 * @author Yuanye Ma
 * @date 19/03/2021
 * @enum {number}
 */
export enum LoadStatus {
  /**
   * 没有加载过
   */
  notLoaded,

  /**
   * 正在加载
   */
  loading,

  /**
   *  加载成功
   */
  loaded,

  /**
   * 加载失败
   */
  failed
}

/**
 * 图层的类型
 *
 * @date 19/03/2021
 * @enum {number}
 */
export enum LayerType {
  /**
   * 未知
   */
  unknown,

  /**
   * 组图层
   */
  group,

  /**
   * 瓦片服务图层
   */
  tile,

  /**
   * 地图服务图层
   */
  mapImage,

  /**
   * IGServer瓦片服务图层
   */
  IGSTile,

  /**
   * IGServer地图服务图层
   */
  IGSMapImage,

  /**
   * IGServer矢量服务图层
   */
  IGSVector,

  /**
   * OGCWMTS服务图层
   */
  OGCWMTS,

  /**
   * OGCWMS服务图层
   */
  OGCWMS,

  /**
   * arcGIS瓦片服务图层
   */
  arcGISTile,

  /**
   * arcGIS地图服务图层
   */
  arcGISMapImage,

  /**
   * 矢量瓦片图层
   */
  vectorTile,

  /**
   * 互联网服务图层
   */
  webTile,

  /**
   * 自定义瓦片服务图层
   */
  customTile,

  /**
   * 自定义地图服务图层
   */
  customMapImageLayer,

  /**
   * 覆盖物(临时绘制)图层
   *
   */
  graphics
}

/**
 * 图层
 *
 * @author Yuanye Ma
 * @date 12/03/2021
 * @export
 * @class Layer
 */
export abstract class Layer {
  /**
   * Creates an instance of Layer.
   * @date 22/04/2021
   * @param {Record<string, any>} [properties]
   * @memberof Layer
   */
  protected constructor(properties?: Record<string, any>) {
    if (!properties) return

    if (properties.description) this.description = properties.description

    if (properties.id) this.id = properties.id

    if (properties.loadStatus) this.loadStatus = properties.loadStatus

    if (properties.opacity) this.opacity = properties.opacity

    if (properties.title) this.title = properties.title

    if (properties.type) this.type = properties.type

    if (properties.isVisible) this.isVisible = properties.isVisible
  }

  /**
   * 图层描述
   *
   * @date 22/04/2021
   * @memberof Layer
   */
  description = ''

  /**
   * 全图范围
   *
   * @author Yuanye Ma
   * @date 12/03/2021
   * @type {Rectangle}
   * @memberof Layer
   */
  fullExtent: Rectangle = new Rectangle(0.0, 0.0, 0.0, 0.0)

  /**
   * 图层唯一id
   *
   * @author Yuanye Ma
   * @date 12/03/2021
   * @type {string}
   * @memberof Layer
   */
  id = ''

  /**
   * 图层加载状态
   *
   * @date 19/03/2021
   * @type {LoadStatus}
   * @memberof Layer
   */
  loadStatus: LoadStatus = LoadStatus.notLoaded

  /**
   * 不透明度
   * 范围：0——1,0:完全透明，1：完全不透明
   * 默认值:1.
   *
   * @date 19/03/2021
   * @memberof Layer
   */
  opacity = 1

  /**
   * 图层标题
   * 图层在图层列表或图例中显示的名称
   *
   *
   * @date 19/03/2021
   * @memberof Layer
   */
  title = ''

  /**
   * 图层类型
   *
   * @date 19/03/2021
   * @type {LayerType}
   * @memberof Layer
   */
  type: LayerType = LayerType.unknown

  /**
   * 是否可见
   *
   * @date 19/03/2021
   * @memberof Layer
   */
  isVisible = true

  //   /**
  //    * 取消加载
  //    *
  //    * @date 19/03/2021
  //    * @abstract
  //    * @memberof Layer
  //    */
  //   abstract cancelLoad()

  /**
   * 加载
   *
   * @date 19/03/2021
   * @abstract
   * @memberof Layer
   */
  abstract load(): Promise<Layer>

  /**
   * 创建一个深度克隆的Layer
   *
   * @date 02/04/2021
   * @return {*}  {Layer}
   * @memberof Layer
   */
  abstract clone(): Layer

  // 定义一个深拷贝函数  接收目标target参数
  protected _deepClone(target): any {
    return ObjectTool.deepClone(target)
  }

  /**
   * 根据URL创建对应的图层
   *
   * @date 19/03/2021
   * @return {*}  {Promise<Layer>}
   * @memberof Layer
   */
  //   fromIGServerUrl(): Promise<Layer> {
  //     new Promise(resolve => {
  //       setTimeout(() => {
  //         resolve(new Layer())
  //       }, 2000)
  //     }).then(val => {
  //       console.log(val)
  //       return val
  //     })
  //   }
}
