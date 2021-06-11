<template>
  <mp-marker-plotting v-if="is2dMode" v-bind="bindProps" />
  <mp-3d-marker-plotting v-else v-bind="bindProps" :vue-key="vueKey" />
</template>
<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import { AppMixin, UUID, Feature } from '@mapgis/web-app-framework'
import { baseConfigInstance } from '@mapgis/pan-spatial-map-store'
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
  id: string
}

@Component
export default class MpMarkersHighlightPopup extends Mixins<
  Record<string, any>
>(AppMixin) {
  // 三维地图vueKey
  @Prop() vueKey!: string

  // 是否二维地图
  @Prop() is2d!: boolean

  // 所有的标注点信息
  @Prop({ required: true, default: () => [] }) features!: IFeature[]

  // 需要高亮的标注点
  @Prop({ required: true, default: () => [] }) highlightIds!: string[]

  // 是否随地图范围过滤
  @Prop({ default: false }) filterWithMap!: boolean

  // 标注数据格式化函数, 组件内部使用的数据是INormalizeMarkData格式
  @Prop() normalize!: (a: IFeature) => INormalizedFeature

  // 标注点
  markers: IMarker[] = []

  // 选中的数据范围
  selectionBound: Record<string, any> = {}

  // 当前数据范围
  fitBound: Record<string, any> = {}

  // 是否二维地图模式
  get is2dMode() {
    return typeof this.is2d !== 'undefined' ? this.is2d : this.is2DMapMode
  }

  // 颜色配置
  get colorConfig() {
    return baseConfigInstance.config.colorConfig
  }

  // 标注图标
  get colorConfigImg() {
    return this.colorConfig.label.image
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
   * 获取图片地址
   * @param imgType
   */
  getColorConfigImg(imgType: 'defaultImg' | 'selectedImg') {
    return `${this.baseUrl}${this.colorConfigImg[imgType]}`
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
    const _xmin = (3 * xmin + xmax) / 2
    const _ymin = (3 * ymin + ymax) / 2
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
   * 添加标注
   */
  addMarkers() {
    this.markers = this.normalizedFeatures.reduce<IMarker[]>(
      (result, { uid, feature }) => {
        const coordinates = Feature.getGeoJSONFeatureCenter(feature)
        const centerItems = [coordinates[0], coordinates[1]]
        if (centerItems.every(v => !Number.isNaN(v))) {
          const img = this.getColorConfigImg('defaultImg')
          result.push({
            img,
            coordinates,
            feature,
            properties: feature.properties,
            fid: feature.properties.fid,
            id: uid
          })
        }
        return result
      },
      []
    )
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
    this.markers.forEach(marker => {
      const imgType = this.highlightIds.includes(marker.id)
        ? 'selectedImg'
        : 'defaultImg'
      this.$set(marker, 'img', this.getColorConfigImg(imgType))
    })
    const { MIN_VALUE, MAX_VALUE } = Number
    this.selectionBound = this.normalizedFeatures.reduce(
      ({ xmin, xmax, ymin, ymax }, { feature }: Feature.GFeature) => {
        const _bound = feature.bound || Feature.getGeoJSONFeatureBound(feature)
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

  @Watch('features', { deep: true })
  watchFeatures(nV: IFeature[]) {
    if (nV.length) {
      this.addMarkers()
    } else {
      this.removeMarkers()
    }
  }

  @Watch('highlightIds', { deep: true })
  watchHighlightIds() {
    this.getFitBound()
    this.hightlightMarkers()
  }
}
</script>
<style lang="less" scoped></style>
