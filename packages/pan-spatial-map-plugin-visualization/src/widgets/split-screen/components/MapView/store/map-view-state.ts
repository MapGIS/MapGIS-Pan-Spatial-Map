import { CommonUtil } from '@mapgis/web-app-framework'
import { Rectangle } from '@mapgis/webclient-es6-service/common/Rectangle'

/**
 * 地图视图状态类.记录地图的ID、显示范围信息
 */
export class MapViewState {
  _activeId = '' // 地图视图的ID

  _queryGeometry = null // 地图视图绘制的几何范围

  _activeBound = new Rectangle(0.0, 0.0, 0.0, 0.0) // 当前活动的地图经纬度范围

  _active3dBound = null // 当前活动的三维地图视图范围

  /**
   * 判断矩形范围是否可用
   * @param {object} Rectangle
   */
  isValidRect(rect: Rectangle) {
    if (!CommonUtil.isEmpty(rect)) {
      const boundKeys = ['xmin', 'xmax', 'ymin', 'ymax']
      const hasBoundKeys = boundKeys.every(v => v in rect)
      return hasBoundKeys && rect.xmin <= rect.xmax && rect.ymin <= rect.ymax
    }
    return !0
  }
}

const mapViewStateInstance: MapViewState = new MapViewState()

export default mapViewStateInstance
