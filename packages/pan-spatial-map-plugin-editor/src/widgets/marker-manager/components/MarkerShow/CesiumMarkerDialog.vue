<template>
  <div class="cesium-marker-dialog-wrapper">
    <mp-window-wrapper :visible="showMarkerDialog">
      <template v-slot:default="slotProps">
        <mp-window
          title="标注"
          :width="240"
          :height="180"
          :visible.sync="showMarkerDialog"
          :anchor="'top-left'"
          :shrinkAction="false"
          :fullScreenAction="false"
          :horizontalOffset="dialogOffset[0]"
          :verticalOffset="dialogOffset[1]"
          v-bind="slotProps"
        >
          <marker-info :markerInfo="marker"></marker-info>
        </mp-window>
      </template>
    </mp-window-wrapper>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Mixins,
  Provide,
  Prop,
  Watch,
  Emit
} from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import { baseConfigInstance, eventBus } from '@mapgis/pan-spatial-map-store'
import MarkerInfo from '../MarkerInfo/MarkerInfo.vue'
import CesiumMarkerMixin from '../../mixins/cesium-marker'
import markerBlue from '../../../../../../pan-spatial-map-framework/public/cesium/Widgets/Images/ImageryProviders/blueMarble.png'

@Component({
  components: {
    MarkerInfo
  }
})
export default class CesiumMarkerDialog extends Mixins(
  WidgetMixin,
  CesiumMarkerMixin
) {
  // 当前标注点
  @Prop({ type: Object, required: true }) marker!: Record<string, any>

  // 当前显示弹出框的标注点id
  @Prop({ type: String, required: true }) currentMarkerId!: string

  // 添加三维标注时默认图标的宽
  private defaultIconWidth = 24

  private defaultIconHeight = 24

  // 标注信息窗口的显隐
  private showMarkerDialog = false

  // 标注信息窗口的偏移
  private dialogOffset = [0, 0]

  @Emit('currentMarkerId')
  emitId(id: string) {}

  // 当该标注点的icon变化时，重新渲染三维视图下的标注点
  @Watch('marker.iconImg')
  markerSelectedChange() {
    this.updateMarker()
  }

  // 只显示当前鼠标悬浮在其上的标注点的信息窗口，其余标注点的信息窗口都隐藏
  @Watch('currentMarkerId', { deep: true })
  currentMarkerChange() {
    if (this.currentMarkerId !== this.marker.id) {
      this.showMarkerDialog = false
    }
  }

  @Watch('showMarkerDialog')
  showMarkerDialogChange(newVal) {
    if (newVal) {
      this.setDialogPosition()
      this.webGlobe.viewer.scene.camera.changed.addEventListener(() => {
        this.setDialogPosition()
      })
      this.webGlobe.viewer.scene.camera.moveStart.addEventListener(() => {
        this.setDialogPosition()
      })
      this.webGlobe.viewer.scene.camera.moveEnd.addEventListener(() => {
        this.setDialogPosition()
      })
    } else {
      this.removeAllPolygonLine() // 删除线、区
      this.webGlobe.viewer.scene.camera.changed.removeEventListener()
      this.webGlobe.viewer.scene.camera.moveStart.removeEventListener()
      this.webGlobe.viewer.scene.camera.moveEnd.removeEventListener()
    }
  }

  created() {
    // 监听渲染器切换事件，切换回二维时，隐藏三维标注点的信息窗口
    eventBus.$on('emitMapRenderChange', () => {
      this.showMarkerDialog = false
    })
    if (this.Cesium) {
      this.cesiumUtil.setCesiumGlobe(this.Cesium, this.webGlobe)
      this.updateMarker()
      this.setDialogPosition()
    }
  }

  beforeDestroy() {
    this.removeAllPolygonLine() // 删除线、区
    this.cesiumUtil.removeEntityByName(this.marker.id)
    this.webGlobe.viewer.scene.camera.changed.removeEventListener()
    this.webGlobe.viewer.scene.camera.moveStart.removeEventListener()
    this.webGlobe.viewer.scene.camera.moveEnd.removeEventListener()
  }

  // 设置标注信息框的偏移位置
  setDialogPosition() {
    if (this.showMarkerDialog) {
      const { center } = this.marker
      const position = this.Cesium.Cartesian3.fromDegrees(
        Number(center[0]),
        Number(center[1])
      )
      // cartesianToCanvasCoordinates 转换三维空间坐标到canvas坐标（窗口坐标）
      const canvasPosition = this.webGlobe.viewer.scene.cartesianToCanvasCoordinates(
        position,
        new this.Cesium.Cartesian2()
      )
      this.dialogOffset = [canvasPosition.x, canvasPosition.y]
    }
  }

  // 渲染该标注点
  updateMarker() {
    this.cesiumUtil.removeEntityByName(this.marker.id)
    const marker: any = { ...this.marker }
    marker.mouseOver = event => {
      this.mouseOver(event, marker)
    }
    marker.name = marker.id
    marker.img = markerBlue
    marker.iconWidth = this.defaultIconWidth
    marker.iconHeight = this.defaultIconHeight
    this.cesiumUtil.addMarkerByFeature(marker)
  }

  // 鼠标悬浮在标注点上时回调事件
  mouseOver(event: any, marker: any) {
    // 修订鼠标在标注图标中移动时，弹出窗口跟随移动、图形反复添加删除的问题。
    if (this.showMarkerDialog === false) {
      this.showMarkerDialog = true
      // 通知其他标注点隐藏其信息窗口
      this.emitId(this.marker.id)
      // 删除线、区
      this.removeAllPolygonLine()
      if (marker.type === 'LineString') {
        this.appendLine(marker.coordinates)
      } else if (marker.type === 'Polygon') {
        this.appendPolygon(marker.coordinates[0])
      }
    }
  }
}
</script>
<style lang="less" scoped></style>
