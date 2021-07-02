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
  Unknown,

  /**
   * 组图层
   */
  Group,

  /**
   * 瓦片服务图层
   */
  Tile,

  /**
   * 地图服务图层
   */
  MapImage,

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
   * ArcGIS瓦片服务图层
   */
  ArcGISTile,

  /**
   * ArcGIS地图服务图层
   */
  ArcGISMapImage,

  /**
   * 矢量瓦片图层
   */
  VectorTile,

  /**
   * 互联网服务图层
   */
  WebTile,

  /**
   * 自定义瓦片服务图层
   */
  CustomTile,

  /**
   * 自定义地图服务图层
   */
  CustomMapImageLayer,

  /**
   * 高德电子地图
   */
  AMapMercatorEMap,

  /**
   * 高德卫星影像图层
   */
  AMapMercatorSatelliteMap,

  /**
   * 高德卫星影像图注记图层
   */
  AMapMercatorSatelliteAnnMap,

  /**
   * 三维模型缓存图层,用于显示三维模型缓存。如：m3d(中地定义的模型缓存格式)，osgb(osgb格式的倾斜摄影模型)、3dTileset(cesium标准的模型缓存)
   */
  ModelCache,

  /**
   * IGS三维模型缓存图层,用于显示IGS发布的m3d格式的三维模型缓存。
   */
  IGSModelCache,

  /**
   * 高程图层，用于接入地形服务
   */
  Elevation,

  /**
   * IGS高程图层，用于接入IGS三维服务中的地形服务
   */
  IGSElevation,

  /**
   *IGS场景图层,用于对接IGS的三维场景服务
   */
  Scene,

  /**
   *IGS场景图层,用于对接IGS的三维场景服务
   */
  IGSScene,

  /**
   * 覆盖物(临时绘制)图层
   *
   */
  Graphics
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

    if (properties.fullExtent)
      this.fullExtent = ObjectTool.deepClone(properties.fullExtent)
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
  get fullExtent(): Rectangle {
    return this._fullExtent
  }

  set fullExtent(rect: Rectangle) {
    this._fullExtent = rect
  }

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
  type: LayerType = LayerType.Unknown

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

  protected _fullExtent = new Rectangle(0.0, 0.0, 0.0, 0.0)
}
