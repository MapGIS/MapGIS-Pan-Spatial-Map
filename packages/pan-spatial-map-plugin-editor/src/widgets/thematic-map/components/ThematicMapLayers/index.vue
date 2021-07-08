<template>
  <div class="mapbox-thematic-map-layers">
    <!-- <keep-alive> -->
    <template v-for="t in subjectLayers">
      <component
        v-if="subjectType === t"
        :key="t"
        :is="t"
        :dataSet="dataSet"
        :subDataConfig="subDataConfig"
      />
    </template>
    <!-- </keep-alive> -->
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
import { mapGetters, subjectTypes, mapMutations } from '../../store'
import mapboxLayers from './components/Mapbox'
import CesiumLayers from './components/Cesium'

@Component({
  components: {
    ...mapboxLayers,
    ...CesiumLayers
  },
  computed: {
    ...mapGetters(['selectedSubConfig', 'highlightItem'])
  },
  methods: {
    ...mapMutations(['setFeaturesQuery'])
  }
})
export default class ThematicMapLayers extends Mixins(AppMixin) {
  @Inject('map') map!: any

  vueKey = 'map'

  // 高亮选项的标注点
  marker = null

  // 要素数据
  dataSet: Feature.FeatureIGSSFELE | null = null

  // 专题配置
  get subDataConfig() {
    return this.selectedSubConfig
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
      this.map.setZoom(this.map.getZoom() - 1)
      this.map.fitBounds([
        [xmax, ymin],
        [xmin, ymax]
      ])
    }
  }

  /**
   * 监听: 专题配置
   */
  @Watch('subDataConfig', { deep: true })
  watchSubDataConfig(nV) {
    if (nV) {
      this.setFeaturesQuery({
        isPage: false,
        onSuccess: dataSet => {
          this.dataSet = dataSet
        }
      })
    } else {
      this.dataSet = null
    }
  }

  /**
   * 监听: 高亮
   */
  @Watch('highlightItem', { deep: true })
  watchHighlightItem(nV) {
    if (nV && nV.from !== this.vueKey && nV.marker) {
      this.marker = nV.marker
      this.zoomTo(this.marker.feature.bound)
    }
  }
}
</script>
<style lang="less" scoped></style>
