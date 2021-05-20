<template>
  <!-- 热力图 -->
  <mapgis-mapv-layer
    :geojson="geojsonPoint"
    :options="options"
    v-show="geojsonPoint"
  />
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import {
  queryFeaturesInstance,
  FeatureIGS
} from '@mapgis/pan-spatial-map-store'

@Component
export default class MapboxHeatMap extends Vue {
  @Prop({ default: () => ({}) }) dataSet!: FeatureIGS

  geojsonPoint = null

  options = {
    context: '2d',
    draw: 'heatmap',
    size: 20,
    gradient: {
      0: 'rgba(49, 54, 149, 0)',
      0.2: 'rgba(69,117,180, 0.7)',
      0.3: 'rgba(116,173,209, 0.7)',
      0.4: 'rgba(171,217,233, 0.7)',
      0.5: 'rgba(224,243,248, 0.7)',
      0.6: 'rgba(254,224,144,0.7)',
      0.7: 'rgba(253,174,97,0.7)',
      0.8: 'rgba(244,109,67,0.8)',
      0.9: 'rgba(215,48,39,0.8)',
      0.95: 'rgba(165, 0, 38,0.8)'
    }
  }

  /**
   * 展开图层
   */
  showLayer() {
    this.geojsonPoint = queryFeaturesInstance.igsFeaturesToGeoJSONFeatures(
      this.dataSet
    )
  }

  /**
   * 移除图层
   */
  removeLayer() {
     if(this.geojsonPoint) {
      this.geojsonPoint.features = []
    }
  }
}
</script>
