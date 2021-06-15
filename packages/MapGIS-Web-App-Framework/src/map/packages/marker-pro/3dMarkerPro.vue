<template>
  <div class="mapgis-marker-3d">
    <mapgis-3d-popup
      :vue-key="vueKey"
      :position="{
        longitude: popupPosition.longitude,
        latitude: popupPosition.latitude,
        height: popupPosition.height
      }"
      :visible="showPopup"
      @change="changePopup"
    >
      <div slot="default">
        <slot
          name="popup"
          :marker="marker"
          :field-configs="fieldConfigs"
          :property-keys="propertyKeys"
        >
          <a-list
            item-layout="horizontal"
            :data-source="propertyKeys"
            size="small"
            class="table-marker"
          >
            <a-list-item
              slot="renderItem"
              slot-scope="item"
              class="table-marker-item"
            >
              <div style="width: 130px" :title="propertyName(item)">
                {{ propertyName(item) }}
              </div>
              <div style="width: 170px" :title="marker.properties[item]">
                {{ marker.properties[item] }}
              </div>
            </a-list-item>
          </a-list>
        </slot>
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
import { SceneOverlays } from '../../../model/overlay'

/**
 * cesium标注，弹出框使用@mapgis/webclient-vue-cesium里的popup
 */
@Component({
  name: 'Mp3dMarkerPro',
  components: {
    CesiumPopup
  }
})
export default class Mp3dMarkerPro extends Vue {
  @Inject('Cesium') Cesium: any

  @Inject('CesiumZondy') CesiumZondy: any

  @Inject('webGlobe') webGlobe: any

  @Prop() readonly vueKey!: string

  @Prop({ type: Object, required: true }) marker!: Record<string, any>

  @Prop({
    type: Array,
    required: false,
    default: () => []
  })
  readonly fieldConfigs!: any[]

  // 当前显示弹出框的标注id
  @Prop({ type: String, required: false }) currentMarkerId?: string

  @Emit()
  change(currentMarkerId) {}

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
    const height = coordinates.length > 2 ? Number(coordinates[2]) : 0
    const position = {
      longitude: Number(coordinates[0]),
      latitude: Number(coordinates[1]),
      height: height
    }
    return position
  }

  private changePopup(val) {
    this.showPopup = val
    if (!val) {
      this.change('')
    }
  }

  // 根据filedConfigs做一个过滤，去除不可见的
  private get propertyKeys() {
    const keys = Object.keys(this.marker.properties)
    return keys.filter(key => {
      const config = this.fieldConfigs.find(config => config.name === key)

      if (
        config &&
        Object.hasOwnProperty.call(config, 'visible') &&
        !config.visible
      ) {
        return false
      }

      return true
    })
  }

  private get propertyName() {
    return function(key) {
      const config = this.fieldConfigs.find(config => config.name === key)

      if (config && Object.hasOwnProperty.call(config, 'title')) {
        return config.title
      }

      return key
    }
  }

  // 更换图片，更换地图上的标注
  @Watch('img', { deep: true })
  changeImg() {
    this.updateMarker()
  }

  @Watch('currentMarkerId', { deep: true, immediate: true })
  hidePopup() {
    // 当前显示弹出框的标注与组件内的id不一致时，隐藏弹出框
    if (this.currentMarkerId !== this.marker.markerId) {
      this.showPopup = false
    }
  }

  @Emit('marker-id')
  emitId(id: string) {}

  @Watch('vueKey')
  changeVueKey() {
    this.setCesiumGlobe()
  }

  setCesiumGlobe() {
    cesiumUtilInstance.setCesiumGlobe(
      this.Cesium,
      cesiumUtilInstance.findWebGlobe(this.vueKey)
    )
  }

  mounted() {
    this.sceneOverlays = SceneOverlays.getInstance(
      this.Cesium,
      this.CesiumZondy,
      this.webGlobe
    )
    this.updateMarker()
  }

  beforeDestroy() {
    this.sceneOverlays.removeEntityByName(this.marker.markerId)
  }

  updateMarker() {
    this.sceneOverlays.removeEntityByName(this.marker.markerId)
    const marker: any = { ...this.marker }
    marker.mouseOver = event => {
      this.mouseOver(event, marker)
    }
    marker.mouseOut = event => {
      this.mouseOut(event, marker)
    }
    marker.name = marker.markerId
    marker.center = marker.coordinates
    this.sceneOverlays.addMarker(marker)
  }

  mouseOver(event, marker) {
    this.showPopup = true
    this.emitId(marker.markerId)
    this.$emit('mouseenter', event, marker.markerId)
  }

  mouseOut(event, marker) {
    this.$emit('mouseleave', event, marker.markerId)
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
    .table-marker {
      max-width: 240px;
      max-height: 200px;
      overflow: auto;
      .table-marker-item {
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
