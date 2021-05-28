<template>
  <mapgis-marker
    :coordinates="marker.coordinates"
    anchor="bottom"
    @mouseenter="$emit('mouseenter', $event, marker.markerId)"
    @mouseleave="$emit('mouseleave', $event, marker.markerId)"
  >
    <img
      slot="marker"
      :src="marker.img"
      :ref="marker.markerId"
      @load="onMarkerImageLoad"
    />
    <mapgis-popup
      :coordinates="marker.coordinates"
      :showed="true"
      :offset="popupOffset(marker.markerId)"
      v-if="markerImageLoadStatus"
    >
      <a-list
        item-layout="horizontal"
        :data-source="propertyKeys"
        size="small"
        class="table-markers"
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
    </mapgis-popup>
  </mapgis-marker>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { IFields } from '@mapgis/pan-spatial-map-store'

@Component({
  name: 'MpMarkerPro'
})
export default class MpMarkerPro extends Vue {
  @Prop({
    type: Object,
    required: true
  })
  readonly marker!: Record<string, any>

  @Prop({
    type: String,
    default: 'bottom'
  })
  readonly anchor!: string

  @Prop({
    type: Array,
    required: false,
    default: () => []
  })
  readonly fieldConfigs!: IFields[]

  private markerImageLoadStatus = false

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

  private get popupOffset() {
    const self = this
    return function(ref) {
      if (self.$refs[ref]) {
        return [0, -self.$refs[ref].clientHeight]
      }
      return [0, 0]
    }
  }

  private onMarkerImageLoad() {
    this.markerImageLoadStatus = true
  }
}
</script>
<style lang="less" scoped>
.table-markers {
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
</style>
