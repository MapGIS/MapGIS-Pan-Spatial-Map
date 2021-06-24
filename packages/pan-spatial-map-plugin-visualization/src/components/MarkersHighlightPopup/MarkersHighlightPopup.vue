<template>
  <mp-marker-plotting v-if="is2dMode" v-bind="bindProps" />
  <mp-3d-marker-plotting v-else v-bind="bindProps" :vue-key="vueKey" />
</template>
<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import { AppMixin, UUID, Feature } from '@mapgis/web-app-framework'
import {
  baseConfigInstance,
  markerIconInstance
} from '@mapgis/pan-spatial-map-store'
import _last from 'lodash/last'

interface IFeature {
  key?: string // 图层UUID
  title?: string // 图层名称
  feature?: Feature.GFeature
}

interface INormalizedFeature {
  uid: string // 图层UUID
  title: string // 图层名称
  feature: string
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
export default class MpMarkersHighlightPopup extends Mixins<
  Record<string, any>
>(AppMixin) {
  // 三维地图vueKey
  @Prop() readonly vueKey!: string

  // 是否二维地图
  @Prop() readonly is2d!: boolean

  // 所有的标注点信息
  @Prop({ required: true, default: () => [] }) readonly features!: IFeature[]

  // 需要高亮的标注点
  @Prop({ required: true, default: () => [] }) readonly highlightIds!: string[]

  // 是否随地图范围过滤
  @Prop({ default: false }) readonly filterWithMap!: boolean

  // 标注数据格式化函数, 组件内部使用的数据是INormalizeMarkData格式
  @Prop() readonly normalize!: (a: IFeature) => INormalizedFeature

  // 标注点
  markers: IMarker[] = []

  // 选中的数据范围
  selectionBound: Record<string, any> = {}

  // 当前数据范围
  fitBound: Record<string, any> = {}

  // 标注选中的图标
  selectIcon = ''

  // 标注默认的图标
  defaultIcon = ''

  // 是否二维地图模式
  get is2dMode() {
    return typeof this.is2d !== 'undefined' ? this.is2d : this.is2DMapMode
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
      markers,
      fitBound,
      filterWithMap,
      selectionBound,
      colorConfig
    } = this
    return {
      markers,
      fitBound,
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
   * 获取当前数据范围
   */
  getFitBound() {
    if (!this.highlightIds.length) return
    const lastId = _last(this.highlightIds)
    const {
      feature,
      feature: { bound }
    } = this.normalizedFeatures.find(({ uid }) => uid === lastId)
    const { xmin, xmax, ymin, ymax } =
      bound || Feature.getGeoJsonFeatureBound(feature)
    const _xmin = (3 * xmin - xmax) / 2
    const _ymin = (3 * ymin - ymax) / 2
    const _xmax = (3 * xmax - xmin) / 2
    const _ymax = (3 * ymax - ymin) / 2
    this.fitBound = {
      xmin: _xmin,
      ymin: _ymin,
      xmax: _xmax,
      ymax: _ymax
    }
  }

  /**
   * 获取默认标注图片
   * 请求失败的默认图片？
   */
  getDefaultIcon(success: (a: string) => void) {
    if (!this.defaultIcon) {
      markerIconInstance.unSelectIcon().then(defaultIcon => {
        this.defaultIcon = defaultIcon
        success(defaultIcon)
      })
    } else {
      success(this.defaultIcon)
    }
  }

  /**
   * 获取标注图片
   * 请求失败的默认图片？
   */
  getSelectIcon(success: () => void) {
    if (!this.selectIcon) {
      markerIconInstance.selectIcon().then(selectIcon => {
        this.selectIcon = selectIcon
        success()
      })
    } else {
      success()
    }
  }

  /**
   * 添加标注
   */
  addMarkers() {
    this.getDefaultIcon(defaultIcon => {
      this.markers = this.normalizedFeatures.reduce<IMarker[]>(
        (result, { uid, feature }) => {
          const coordinates = Feature.getGeoJsonFeatureCenter(feature)
          const centerItems = [coordinates[0], coordinates[1]]
          if (centerItems.every(v => !Number.isNaN(v))) {
            result.push({
              coordinates,
              feature,
              markerId: uid,
              fid: feature.properties.fid,
              img: defaultIcon,
              properties: feature.properties
            })
          }
          return result
        },
        []
      )
    })
  }

  /**
   * 移除标注
   */
  removeMarkers() {
    this.markers = []
  }

  /**
   * 高亮选择集对应的标注图标
   */
  hightlightMarkers() {
    this.getSelectIcon(() => {
      this.markers.forEach(marker => {
        const imgType = this.highlightIds.includes(marker.markerId)
          ? this.selectIcon
          : this.defaultIcon
        this.$set(marker, 'img', imgType)
      })
      if (!this.highlightIds.length) return
      const { MIN_VALUE, MAX_VALUE } = Number
      this.selectionBound = this.normalizedFeatures.reduce(
        ({ xmin, xmax, ymin, ymax }, { feature }: GFeature) => {
          const _bound =
            feature.bound || Feature.getGeoJsonFeatureBound(feature)
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
    })
  }

  @Watch('features', { immediate: true })
  watchFeatures(nV: IFeature[]) {
    if (nV.length) {
      this.addMarkers()
    } else {
      this.removeMarkers()
    }
  }

  @Watch('highlightIds', { immediate: true })
  watchHighlightIds() {
    this.getFitBound()
    this.hightlightMarkers()
  }

  beforeDestroyed() {
    this.fitBound = {}
    this.selectionBound = {}
    this.removeMarkers()
  }
}
</script>
<style lang="less" scoped></style>
