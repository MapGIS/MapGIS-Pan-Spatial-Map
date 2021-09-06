<template>
  <mp-marker-plotting v-if="is2d" v-bind="bindProps" />
  <mp-3d-marker-plotting v-else v-bind="bindProps" />
</template>
<script lang="ts">
import { Mixins, Component, Prop, Watch, Inject } from 'vue-property-decorator'
import { AppMixin, UUID, Feature, Objects } from '@mapgis/web-app-framework'
import {
  baseConfigInstance,
  markerIconInstance
} from '@mapgis/pan-spatial-map-common'

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
  properties: unknown
  fid: string
  markerId: string
}

@Component
export default class MpFeatureHighlight extends Mixins(AppMixin) {
  @Inject('Cesium') Cesium: unknown

  @Inject('CesiumZondy') CesiumZondy: unknown

  // 三维地图vueKey
  @Prop({ default: UUID.uuid() }) readonly vueKey!: string

  // 是否二维图层, 根据图层是否属于Layer3D还是Layer判断的
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
  selectionBound = null

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
   *  获取模型高度
   * @param {array} markers
   * @return {promise}
   */
  getModelHeight(markers: Array<IMarker>) {
    return new Promise((resolve, reject) => {
      const webGlobe = this.CesiumZondy.getWebGlobe(this.vueKey)
      if (!webGlobe) {
        return reject('WebGlobe未初始化')
      }
      const positions = markers.map(
        ({ coordinates }) =>
          new this.Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1])
      )
      const sampleElevationTool = new this.Cesium.SampleElevationTool(
        webGlobe.viewer,
        positions,
        'model',
        positions => {
          resolve(positions && positions.length ? positions : [])
        }
      )
      sampleElevationTool.start()
    })
  }

  /**
   * 移除标注
   */
  removeMarkers() {
    this.selectionBound = null
    this.markers = []
  }

  /**
   * 添加标注
   */
  async addMarkers() {
    this.defaultIcon = await markerIconInstance.unSelectIcon()
    const tempMarkers = this.normalizedFeatures.reduce<IMarker[]>(
      (result, { uid, feature, feature: { properties } }) => {
        let coordinates = []
        if (!this.is2d) {
          const { xmin, xmax, ymin, ymax } = properties.specialLayerBound
          coordinates = [(xmin + xmax) / 2, (ymin + ymax) / 2]
        } else {
          coordinates = Feature.getGeoJSONFeatureCenter(feature)
        }

        if (coordinates.every(v => !Number.isNaN(v))) {
          result.push({
            coordinates,
            feature,
            properties,
            markerId: uid,
            fid: properties.fid,
            img: this.defaultIcon
          })
        }
        return result
      },
      []
    )
    if (!this.is2d && tempMarkers.length) {
      try {
        const arr = await this.getModelHeight(tempMarkers)
        if (arr.length === tempMarkers.length) {
          arr.forEach(({ longitude, latitude, height }, index) => {
            this.$set(tempMarkers[index], 'coordinates', [
              longitude,
              latitude,
              height
            ])
          })
        }
        this.markers = [...tempMarkers]
      } catch (e) {
        this.$message.error(e)
      }
    } else {
      this.markers = [...tempMarkers]
    }
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
      (
        { xmin, xmax, ymin, ymax },
        { feature, feature: { properties } }: GFeature
      ) => {
        const bound =
          properties.specialLayerBound ||
          Feature.getGeoJSONFeatureBound(feature)
        return {
          xmin: bound.xmin < xmin ? bound.xmin : xmin,
          ymin: bound.ymin < ymin ? bound.ymin : ymin,
          xmax: bound.xmax > xmax ? bound.xmax : xmax,
          ymax: bound.ymax > ymax ? bound.ymax : ymax
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
