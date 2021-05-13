<template>
  <mp-mark-popup-mapbox
    ref="mpMarkPopupMapbox"
    :markers="markers"
    :filter-with-map="filterWithMap"
    :selection-bound="selectionBound"
    :highlight-style="highlightStyle"
    @map-bound-change="onGetGeometry"
  />
</template>
<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import { AppMixin, UUID } from '@mapgis/web-app-framework'
import {
  baseConfigInstance,
  utilInstance,
  GFeature
} from '@mapgis/pan-spatial-map-store'
// 本地测试使用的临时地址
import MpMarkPopupMapbox from '../../../../pan-spatial-map-plugin-workspace/src/components/AttributeTable/TableMapbox.vue'

interface IFeature {
  key?: string // 图层ID
  id?: string // 图层ID
  layerId?: string // 图层ID
  title?: string // 图层名称
  feature?: GFeature
}

interface INormalizedFeature {
  layerId: string // 图层ID
  title: string // 图层名称
  feature: string
}

interface IMarker {
  img: stirng
  coordinates: any
  feature: GFeature
  properties: any
  fid: string
  id: string
}

/**
 * 目前只支持二维,三维后期会加, AppMixin => is2DMapMode
 */
@Component({
  components: {
    MpMarkPopupMapbox
  }
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
  markers: Record<string, any>[] = []

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
    this.markers = this.normalizedFeatures.reduce<IMarker[]>(
      (result, { feature }) => {
        const coordinates = utilInstance.getGeoJsonFeatureCenter(feature)
        const centerItems = [coordinates[0], coordinates[1]]
        if (centerItems.every(v => !Number.isNaN(v))) {
          const img = this.getColorConfigImg('defaultImg')
          result.push({
            img,
            coordinates,
            feature,
            properties: feature.properties,
            fid: feature.properties.fid,
            id: UUID.uuid()
          })
        }
        return result
      },
      []
    )
    console.log('this.markers', this.markers)
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
      const imgType = this.highlightIds.includes(marker.fid)
        ? 'selectedImg'
        : 'defaultImg'
      marker.img = this.getColorConfigImg(imgType)
    })
    const { MIN_VALUE, MAX_VALUE } = Number
    this.selectionBound = this.normalizedFeatures.reduce(
      ({ xmin, xmax, ymin, ymax }, { feature }: GFeature) => {
        const _bound =
          feature.bound || utilInstance.getGeoJsonFeatureBound(feature)
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
