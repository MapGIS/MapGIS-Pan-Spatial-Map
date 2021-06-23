<template>
  <mapgis-draw
    ref="drawer"
    :styles="drawStyle"
    :controls="controls"
    @added="onAdded"
    @drawCreate="onDrawFinish"
  />
</template>

<script>
import {
  getGeoJsonFeatureCenter,
  getGeoJsonFeatureBound
} from '../../../model/feature'
import DrawMixin from './mixins/draw'
import DrawStyle from '../../styles/draw-style'

export default {
  name: 'MpDrawPro',
  mixins: [DrawMixin],
  data() {
    return {
      // 绘制组件
      drawer: null,
      controls: {
        point: false,
        line_string: false,
        polygon: false,
        trash: false,
        combine_features: false,
        uncombine_features: false
      },
      // 绘制样式
      drawStyle: []
    }
  },
  mounted() {
    this.drawStyle = DrawStyle
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
    // draw-circle: 画圆
    openDraw(mode) {
      // 使能渲染（如果没有开启会开启绘制工具）
      this.enableDraw()
      // 保存当前绘制模式
      this.drawMode = mode
      // 设置绘制模式到绘制工具中
      this.setDrawMode(mode)
      // 发送绘制开始的事件
      this.emitDrawStart()
    },
    // 关闭绘制工具
    closeDraw() {
      if (
        this.drawer &&
        [
          'draw_point',
          'draw_line_string',
          'draw_polygon',
          'draw_rectangle',
          'draw_circle'
        ].includes(this.drawer.getMode())
      ) {
        if (this.drawer) {
          this.drawer.deleteAll()
          this.drawer.changeMode('simple_select')
        }
      }
    },
    // 绘制工具已经准备好
    onAdded(e) {
      const { drawer } = e
      this.drawer = drawer
    },
    // 绘制结果拿到后
    onDrawFinish(e) {
      // 规范化结果，然后发送完成事件
      const { features } = e
      const feature = features[0]
      const center = getGeoJsonFeatureCenter(feature)
      const { coordinates } = feature.geometry

      let shape

      switch (this.drawMode) {
        case 'draw-point':
          shape = {
            x: coordinates[0],
            y: coordinates[1]
          }
          break
        case 'draw-polyline':
          shape = coordinates.map(coordinate => {
            return {
              x: coordinate[0],
              y: coordinate[1]
            }
          })
          break
        case 'draw-polygon':
          shape = coordinates[0].map(coordinate => {
            return {
              x: coordinate[0],
              y: coordinate[1]
            }
          })
          break
        case 'draw-circle':
        case 'draw-rectangle':
          const { xmin, ymin, xmax, ymax } = getGeoJsonFeatureBound(feature)
          shape = {
            xmin,
            ymin,
            xmax,
            ymax
          }
          break
        default:
          break
      }

      this.emitDrawFineshed({ mode: this.drawMode, feature, shape, center })
      this.closeDraw()
    },
    // 使能绘制
    enableDraw() {
      const drawComponent = this.$refs.drawer
      if (drawComponent) {
        drawComponent.enableDrawer()
      }
    },
    // 根据当前激活类型来选择对应的绘制类型
    setDrawMode(mode) {
      switch (mode) {
        case 'draw-point':
          this.drawer?.changeMode('draw_point')
          break
        case 'draw-polyline':
          this.drawer?.changeMode('draw_line_string')
          break
        case 'draw-polygon':
          this.drawer?.changeMode('draw_polygon')
          break
        case 'draw-rectangle':
          this.drawer?.changeMode('draw_rectangle')
          break
        case 'draw-circle':
          this.drawer?.changeMode('draw_circle')
          break
        default:
          break
      }
    }
  }
}
</script>
