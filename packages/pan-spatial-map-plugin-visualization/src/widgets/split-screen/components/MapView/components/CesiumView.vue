<template>
  <div class="cesium-view">
    <!-- 三维地图组件 -->
    <mp-web-scene-pro
      @map-load="onMapLoad"
      :document="document"
      :vue-key="vueKey"
      :height="height"
    />
    <template v-if="isMapLoaded">
      <!-- 多屏联动组件 -->
      <mapgis-3d-link
        @change="onLinkChange"
        :vue-key="vueKey"
        :enable="isMapLoaded"
        :interval="30"
        :excludes="['default']"
      />
      <!-- 绘制组件 -->
      <mp-3d-draw-pro
        ref="draw3d"
        @finished="onDrawFinished"
        :vue-key="vueKey"
      />
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Inject, Watch } from 'vue-property-decorator'
import {
  Document,
  Layer,
  Rectangle3D,
  Objects,
  UUID
} from '@mapgis/web-app-framework'

@Component
export default class CesiumView extends Vue {
  @Inject('Cesium') Cesium: unknown

  @Inject('vueCesium') vueCesium: unknown

  @Prop() readonly vueKey!: string

  @Prop() readonly document!: Document

  @Prop({ default: () => ({}) }) readonly layer!: Layer

  @Prop({ default: 500 }) readonly height!: number

  isMapLoaded = false

  get drawComponent() {
    return this.$refs.draw3d
  }

  beforeDestroy() {
    this.isMapLoaded = false
  }

  /**
   * 供父组件调用
   * @param {string} [mode = 'draw-polygon'] 参考Mp3dDrawPro组件内定义的mode类型
   */
  openDraw(mode = 'draw-polygon') {
    this.drawComponent.openDraw(mode)
  }

  /**
   * 供父组件调用
   */
  closeDraw() {
    this.drawComponent.closeDraw()
  }

  /**
   * 获取二维经纬度范围
   * @param {}
   * @return
   */
  getRect({ xmin, ymin, xmax, ymax }) {
    return Objects.GeometryExp.creatRectByMinMax(xmin, ymin, xmax, ymax)
  }

  /**
   * 三维坐标集合转二维经纬度范围
   */
  toRect2D(shape) {
    const [{ x: x1, y: y1 }, { x: x2, y: y2 }] = shape
    const xmin = x1 < x2 ? x1 : x2
    const ymin = y1 < y2 ? y1 : y2
    const xmax = x2 > x1 ? x2 : x1
    const ymax = y2 > y1 ? y2 : y1
    return this.getRect({ xmin, ymin, xmax, ymax })
  }

  /**
   * 获取三维范围
   * @param {array} 几何坐标集合
   * @param {unknown}
   */
  toRect3D(shape, transform) {
    const positions = shape.map(item => {
      const { x, y, z } = this.sceneController.globelPositionToLocalPosition(
        item,
        transform
      )
      return {
        x,
        y,
        z: item.z
      }
    })
    let xmin = 0
    let ymin = 0
    let zmin = 0
    let xmax = 0
    let ymax = 0
    let zmax = 0
    positions.forEach(({ x, y, z }, index) => {
      if (index === 0) {
        xmin = x
        ymin = y
        zmin = z
        xmax = x
        ymax = y
        zmax = z
      } else {
        xmin = xmin - x < 0 ? xmin : x
        ymin = ymin - y < 0 ? ymin : y
        zmin = zmin - z < 0 ? zmin : z
        xmax = xmax - x > 0 ? xmax : x
        ymax = ymax - y > 0 ? ymax : y
        zmax = zmax - z > 0 ? zmax : z
      }
    })
    return {
      xmin,
      ymin,
      xmax,
      ymax,
      zmin,
      zmax
    }
  }

  /**
   * 获取几何范围
   * @param {array} 几何坐标集合
   */
  getGeometry(shape) {
    const { sublayers } = this.layer.activeScene || {}
    if (sublayers) {
      const source = this.sceneController.findSource(
        sublayers.find(({ visible }) => !!visible).id
      )
      if (source) {
        const { xmin, ymin, xmax, ymax, zmin, zmax } = this.toRect3D(
          shape,
          source.root.transform
        )
        return new Rectangle3D(xmin, ymin, zmin, xmax, ymax, zmax)
      }
    }
  }

  /**
   * 绘制完成的回调
   */
  onDrawFinished({ mode, feature, shape, center }) {
    if (this.isMapLoaded) {
      let payload: unknown
      switch (mode) {
        case 'draw-polygon': {
          const geometry = this.getGeometry(shape)
          const rect = this.toRect2D(shape)
          payload = {
            geometry,
            rect
          }
          break
        }
        case 'draw-rectangle': {
          const rect = this.getRect(shape)
          payload = {
            geometry: rect,
            rect
          }
          break
        }
        default:
          break
      }
      this.$emit('draw-finished', payload)
    }
  }

  /**
   * 联动组件change
   */
  onLinkChange({ '3d': view3d, '2d': rect2d }) {
    console.log(`${this.vueKey}-link-changed`, { ...rect2d })
    this.$emit('link-changed', rect2d)
  }

  /**
   * 地图加载成功回调
   * @param {object}
   */
  onMapLoad(payload) {
    this.vueCesium.getViewerByInterval(viewer => {
      this.sceneController = Objects.SceneController.getInstance(
        this.Cesium,
        this.vueCesium,
        viewer
      )
      this.isMapLoaded = true
      this.$emit('load', viewer, this.sceneController)
    }, this.vueKey)
  }
}
</script>
<style lang="less" scoped>
.cesium-view {
  flex: 1;
  overflow: hidden;
}
</style>
