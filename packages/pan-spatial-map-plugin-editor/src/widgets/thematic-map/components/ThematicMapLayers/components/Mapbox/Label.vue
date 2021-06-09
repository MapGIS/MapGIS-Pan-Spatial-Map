<template>
  <!-- 聚合标注专题图 -->
  <mapgis-mapv-layer :geojson="geojsonPoint" :options="options" />
  <!-- <div>
    <mapgis-mapv-layer :geojson="geojsonPoint" :options="options" />
    <mapgis-popup :coordinates="coordinates" :showed="true" v-if="showPopup">
      <span v-if="!properties">暂无数据</span>
      <template v-else>
        <row-flex
          v-for="(v, k) in properties"
          :key="`label-properties-${v}`"
          :label="`${k}`"
          :span="[10, 14]"
          class="popup-row"
          >{{ `${v}` }}</row-flex
        >
      </template>
    </mapgis-popup>
  </div> -->
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import RowFlex from '../../../RowFlex'
import BaseMinxin from '../../mixins/base'
// import MapboxMinxin from '../../mixins/mapbox'

@Component /* ({
  components: {
    RowFlex
  }
}) */
export default class MapboxLabel extends Mixins(BaseMinxin) {
  geojsonPoint = {}

  options = {
    fillStyle: 'rgba(255, 50, 0, 1.0)',
    size: 50 / 3 / 2,
    minSize: 8,
    maxSize: 31,
    globalAlpha: 0.8,
    clusterRadius: 150,
    maxClusterZoom: 18,
    maxZoom: 19,
    minPoints: 5,
    extent: 400,
    label: {
      show: true,
      fillStyle: 'white'
    },
    gradient: {
      '0': 'blue',
      '0.5': 'yellow',
      '1.0': 'rgb(255,0,0)'
    },
    draw: 'cluster'
  }

  /**
   * 展示图层
   */
  showLayer() {
    if (this.geojson) {
      this.geojsonPoint = this.geojson
    }
  }

  /**
   * 移除图层
   */
  removeLayer() {
    if (this.geojsonPoint) {
      this.geojsonPoint.features = []
    }
  }

  // /**
  //  * 展示信息窗口
  //  */
  // getPopupInfos({ features }: any) {
  //   const { showFields, showFieldsTitle } = this.popupConfig
  //   if (!showFields || !showFields.length) return
  //   if (features[0] && features[0].properties) {
  //     const { properties, geometry } = features[0]
  //     this.coordinates = geometry.coordinates.slice()
  //     this.properties = showFields.reduce((obj, v: string) => {
  //       const tag = showFieldsTitle[v] ? showFieldsTitle[v] : v
  //       obj[tag] = properties[v]
  //       return obj
  //     }, {})
  //   }
  // }
}
</script>
<style lang="less" scoped>
.popup-row {
  min-width: 100px;
}
</style>
