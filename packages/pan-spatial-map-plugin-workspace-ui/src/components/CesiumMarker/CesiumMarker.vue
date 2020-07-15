<template>
  <div class="cesium-marker">
    <div v-if="fieldNames.length > 0">
      <cesium-popup
        :position="{
          longitude: popupPosition.longitude,
          latitude: popupPosition.latitude
        }"
        :container="''"
        :showed.sync="showPopup"
      >
        <div slot="default">
          <div style="max-height:10em;overflow:auto">
            <div
              v-for="(child, n) in getJsonTag(marker.properties)"
              v-show="child !== ''"
              :key="'placename-marker-properties-' + n"
              class="placename-popup-text"
            >
              {{ fieldNames[n] }} : {{ marker.properties[child] }}
            </div>
          </div>
        </div></cesium-popup
      >
    </div>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Vue,
  Inject,
  Prop,
  Watch,
  Emit
} from 'vue-property-decorator'
import { CesiumPopup } from '@mapgis/webclient-vue-cesium'
import { utilInstance, cesiumUtilInstance } from '@mapgis/pan-spatial-map-store'

/**
 * cesium标注，弹出框使用@mapgis/webclient-vue-cesium里的popup
 */
@Component({
  name: 'MpCesiumMarker',
  components: {
    CesiumPopup
  }
})
export default class MpCesiumMarker extends Vue {
  @Inject('webGlobe') webGlobe: any

  @Inject('Cesium') Cesium: any

  @Prop({ type: Object, required: true }) marker!: Record<string, any>

  @Prop({ type: Array, default: [] }) readonly fieldNames!: []

  // 当前显示弹出框的标注id
  @Prop({ type: String, required: false }) currentMarkerId?: string

  @Emit('markerId')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitId(id: string) {}

  get img() {
    return this.marker.img
  }

  @Watch('img', { deep: true }) // 更换图片，更换地图上的标注
  changeImg() {
    this.cesiumUtilInstance.removeEntityByName(this.marker.id)
    this.upDateMarker()
  }

  get popupPosition() {
    if (!this.marker) {
      return {}
    }
    const { coordinates } = this.marker
    const position = {
      longitude: Number(coordinates[0]),
      latitude: Number(coordinates[1])
    }
    return position
  }

  private prePopup: any = undefined

  private markerFeatures: any[] = []

  private onMapLoad(map: any) {}

  private showPopup = false

  @Watch('currentMarkerId', { deep: true })
  hindDialog() {
    // 当当前显示弹出框的标注与组件内的id不一致时，隐藏弹出框
    if (this.currentMarkerId !== this.marker.id) {
      this.showPopup = false
    }
  }

  mounted() {
    cesiumUtilInstance.setCesiumGlobe(this.Cesium, this.webGlobe)
    this.upDateMarker()
  }

  beforeDestroy() {
    cesiumUtilInstance.removeEntityByName(this.marker.id)
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
    marker.center = marker.coordinates
    cesiumUtilInstance.addMarkerByFeature(marker)
  }

  mouseOver(event: any, marker: any) {
    this.showPopup = true
    this.emitId(this.marker.id)
  }

  mouseOut() {}

  getJsonTag(json: Record<string, any>) {
    const tags = utilInstance.getJsonTag(json)
    if (!this.fieldNames.includes('FID')) {
      const index = tags.indexOf('FID')
      if (index > -1) {
        tags.splice(index, 1)
      }
    }
    return tags
  }
}
</script>

<style></style>
