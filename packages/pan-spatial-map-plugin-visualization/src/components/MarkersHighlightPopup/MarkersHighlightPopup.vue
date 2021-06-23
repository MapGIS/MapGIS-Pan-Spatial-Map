<template>
  <mp-marker-plotting
    :markers="markers"
    :filter-with-map="filterWithMap"
    :selection-bound="selectionBound"
    :highlight-style="highlightStyle"
    @map-bound-change="onGetGeometry"
  />
</template>
<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import { AppMixin, UUID, Feature } from '@mapgis/web-app-framework'
import { baseConfigInstance } from '@mapgis/pan-spatial-map-store'

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

/**
 * 目前只支持二维,三维后期会加, AppMixin => is2DMapMode
 */
@Component({
  components: {}
})
export default class MpMarkersHighlightPopup extends Mixins<
  Record<string, any>
>(AppMixin) {
  // 所有的标注点
  @Prop({ required: true, default: () => [] }) features!: IFeature[]

  // 需要高亮的标注点
  @Prop({ required: true, default: () => [] }) highlightIds!: string[]

  // 标注数据格式化函数, 组件内部使用的数据是INormalizeMarkData格式
  @Prop() normalize!: (a: IFeature) => INormalizedFeature

  // 是否随地图范围过滤
  @Prop({ default: false }) filterWithMap!: boolean

  // 标注点
  markers: IMarker[] = []

  // 选中的数据范围
  selectionBound: Record<string, any> = {}

  get colorConfig() {
    return baseConfigInstance.config.colorConfig
  }

  get colorConfigImg() {
    return this.colorConfig.label.image
  }

  get highlightStyle() {
    return this.colorConfig.feature
  }

  // 格式化后的标注数据
  get normalizedFeatures() {
    return this.getNormalizedFeatures(this.features)
  }

  /**
   * 格式化数据
   * @param data 数据源
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
   * 添加标注
   */
  addMarkers() {
    if (this.markers.length) {
      this.removeMarkers()
    }
    this.markers = this.normalizedFeatures.reduce<IMarker[]>(
      (result, { uid, feature }) => {
        const coordinates = Feature.getGeoJsonFeatureCenter(feature)
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

  onGetGeometry(val: Record<string, any>) {
    // todo
  }

  @Watch('features', { deep: true })
  watchFeatures() {
    this.addMarkers()
  }

  @Watch('highlightIds', { deep: true })
  watchHighlightIds() {
    this.hightlightMarkers()
  }
}
</script>
<style lang="less" scoped></style>
