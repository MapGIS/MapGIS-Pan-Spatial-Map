import { Layer } from './layer'
import { GroupLayer } from './group-layer'
import { ObjectTool } from '../utils/object-tool'

/**
 * 地图类
 *
 * @date 06/04/2021
 * @export
 * @class Map
 */
export class Map {
  /**
   * 图层列表
   *
   * @date 06/04/2021
   * @type {Layer[]}
   * @memberof Map
   */
  layers(): Layer[] {
    return this._rootLayer.layers
  }

  /**
   * 所有图层,包括组图层的子图层
   *
   * @date 06/04/2021
   * @readonly
   * @type {Layer[]}
   * @memberof Map
   */
  get allLayers(): Layer[] {
    return this._rootLayer.allLayers
  }

  /**
   * 根据图层ID查找对应图层
   *
   * @date 06/04/2021
   * @return {*}  {Layer}
   * @memberof GroupLayer
   */
  findLayerById(layerID: string): Layer | undefined {
    return this._rootLayer.findLayerById(layerID)
  }

  /**
   * 在指定索引前添加图层
   *
   * @date 07/04/2021
   * @param {Layer} layer       待添加的图层
   * @param {number} [index]    可选参数，默认添加到最后。
   * @return {*}  {Map}         地图
   * @memberof Map
   */
  add(layer: Layer, index?: number): Map {
    this._rootLayer.add(layer, index)
    return this
  }

  /**
   * 从图层列表中删除指定的图层
   *
   * @date 06/04/2021
   * @param {Layer} layer   待删除的图层
   * @return {*}  {Layer}   从图层列表中删除的图层
   * @memberof Map          地图
   */
  remove(layer: Layer): Layer | undefined {
    return this._rootLayer.remove(layer)
  }

  /**
   * 删除所有子图层
   *
   * @date 06/04/2021
   * @return {*}  {Layer[]} 删除的子图层
   * @memberof Map          地图
   */
  removeAll(): Layer[] {
    return this._rootLayer.removeAll()
  }

  /**
   * 获取叶子节点图层（不包含GroupLayer的图层）
   *
   * @date 07/04/2021
   * @return {*}  {Layer[]} 叶子节点图层列表
   * @memberof Map          图层
   */
  getFlatLayers(): Layer[] {
    return this._rootLayer.getFlatLayers()
  }

  /**
   * 创建一个深度克隆的Map
   *
   * @date 06/04/2021
   * @return {*}  {Map}
   * @memberof Map
   */
  clone(): Map {
    const result = new Map()

    Object.entries(this).forEach(element => {
      const key = element[0]
      const valueIndex = 1
      if (key === '_rootLayer') {
        const layer = element[valueIndex]
        const layerCopy: GroupLayer = layer.clone()
        result[key] = layerCopy
      } else {
        result[key] = ObjectTool.deepClone(element[valueIndex])
      }
    })

    return result
  }

  private _rootLayer: GroupLayer = new GroupLayer()
}
