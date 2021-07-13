<template>
  <div class="mapbox-thematic-map-layers">
    <template v-for="t in subjectLayers">
      <component
        v-if="subjectType === t"
        @highlight="setHighlightItem"
        @clear-highlight="resetHighlight"
        :key="t"
        :is="t"
        :vue-key="vueKey"
        :dataSet="dataSet"
        :subDataConfig="subDataConfig"
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
import { mapGetters, subjectTypeList, mapMutations } from '../../store'
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
    ...mapMutations(['setFeaturesQuery', 'setHighlightItem', 'resetHighlight'])
  }
})
export default class ThematicMapLayers extends Mixins(AppMixin) {
  @Inject('map') map!: any

  // 组件唯一值
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
    return subjectTypeList.map(({ value }) => `${this.prefix}${value}`)
  }

  /**
   * zoom到指定范围
   * @param {object} bound 经纬度范围
   */
  panTo(bound) {
    if (bound) {
      const { xmin, xmax, ymin, ymax } = bound
      this.map.panTo([
        (bound.xmin + bound.xmax) / 2,
        (bound.ymin + bound.ymax) / 2
      ])
    }
  }

  /**
   * 清除高亮
   */
  clearHighlight() {
    this.marker = null
  }

  /**
   * 设置高亮
   */
  setHighlight(marker) {
    this.marker = marker
    this.panTo(this.marker.feature.bound)
  }

  /**
   * 监听: 专题配置
   */
  @Watch('subDataConfig', { deep: true })
  watchSubDataConfig(nV) {
    if (!nV) {
      this.dataSet = null
    } else {
      this.setFeaturesQuery({
        isPage: false,
        onSuccess: dataSet => {
          this.dataSet = dataSet
        }
      })
    }
  }

  /**
   * 监听: 高亮
   */
  @Watch('highlightItem', { deep: true })
  watchHighlightItem(nV) {
    if (!nV) {
      this.clearHighlight()
    } else if (nV.from !== this.vueKey) {
      this.setHighlight(nV.marker)
    }
  }
}
</script>
<style lang="less" scoped></style>
