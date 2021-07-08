<template>
  <mp-marker-plotting v-if="is2d" v-bind="bindProps" />
  <mp-3d-marker-plotting v-else v-bind="bindProps" />
</template>
<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import { AppMixin, UUID, Feature } from '@mapgis/web-app-framework'
import {
  baseConfigInstance,
  markerIconInstance
} from '@mapgis/pan-spatial-map-store'

interface IFeature {
  key?: string // 图层UUID
  title?: string // 图层名称
  feature?: Feature.GFeature // 图层的查询的要素信息
}

interface INormalizedFeature {
  uid: string // 图层UUID
  title: string // 图层名称
  feature: string // 要素信息
}

interface IMarker {
  img: stirng
  coordinates: number[]
  feature: Feature.GFeature
  properties: any
  fid: string
  markerId: string
}

@Component
export default class MpFeatureHighlight extends Mixins<Record<string, any>>(
  AppMixin
) {
  // 三维地图vueKey
  @Prop({ default: UUID.uuid() }) readonly vueKey!: string

  // 是否二维图层
  @Prop() readonly is2dLayer!: boolean

  // 所有的标注点信息
  @Prop({ required: true, default: () => [] }) readonly features!: IFeature[]

  // 选中的的标注点
  @Prop({ required: true, default: () => [] })
  readonly selectedFeatures!: string[]

  // 是否随地图范围过滤
  @Prop({ default: false }) readonly filterWithMap!: boolean

  // 标注数据格式化函数, 组件内部使用的数据是INormalizeMarkData格式
  @Prop() readonly normalize!: (a: IFeature) => INormalizedFeature

  // 标注点集合
  markers: IMarker[] = []

  // 选中的数据范围
  selectionBound: Record<string, any> = {}

  // 选中的标注图标
  selectedIcon = ''

  // 标注默认的图标
  defaultIcon = ''

  // 是否二维地图图层
  get is2d() {
    return typeof this.is2dLayer !== 'undefined'
      ? this.is2dLayer
      : this.is2DMapMode
  }

  // 颜色配置
  get colorConfig() {
    return baseConfigInstance.config.colorConfig
  }

  // 格式化后的标注数据
  get normalizedFeatures() {
    return this.getNormalizedFeatures(this.features)
  }

  // 二三维marker组件绑定的属性
  get bindProps() {
    const {
      vueKey,
      markers,
      filterWithMap,
      selectionBound,
      colorConfig,
      selectedFeatures: selectedMarkers
    } = this
    return {
      vueKey,
      markers,
      selectedMarkers,
      filterWithMap,
      selectionBound,
      highlightStyle: colorConfig
    }
  }

  /**
   * 格式化标注数据
   */
  getNormalizedFeatures(data: IFeature[]) {
    return data.map(v =>
      typeof this.normalize === 'function'
        ? {
            ...v,
            ...this.normalize(v)
          }
        : v
    )
  }

  /**
   * 移除标注
   */
  removeMarkers() {
    this.selectionBound = {}
    this.markers = []
  }

  /**
   * 添加标注
   */
  async addMarkers() {
    this.defaultIcon = await markerIconInstance.unSelectIcon()
    this.markers = this.normalizedFeatures.reduce<IMarker[]>(
      (result, { uid, feature }) => {
        const coordinates = Feature.getGeoJSONFeatureCenter(feature)
        const centerItems = [coordinates[0], coordinates[1]]
        if (centerItems.every(v => !Number.isNaN(v))) {
          result.push({
            coordinates,
            feature,
            markerId: uid,
            fid: feature.properties.fid,
            img: this.defaultIcon,
            properties: feature.properties
          })
        }
        return result
      },
      []
    )
  }

  /**
   * 取消高亮
   */
  clearHightlight() {
    this.markers.forEach(marker => {
      this.$set(marker, 'img', this.defaultIcon)
    })
  }

  /**
   * 高亮选择集对应的标注图标
   */
  async hightlightMarkers(selections: sting[]) {
    this.selectedIcon = await markerIconInstance.selectIcon()
    this.clearHightlight()
    this.markers.forEach(marker => {
      const imgType = selections.includes(marker.markerId)
        ? this.selectedIcon
        : this.defaultIcon
      this.$set(marker, 'img', imgType)
    })
    const { MIN_VALUE, MAX_VALUE } = Number
    this.selectionBound = this.normalizedFeatures.reduce(
      ({ xmin, xmax, ymin, ymax }, { feature }: GFeature) => {
        const _bound = feature.bound || Feature.getGeoJsonFeatureBound(feature)
        return {
          xmin: _bound.xmin < xmin ? _bound.xmin : xmin,
          ymin: _bound.ymin < ymin ? _bound.ymin : ymin,
          xmax: _bound.xmax > xmax ? _bound.xmax : xmax,
          ymax: _bound.ymax > ymax ? _bound.ymax : ymax
        }
      },
      {
        xmin: MAX_VALUE,
        ymin: MAX_VALUE,
        xmax: MIN_VALUE,
        ymax: MIN_VALUE
      }
    )
  }

  @Watch('features', { immediate: true })
  watchFeatures(nV: IFeature[]) {
    if (nV.length) {
      this.addMarkers()
    } else {
      this.removeMarkers()
    }
  }

  @Watch('selectedFeatures', { immediate: true })
  watchSelectedFeatures(nV) {
    if (nV.length) {
      this.hightlightMarkers(nV)
    } else {
      this.clearHightlight()
    }
  }

  beforeDestroy() {
    this.removeMarkers()
  }
}
</script>
<style lang="less" scoped></style>
