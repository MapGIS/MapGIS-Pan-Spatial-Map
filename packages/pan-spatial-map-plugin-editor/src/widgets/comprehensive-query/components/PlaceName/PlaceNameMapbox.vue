<template>
  <div>
    <mapgis-dynamic-marker-layer
      v-if="!cluster"
      :data="geojson"
      :selects="hoverMarker"
      :highlight="false"
      :layerStyle="layerStyle"
      :highlightStyle="highlightStyle"
      idField="markerId"
    />
    <!-- 聚合标注专题图 -->
    <mapgis-mapv-layer
      v-else-if="
        geojson &&
          geojson.features &&
          geojson.features.length > 0 &&
          colorCluster
      "
      :geojson="geojson"
      :options="options"
      count-field="count"
    />
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import { Style } from '@mapgis/webclient-es6-service'
import { MapMixin } from '@mapgis/web-app-framework'

const { MarkerStyle, LineStyle, PointStyle, FillStyle } = Style

@Component({ components: {} })
export default class PlaceNameMapbox extends Mixins(MapMixin) {
  @Prop({
    type: String,
    default: ''
  })
  selectedMarkerIcon!: string

  @Prop({
    type: String,
    default: ''
  })
  defaultMarkerIcon!: string

  @Prop({
    type: Boolean,
    default: false
  })
  cluster!: boolean

  @Prop({
    type: String,
    default: ''
  })
  colorCluster?: string

  @Prop({
    type: Object,
    default: () => ({})
  })
  geojson!: Record<string, unknown>

  @Prop({
    type: Array,
    default: () => []
  })
  hoverMarker?: Array<string>

  get layerStyle() {
    return new MarkerStyle({
      symbol: this.defaultMarkerIcon
    })
  }

  get highlightStyle() {
    return {
      enableHoverMarker: false,
      enableHoverFeature: false,
      marker: new MarkerStyle({
        symbol: this.selectedMarkerIcon
      }),
      point: new PointStyle(),
      line: new LineStyle(),
      polygon: new FillStyle()
    }
  }

  get options() {
    return {
      fillStyle: this.colorCluster,
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
