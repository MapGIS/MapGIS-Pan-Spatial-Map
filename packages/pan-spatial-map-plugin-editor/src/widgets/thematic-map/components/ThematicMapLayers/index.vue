<template>
  <div class="mapbox-thematic-map-layers">
    <template v-for="t in subjectLayers">
      <component
        :is="t"
        :key="t"
        :config="config"
        :dataSet="dataSet"
        v-if="subjectType === t"
      />
    </template>
  </div>
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { AppMixin } from '@mapgis/web-app-framework'
import {
  thematicMapInstance,
  subjectTypes
} from '@mapgis/pan-spatial-map-store'
import mapboxLayers from './components/Mapbox'
import CesiumLayers from './components/Cesium'

@Component({
  components: {
    ...mapboxLayers,
    ...CesiumLayers
  }
})
export default class ThematicMapLayers extends Mixins(AppMixin) {
  get prefix() {
    return this.is2DMapMode ? 'Mapbox' : 'Cesium'
  }

  // 专题配置
  get config() {
    return thematicMapInstance.getSelectedConfig
  }

  // 专题某年度的要素数据
  get dataSet() {
    return thematicMapInstance.getPageDataSet
  }

  // 获取专题类别
  get subjectType() {
    return this.config ? `${this.prefix}${this.config.type}` : ''
  }

  // 获取渲染的子专题图层组件name集合
  get subjectLayers() {
    return subjectTypes.map(({ value }) => `${this.prefix}${value}`)
  }
}
</script>
<style lang="less" scoped></style>
