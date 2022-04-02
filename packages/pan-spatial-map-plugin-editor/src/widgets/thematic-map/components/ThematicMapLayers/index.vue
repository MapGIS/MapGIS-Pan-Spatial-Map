<template>
  <div>
    <template v-for="t in subjectLayers">
      <component
        v-if="subjectType === t"
        @highlight="setLinkage"
        @clear-highlight="resetLinkage"
        :key="t"
        :is="t"
        :marker="marker"
        :geojson="geojson"
        :subject-data="subjectData"
      />
    </template>
  </div>
</template>
<script lang="ts">
import { Mixins, Component, Watch, Inject } from 'vue-property-decorator'
import { Feature, AppMixin } from '@mapgis/web-app-framework'
import { getMarker, IMarker } from '../../utils'
import { subjectTypeList, mapGetters, mapMutations } from '../../store'
import mapboxLayers from './components/Mapbox'
import CesiumLayers from './components/Cesium'

@Component({
  components: {
    ...mapboxLayers,
    ...CesiumLayers
  },
  computed: {
    ...mapGetters(['loading', 'subjectData', 'linkageFid'])
  },
  methods: {
    ...mapMutations(['setFeaturesQuery', 'setLinkage', 'resetLinkage'])
  }
})
export default class ThematicMapLayers extends Mixins(AppMixin) {
  @Inject('map') map

  // 高亮选项的标注点
  private marker: IMarker | Record<string, unknown> = {}

  // 要素数据
  private geojson: Feature.FeatureIGSGeoJSON | null = null

  get prefix() {
    return this.is2DMapMode ? 'Mapbox' : 'Cesium'
  }

  // 获取专题类别
  get subjectType() {
    return this.subjectData
      ? `${this.prefix}${this.subjectData?.subjectType}`
      : ''
  }

  // 获取渲染的子专题图层组件name集合
  get subjectLayers() {
    return subjectTypeList.map(({ value }) => `${this.prefix}${value}`)
  }

  get popup() {
    return this.subjectData ? this.subjectData.popup : undefined
  }

  get propertiesOption() {
    let propertiesOption
    if (this.popup) {
      const { showFields, showFieldsTitle } = this.popup
      if (showFields && showFields.length > 0) {
        propertiesOption = { fields: showFields, fieldsTitle: showFieldsTitle }
      }
    }
    return propertiesOption
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
  onClearHighlight() {
    this.marker = {}
  }

  /**
   * 高亮
   * @param {string} fid 要素fid
   */
  onHighlight(fid: string) {
    getMarker(this.geojson, fid, this.propertiesOption).then(marker => {
      this.marker = marker
    })
  }

  /**
   * 设置高亮
   * @param {string} fid 要素fid
   */
  setHighlight(fid: string) {
    this.onClearHighlight()
    this.onHighlight(fid)
  }

  /**
   * 监听: 专题数据变化
   */
  @Watch('subjectData', { deep: true })
  subjectDataChanged(nV) {
    this.geojson = null
    if (nV) {
      this.setFeaturesQuery({
        isCache: false,
        onSuccess: geojson => (this.geojson = geojson)
      })
    }
  }

  /**
   * 监听: 联动项变化
   */
  @Watch('linkageFid')
  linkageFidChanged(nV) {
    this.setHighlight(nV)
  }

  created() {
    this.initBound()
  }

  beforeDestroy() {
    this.resetLinkage()
  }
}
</script>
