<template>
  <div class="mapgis-marker-3d">
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
          :data-source="propertyKeys"
          size="small"
          class="markers"
        >
          <a-list-item slot="renderItem" slot-scope="item" class="marker-item">
            <div style="width: 130px" :title="propertyName(item)">
              {{ propertyName(item) }}
            </div>
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
import { cesiumUtilInstance, IFields } from '@mapgis/pan-spatial-map-store'

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
  @Inject('webGlobe') webGlobe: any

  @Inject('Cesium') Cesium: any

  @Prop({ type: Object, required: true }) marker!: Record<string, any>

  @Prop({
    type: Array,
    required: false,
    default: () => []
  })
  readonly fieldConfigs!: IFields[]

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
      this.mouseOut(event, marker)
    }
    marker.name = marker.id
    marker.center = marker.coordinates
    cesiumUtilInstance.addMarkerByFeature(marker)
  }

  mouseOver(event, marker) {
    this.showPopup = true
    this.emitId(marker.id)
    this.$emit('mouseenter', event, marker.id)
  }

  mouseOut(event, marker) {
    this.$emit('mouseleave', event, marker.id)
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
