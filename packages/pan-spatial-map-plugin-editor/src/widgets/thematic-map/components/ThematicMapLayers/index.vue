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
import { UUID, Feature, AppMixin } from '@mapgis/web-app-framework'
import { markerIconInstance } from '@mapgis/pan-spatial-map-common'
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
  private marker: unknown = {}

  // 要素数据
  private geojson: Feature.FeatureIGSGeoJSON | null = null

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
  onClearHighlight() {
    this.marker = {}
  }

  /**
   * 高亮
   * @param {string} fid 要素fid
   */
  onHighlight(fid: string) {
    if (!this.geojson || !fid) return
    markerIconInstance.unSelectIcon().then(img => {
      const feature = this.geojson.features.find(
        ({ properties }) => properties.fid === fid
      )
      if (feature) {
        const coordinates = Feature.getGeoJSONFeatureCenter(feature)
        const { properties } = feature
        this.marker = {
          img,
          feature,
          properties,
          coordinates,
          fid: properties.fid,
          markerId: UUID.uuid()
        }
      }
    })
  }

  /**
   * 设置高亮
   * @param {string} fid 要素fid
   */
  setHighlight(fid: string) {
    debugger
    this.onClearHighlight()
    this.onHighlight(fid)
  }

  /**
   * 监听: 专题数据变化
   */
  @Watch('subjectData', { deep: true })
  subjectDataChanged(nV) {
    if (!nV) {
      this.geojson = null
    } else {
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
