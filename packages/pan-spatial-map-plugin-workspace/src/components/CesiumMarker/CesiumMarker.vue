<template>
  <div class="cesium-marker">
    <mapgis-3d-popup
      :position="{
        longitude: popupPosition.longitude,
        latitude: popupPosition.latitude
      }"
      :showed="showPopup"
    >
      <div slot="default">
        <a-list
          item-layout="horizontal"
          :data-source="Object.keys(marker.properties)"
          size="small"
          class="markers"
        >
          <a-list-item slot="renderItem" slot-scope="item" class="marker-item">
            <div style="width: 130px" :title="item">{{ item }}</div>
            <div style="width: 170px" :title="marker.properties[item]">
              {{ marker.properties[item] }}
            </div>
          </a-list-item>
        </a-list>
      </div>
    </mapgis-3d-popup>
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

  // 当前显示弹出框的标注id
  @Prop({ type: String, required: false }) currentMarkerId?: string

  private showPopup = false

  private entityNames: string[] = []

  get img() {
    return this.marker.img
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

  // 更换图片，更换地图上的标注
  @Watch('img', { deep: true })
  changeImg() {
    this.updateMarker()
  }

  @Watch('currentMarkerId', { deep: true })
  hidePopup() {
    // 当前显示弹出框的标注与组件内的id不一致时，隐藏弹出框
    if (this.currentMarkerId !== this.marker.id) {
      this.showPopup = false
    }
  }

  @Emit('marker-id')
  emitId(id: string) {}

  mounted() {
    this.updateMarker()
  }

  beforeDestroy() {
    cesiumUtilInstance.removeEntityByName(this.marker.id)
  }

  updateMarker() {
    cesiumUtilInstance.setCesiumGlobe(this.Cesium, this.webGlobe)
    cesiumUtilInstance.removeEntityByName(this.marker.id)
    const marker: any = { ...this.marker }
    marker.mouseOver = event => {
      this.mouseOver(event, marker)
    }
    marker.mouseOut = event => {
      this.mouseOut(event)
    }
    marker.name = marker.id
    marker.center = marker.coordinates
    cesiumUtilInstance.addMarkerByFeature(marker)
  }

  mouseOver(event: any, marker: any) {
    this.showPopup = true
    this.emitId(this.marker.id)
    this.$emit('mouseenter', event)
  }

  mouseOut(event) {
    this.$emit('mouseleave', event)
  }
}
</script>

<style lang="less">
.mp-map-container {
  .cesium-popup {
    .cesium-popup-content-wrapper {
      border: none;
      background: @base-bg-color;
      box-shadow: 0px 1px 2px 0px @shadow-color;
    }
    .cesium-popup-tip-container {
      .cesium-popup-tip {
        background: @base-bg-color;
        box-shadow: 0px 1px 2px 0px @shadow-color;
      }
    }
    .cesium-popup-close-button {
      color: @text-color;
      cursor: pointer;
      font-weight: normal;
      &:hover {
        color: @primary-color;
      }
    }
  }
}
</style>
<style lang="less" scoped>
.cesium-popup {
  .cesium-popup-content-wrapper {
    .markers {
      max-width: 240px;
      max-height: 200px;
      overflow: auto;
      .marker-item {
        padding: 0;
        font-size: 10px;
        div {
          padding: 2px 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
