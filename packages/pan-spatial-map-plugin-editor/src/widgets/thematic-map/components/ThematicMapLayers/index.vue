<template>
  <div class="mapbox-thematic-map-layers">
    <template v-for="t in subjectLayers">
      <component
        :is="t"
        :key="t"
        :subDataConfig="subDataConfig"
        :dataSet="dataSet"
        v-if="subjectType === t"
      />
    </template>
    <template v-if="marker">
      <!-- 高亮属性表或者统计表某个选项时使用标注点 -->
      <mp-marker-pro :marker="marker" v-if="is2DMapMode" />
      <mp-3d-marker-pro :marker="marker" v-else />
    </template>
  </div>
</template>
<script lang="ts">
import { Mixins, Component, Watch, Inject } from 'vue-property-decorator'
import { Feature, AppMixin } from '@mapgis/web-app-framework'
import { mapGetters, subjectTypes } from '../../store'
import mapboxLayers from './components/Mapbox'
import CesiumLayers from './components/Cesium'

@Component({
  components: {
    ...mapboxLayers,
    ...CesiumLayers
  },
  computed: {
    ...mapGetters(['selectedSubConfig', 'pageDataSet', 'highlightItem'])
  }
})
export default class ThematicMapLayers extends Mixins(AppMixin) {
  @Inject('map') map!: any

  // 高亮选项的标注点
  marker = null

  // 专题配置
  get subDataConfig() {
    return this.selectedSubConfig
  }

  // 专题某年度的要素数据
  get dataSet() {
    return this.pageDataSet
  }

  get prefix() {
    return this.is2DMapMode ? 'Mapbox' : 'Cesium'
  }

  // 获取专题类别
  get subjectType() {
    return this.subDataConfig
      ? `${this.prefix}${this.subDataConfig.subjectType}`
      : ''
  }

  // 获取渲染的子专题图层组件name集合
  get subjectLayers() {
    return subjectTypes.map(({ value }) => `${this.prefix}${value}`)
  }

  /**
   * zoom到指定范围
   * @param {object} bound 经纬度范围
   */
  zoomTo(bound) {
    if (bound) {
      const { xmin, xmax, ymin, ymax } = bound
      this.map.fitBounds([
        [xmax, ymin],
        [xmin, ymax]
      ])
    }
  }

  /**
   * 监听: 高亮
   */
  @Watch('highlightItem', { deep: true })
  watchHighlightItem(nV) {
    if (nV && nV.marker) {
      this.marker = nV.marker
      this.zoomTo(this.marker.feature.bound)
    }
  }
}
</script>
<style lang="less" scoped></style>
