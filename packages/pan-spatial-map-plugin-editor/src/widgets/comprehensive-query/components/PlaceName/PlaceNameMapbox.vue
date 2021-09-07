<template>
  <div>
    <template v-if="!cluster">
      <mp-marker-set-pro :markers="markers" :field-configs="fieldConfigs">
      </mp-marker-set-pro>
      <mp-marker-set-pro
        :markers="activeMarkers"
        :field-configs="activeFieldConfigs"
      >
      </mp-marker-set-pro>
    </template>
    <!-- 聚合标注专题图 -->
    <mapgis-mapv-layer
      v-else
      :geojson="geojsonData"
      :options="options"
      count-field="count"
    />
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import { IFields } from '@mapgis/pan-spatial-map-common'
import { MapMixin } from '@mapgis/web-app-framework'

@Component()
export default class PlaceNameMapbox extends Mixins(MapMixin) {
  @Prop({ type: Array, required: true, default: [] })
  readonly fieldConfigs!: IFields[]

  @Prop({ type: [Array, Object], required: true, default: [] })
  readonly markers!: Record<string, any>[]

  @Prop({ type: Array, required: true, default: () => [] })
  readonly activeFieldConfigs!: IFields[]

  @Prop({ type: [Array, Object], required: true, default: [] })
  readonly activeMarkers!: Record<string, any>[]

  @Prop() cluster!: boolean

  @Prop() geojson!: Record<string, unknown>

  get geojsonData() {
    if (this.cluster) {
      return this.geojson
    }
    return {
      features: [],
      type: 'FeatureCollection'
    }
  }

  options = {
    fillStyle: 'rgba(255, 50, 0, 1.0)',
    size: 50 / 3 / 2, // 非聚合点的半径
    minSize: 8, // 聚合点最小半径
    maxSize: 31, // 聚合点最大半径
    globalAlpha: 0.8, // 透明度
    clusterRadius: 150, // 聚合像素半径
    maxClusterZoom: 18, // 最大聚合的级别
    maxZoom: 19, // 最大显示级别
    minPoints: 5, // 最少聚合点数，点数多于此值才会被聚合
    extent: 400, // 聚合的细腻程度，越高聚合后点越密集
    label: {
      // 聚合文本样式
      show: true, // 是否显示
      fillStyle: 'white'
    },
    gradient: { 0: 'blue', 0.5: 'yellow', 1.0: 'rgb(255,0,0)' }, // 聚合图标渐变色
    cesium: { postRender: true, postRenderFrame: 0 },
    draw: 'cluster',
    context: '2d'
  }

  setMapCenter(positionCoord) {
    this.map.flyTo({
      center: positionCoord,
      curve: 1,
      easing(t) {
        return t
      }
    })
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
