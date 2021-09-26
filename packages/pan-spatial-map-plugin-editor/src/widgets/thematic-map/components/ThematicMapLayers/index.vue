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
        :vue-key="vueKey"
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
  @Inject('map') map!: any

  // 组件唯一值
  vueKey = 'map'

  // 高亮选项的标注点
  marker = null

  // 要素数据
  dataSet: Feature.FeatureIGS | null = null

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
   * 清除高亮
   */
  clearHighlight() {
    this.marker = null
  }

  /**
   * 设置高亮
   */
  setHighlight(marker) {
    if (this.map) {
      const { xmin, xmax, ymin, ymax } = marker.feature.bound
      this.map.fitBounds(
        [
          [xmax, ymin],
          [xmin, ymax]
        ],
        {
          animate: false
        }
      )
    }
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
        isPage: false,
        onSuccess: dataSet => (this.dataSet = dataSet)
      })
    }
  }

  /**
   * 监听: 联动项变化
   */
  @Watch('linkageItem', { deep: true })
  watchHighlightItem(nV) {
    if (!nV) {
      this.clearHighlight()
    } else if (nV.from !== this.vueKey) {
      this.setHighlight(nV.marker)
    }
  }
}
</script>
