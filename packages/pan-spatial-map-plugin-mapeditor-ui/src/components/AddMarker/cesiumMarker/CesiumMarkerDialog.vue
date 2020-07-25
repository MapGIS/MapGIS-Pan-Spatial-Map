<template>
  <div class="cesium-marker">
    <mp-widget-panel
      :offset="dialogOffset"
      :width="dialogWidth"
      :height="dialogHeight"
      title="标注"
      :visible.sync="showMarkerDialog"
      :absolute="true"
    >
      <marker-info
        style="margin:5px"
        :markerInfo="marker"
        @delete="interactCancel(marker)"
      ></marker-info>
    </mp-widget-panel>
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
import { MapDocumentMixin } from '@mapgis/pan-spatial-map-store'
import MarkerInfo from '../MarkerInfo.vue'
import cesiumMarkerMixin from './cesiumMarkerMixin'
import markerBlue from '../../../assets/images/markerBlue.png'

/**
 * cesium标注，弹出框使用全局的弹出框（OmDialog）
 */
@Component({
  components: {
    MarkerInfo
  }
})
export default class CesiumMarkerDialog extends Mixins(
  MapDocumentMixin,
  cesiumMarkerMixin
) {
  @Provide()
  get webGlobe() {
    return this.map
  }

  @Provide()
  get Cesium() {
    return this.mapLib
  }

  @Prop({ type: Object, required: true }) marker!: Record<string, any>

  // 当前显示弹出框的标注id
  @Prop({ type: String, required: true }) currentMarkerId!: string

  private deleteCount = 0

  @Emit('delete')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitDelete(deleteCount: number) {}

  @Emit('markerId')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitId(id: string) {}

  private prePopup: any = undefined

  private markerFeatures: any[] = []

  private onMapLoad(map: any) {}

  private defaultImg = markerBlue

  private showMarkerDialog = false

  private dialogOffset = [0, 0]

  private dialogWidth = 200

  private dialogHeight = 300

  @Watch('currentMarkerId', { deep: true })
  hindDialog() {
    // 当当前显示弹出框的标注与组件内的id不一致时，隐藏弹出框
    if (this.currentMarkerId !== this.marker.id) {
      this.showMarkerDialog = false
    }
  }

  get edit() {
    return this.marker.edit
  }

  @Watch('edit', { deep: true })
  changeDialogSize() {
    console.log(this.edit)
    if (this.edit) {
      this.dialogWidth = 250
      this.dialogHeight = 280
    } else {
      this.dialogWidth = 150
      this.dialogHeight = 150
    }
  }

  get img() {
    return this.marker.img
  }

  @Watch('img', { deep: true }) // 更换图片，更换地图上的标注
  changeImg() {
    this.cesiumUtil.removeEntityByName(this.marker.id)
    this.upDateMarker()
  }

  onMapLoad(map: any) {
    if (map.crs) {
      return
    }
    this.cesiumUtil.setCesiumGlobe(this.Cesium, this.webGlobe)
    this.upDateMarker()
  }

  mounted() {
    if (this.Cesium) {
      this.cesiumUtil.setCesiumGlobe(this.Cesium, this.webGlobe)
      this.upDateMarker()
    }
  }

  beforeDestroy() {
    this.removeAllPolygonLine() // 删除线、区
    this.cesiumUtil.removeEntityByName(this.marker.id)
  }

  upDateMarker() {
    const marker: any = { ...this.marker }
    marker.mouseOver = event => {
      this.mouseOver(event, marker)
    }
    marker.mouseOut = () => {
      this.mouseOut()
    }
    marker.name = marker.id
    this.cesiumUtil.addMarkerByFeature(marker)
  }

  mouseOver(event: any, marker: any) {
    // console.log(event, options)
    this.showMarkerDialog = true
    this.emitId(this.marker.id)
    this.dialogOffset = [event.endPosition.x, event.endPosition.y]
    this.removeAllPolygonLine() // 删除线、区
    if (marker.type === 'LineString') {
      this.appendLine(marker.coordinates)
    } else if (marker.type === 'Polygon') {
      this.appendPolygon(marker.coordinates[0])
    }
  }

  mouseOut() {
    // console.log(event)
    // this.showMarkerDialog = false
  }

  getPopupPosition() {
    if (!this.marker) {
      return {}
    }
    const { center } = this.marker
    const position = {
      longitude: Number(center[0]),
      latitude: Number(center[1])
    }
    return position
  }

  interactCancel() {
    this.deleteCount += 1
    this.emitDelete(this.deleteCount)
  }
}
</script>

<style></style>
