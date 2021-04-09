import { Map } from './map'
import { ObjectTool } from '../utils/object-tool'
/**
 * 地图文档
 *
 * @date 06/04/2021
 * @export
 * @class Document
 */
export class Document {
  /**
   * 地图列表
   *
   * @date 06/04/2021
   * @type {Map []}
   * @memberof Document
   */
  maps: Map[] = []

  /**
   * 获取默认地图.
   * 默认地图为地图列表中的第0个。
   *
   * @date 06/04/2021
   * @readonly
   * @type {(Map | undefined)}
   * @memberof Document
   */
  get defaultMap(): Map | undefined {
    if (this.maps.length === 0) {
      this.maps.push(new Map())
    }
    return this.maps[0]
  }

  /**
   * 创建一个深度克隆的Map
   *
   * @date 06/04/2021
   * @return {*}  {Map}
   * @memberof Map
   */
  clone(): Document {
    const result = new Document()

    Object.entries(this).forEach(element => {
      const key = element[0]
      const valueIndex = 1
      if (key === 'maps') {
        const maps = element[valueIndex]
        const mapsCopy: Map[] = []
        let mapCopy: Map | undefined

        maps.forEach(map => {
          mapCopy = map.clone()
          if (mapCopy) mapsCopy.push(mapCopy)
        })

        result[key] = mapsCopy
      } else {
        result[key] = ObjectTool.deepClone(element[valueIndex])
      }
    })

    return result
  }
}
