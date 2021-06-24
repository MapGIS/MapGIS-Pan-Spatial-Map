<template>
  <mapgis-3d-draw @load="onAdded" @drawcreate="onDrawFinish" />
</template>

<script lang="ts">
import { UUID } from '../../../model/utils'
import { getGeoJSONFeatureCenter } from '../../../model/feature'
import DrawMixin from './mixins/draw'

export default {
  name: 'Mp3dDrawPro',
  mixins: [DrawMixin],
  inject: ['webGlobe'],
  data() {
    return {
      // 绘制组件
      drawer: null
    }
  },
  beforeDestroy() {
    this.drawer = null
  },
  methods: {
    // 打开绘制工具
    // draw-point: 画点
    // draw-polyline: 画线
    // draw-polygon: 画区
    // draw-rectangle: 画矩形
    openDraw(mode) {
      // 保存当前绘制模式
      this.drawMode = mode
      // 设置绘制模式到绘制工具中
      this.setDrawMode(mode)
      // 发送绘制开始的事件
      this.emitDrawStart()
    },
    // 关闭绘制工具
    closeDraw() {
      this.drawer?.getDrawElement(this.webGlobe).stopDrawing()
      this.drawer?.removeEntities()
    },
    // 绘制工具已经准备好
    onAdded(drawer) {
      this.drawer = drawer
    },
    // 绘制结果拿到后
    onDrawFinish(cartesian3, lnglat) {
      // 规范化结果，然后发送完成事件
      let geometry
      let coordinates
      let shape

      switch (this.drawMode) {
        case 'draw-point':
          // lnglat表示为[lng, lat, alt]
          geometry = {
            coordinates: [lnglat[0], lnglat[1]],
            type: 'Point'
          }
          shape = {
            x: lnglat[0],
            y: lnglat[1],
            z: lnglat[2]
          }
          break
        case 'draw-polyline':
          // lnglat表示为[[lng, lat, alt], [lng, lat, alt], ... ]
          coordinates = lnglat.map(coord => {
            return [coord[0], coord[1]]
          })
          geometry = {
            coordinates,
            type: 'LineString'
          }
          shape = lnglat.map(coord => {
            return {
              x: coord[0],
              y: coord[1],
              z: coord[2]
            }
          })
          break
        case 'draw-polygon':
          // lnglat表示为[[lng, lat, alt], [lng, lat, alt], ... ]
          coordinates = lnglat.map(coord => {
            return [coord[0], coord[1]]
          })
          geometry = {
            coordinates: [coordinates],
            type: 'Polygon'
          }
          shape = lnglat.map(coord => {
            return {
              x: coord[0],
              y: coord[1],
              z: coord[2]
            }
          })
          break
        case 'draw-rectangle':
          // lnglat表示为[[lng, lat, alt], [lng, lat, alt]]
          // 构造5个点形成多边形
          // lnglat由2个点构成
          const xmin = lnglat[0][0] < lnglat[1][0] ? lnglat[0][0] : lnglat[1][0]
          const ymin = lnglat[0][1] < lnglat[1][1] ? lnglat[0][1] : lnglat[1][1]
          const zmin = lnglat[0][2] < lnglat[1][2] ? lnglat[0][2] : lnglat[1][2]
          const xmax = lnglat[1][0] > lnglat[0][0] ? lnglat[1][0] : lnglat[0][0]
          const ymax = lnglat[1][1] > lnglat[0][1] ? lnglat[1][1] : lnglat[0][1]
          const zmax = lnglat[1][2] > lnglat[0][2] ? lnglat[1][2] : lnglat[0][2]
          geometry = {
            coordinates: [
              [xmin, ymin],
              [xmax, ymin],
              [xmax, ymax],
              [xmin, ymax],
              [xmin, ymin]
            ],
            type: 'Polygon'
          }
          shape = {
            xmin,
            ymin,
            zmin,
            xmax,
            ymax,
            zmax
          }
          break
        default:
          break
      }
      const feature = {
        geometry,
        properties: {},
        type: 'Feature'
      }
      const center = getGeoJSONFeatureCenter(feature)

      this.emitDrawFineshed({ mode: this.drawMode, feature, shape, center })
      this.closeDraw()
    },
    // 根据当前激活类型来选择对应的绘制类型
    setDrawMode(mode) {
      switch (mode) {
        case 'draw-point':
          this.drawer?.enableDrawPoint()
          break
        case 'draw-polyline':
          this.drawer?.enableDrawLine()
          break
        case 'draw-polygon':
          this.drawer?.enableDrawPolygon()
          break
        case 'draw-rectangle':
          this.drawer?.enableDrawRectangle()
          break
        default:
          break
      }
    }
  }
}
</script>
