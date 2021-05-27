import { LoadStatus, LayerType, Layer } from './layer'
import { SpatialReference } from '../spatial-reference'
import { Rectangle, Point2D } from '@mapgis/webclient-es6-service/common'

/**
 * 三维包围盒
 *
 * @date 25/05/2021
 * @export
 * @class Rectangle3D
 * @extends {Rectangle}
 */
export class Rectangle3D extends Rectangle {
  /**
   * Creates an instance of Rectangle3D.
   * @date 25/05/2021
   * @param {*} xmin
   * @param {*} ymin
   * @param {*} xmax
   * @param {*} ymax
   * @param {*} zmin
   * @param {*} zmax
   * @param {*} option
   * @memberof Rectangle3D
   */
  constructor(xmin, ymin, zmin, xmax, ymax, zmax, option?) {
    super(xmin, ymin, xmax, ymax, option)

    this.zmin = zmin
    this.zmax = zmax
  }

  /**
   * z最小值
   *
   * @date 25/05/2021
   * @memberof Rectangle3D
   */
  zmin = 0.0

  /**
   * z最大值
   *
   * @date 25/05/2021
   * @memberof Rectangle3D
   */
  zmax = 0.0
}

/**
 * 三维点
 *
 * @date 25/05/2021
 * @export
 * @class Point3D
 * @extends {Point2D}
 */
export class Point3D extends Point2D {
  /**
   * Creates an instance of Point3D.
   * @date 25/05/2021
   * @param {*} x
   * @param {*} y
   * @param {*} z
   * @param {*} [option]
   * @memberof Point3D
   */
  constructor(x, y, z, option?) {
    super(x, y, option)

    this.z = z
  }

  z = 0.0
}

/**
 * 用于表示一个矩形的宽、高
 *
 * @date 25/05/2021
 * @export
 * @class Size
 */
export class Size {
  constructor(width, height) {
    this.width = width
    this.height = height
  }

  /**
   * 宽度
   *
   * @date 25/05/2021
   * @memberof Size
   */
  width = 0.0

  /**
   * 高度
   *
   * @date 25/05/2021
   * @memberof Size
   */
  height = 0.0
}

/**
 * 三维图层抽像类
 *
 * @date 25/05/2021
 * @export
 * @abstract
 * @class Layer3D
 * @extends {Layer}
 */
export abstract class Layer3D extends Layer {
  /**
   * 全图范围
   *
   * @author Yuanye Ma
   * @date 12/03/2021
   * @type {Rectangle}
   * @memberof Layer
   */
  get fullExtent(): Rectangle3D {
    return this._fullExtent
  }

  set fullExtent(rect: Rectangle3D) {
    this._fullExtent = rect
  }
}
