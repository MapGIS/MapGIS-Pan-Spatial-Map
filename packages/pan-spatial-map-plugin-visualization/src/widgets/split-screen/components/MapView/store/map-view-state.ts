import { CommonUtil } from '@mapgis/web-app-framework'
import { Rectangle } from '@mapgis/webclient-es6-service/common/Rectangle'

export enum OperationType {
  UNKNOWN = 'UNKNOWN',
  MAPDRAG = 'MAPDRAG', // 二维拖拽
  CESIUMDRAG = 'CESIUMDRAG', // 三维拖拽
  QUERY = 'QUERY', // 查询按钮
  ZOOMIN = 'ZOOMIN', // 放大按钮
  ZOOMOUT = 'ZOOMOUT', // 缩小按钮
  RESTORE = 'RESTORE', // 重置按钮
  CLEAR = 'CLEAR' // 清除按钮
}

/**
 * 地图视图状态类.记录地图的ID、显示范围信息
 */
export class MapViewState {
  _activeId = '' // 地图视图的ID

  _queryGeometry = null // 地图视图绘制的几何范围

  _activeBound = new Rectangle(0.0, 0.0, 0.0, 0.0) // 当前活动的地图经纬度范围

  _activeOperationType: keyof typeof OperationType = OperationType.UNKNOWN // 激活来源

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
