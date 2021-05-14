<template>
  <div class="mapbox-thematic-map-layers">
    <template v-for="t in subjectLayers">
      <component
        :is="t"
        :key="t"
        :config="config"
        :featureQueryParams="featureQueryParams"
        v-if="subjectType === t"
      />
    </template>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import {
  thematicMapInstance,
  subjectTypes
} from '@mapgis/pan-spatial-map-store'
import '../../../../../libs/zondyclient/webclient-mapboxgl-plugin.js'
import SubSectionMapLayer from './SubSectionMapLayer.vue' // 分段专题图
import BaseMapWithGraphLayer from './BaseMapWithGraphLayer.vue' // 统计专题图
import StatisticLabelLayer from './StatisticLabelLayer.vue' // 等级符号专题图
import LabelLayer from './LabelLayer.vue' // 聚合标注专题图
import HeatMapLayer from './HeatMapLayer.vue' // 热力图
import HexBinLayer from './HexBinLayer.vue' // 蜂窝图

@Component({
  components: {
    SubSectionMapLayer,
    StatisticLabelLayer,
    BaseMapWithGraphLayer,
    LabelLayer,
    HeatMapLayer,
    HexBinLayer
  }
})
export default class MapBoxThematicMapLayers extends Vue {
  // 专题配置
  get config() {
    return thematicMapInstance.getSelectedConfig
  }

  // 获取query参数
  get featureQueryParams() {
    return thematicMapInstance.getFeatureQueryParams
  }

  // 获取专题类别
  get subjectType() {
    return this.config ? `${this.config.type}Layer` : ''
  }

  // 获取渲染的子专题图层组件name集合
  get subjectLayers() {
    return subjectTypes.map(v => `${v.value}Layer`)
  }
}
</script>
<style lang="less" scoped></style>
