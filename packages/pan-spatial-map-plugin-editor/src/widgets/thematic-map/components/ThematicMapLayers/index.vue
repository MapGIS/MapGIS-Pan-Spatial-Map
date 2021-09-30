<template>
  <div>
    <!-- 加载专题图层 -->
    <template v-for="t in subjectLayers">
      <component
        v-if="subjectType === t"
        @highlight="setLinkageItem"
        @clear-highlight="resetLinkage"
        :key="t"
        :is="t"
        :data-set="dataSet"
        :subject-data="subjectData"
      />
    </template>
    <!-- 高亮属性表或者统计表某个选项时使用标注点 -->
    <template v-if="marker">
      <mp-marker-pro :marker="marker" v-if="is2DMapMode" />
      <mp-3d-marker-pro :marker="marker" v-else />
    </template>
  </div>
</template>
<script lang="ts">
import { Mixins, Component, Watch, Inject } from 'vue-property-decorator'
import { Feature, AppMixin } from '@mapgis/web-app-framework'
import { subjectTypeList, mapGetters, mapMutations } from '../../store'
import mapboxLayers from './components/Mapbox'
import CesiumLayers from './components/Cesium'

@Component({
  components: {
    ...mapboxLayers,
    ...CesiumLayers
  },
  computed: {
    ...mapGetters(['loading', 'subjectData', 'linkageItem'])
  },
  methods: {
    ...mapMutations(['setFeaturesQuery', 'setLinkageItem', 'resetLinkage'])
  }
})
export default class ThematicMapLayers extends Mixins(AppMixin) {
  @Inject('map') map

  // 高亮选项的标注点
  private marker = null

  // 要素数据
  private dataSet: Feature.FeatureIGS | null = null

  get prefix() {
    return this.is2DMapMode ? 'Mapbox' : 'Cesium'
  }

  // 获取专题类别
  get subjectType() {
    return this.subjectData
      ? `${this.prefix}${this.subjectData.subjectType}`
      : ''
  }

  // 获取渲染的子专题图层组件name集合
  get subjectLayers() {
    return subjectTypeList.map(({ value }) => `${this.prefix}${value}`)
  }

  /**
   * 设置初始范围
   */
  initBound() {
    this.map.setCenter([105, 36])
    this.map.setZoom(3)
  }

  /**
   * 清除高亮
   */
  clearHighlight() {
    this.marker = null
  }

  /**
   * 设置高亮
   * @param {object}  param marker 标注信息
   */
  setHighlight({ marker }) {
    this.marker = marker
  }

  /**
   * 监听: 专题数据变化
   */
  @Watch('subjectData', { deep: true })
  subjectDataChanged(nV) {
    if (!nV) {
      this.dataSet = null
    } else {
      this.setFeaturesQuery({
        isCache: false,
        onSuccess: dataSet => (this.dataSet = dataSet)
      })
    }
  }

  /**
   * 监听: 联动项变化
   */
  @Watch('linkageItem', { deep: true })
  watchHighlightItem(nV) {
    this.clearHighlight()
    if (nV) {
      this.setHighlight(nV)
    }
  }

  created() {
    this.initBound()
  }

  beforeDestroy() {
    this.resetLinkage()
  }
}
</script>
