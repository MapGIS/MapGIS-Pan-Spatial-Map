<template>
  <mp-marker-plotting v-if="is2dLayer" v-bind="bindProps" />
  <mp-3d-marker-plotting v-else v-bind="bindProps" />
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch, Inject } from 'vue-property-decorator'
import { Feature } from '@mapgis/web-app-framework'
import {
  baseConfigInstance,
  markerIconInstance
} from '@mapgis/pan-spatial-map-common'
import dep from '../store/map-view-dep'

interface IFeature {
  key: string // 图层UUID
  layerName?: string // 图层名称
  feature?: Feature.GFeature // 图层的查询的要素信息
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
export default class FeatureHighlight extends Vue {
  @Inject('Cesium') Cesium: unknown

  @Inject('vueCesium') vueCesium: unknown

  // 三维地图vueKey
  @Prop() readonly vueKey!: string

  // 是否二维图层
  @Prop() readonly is2dLayer!: boolean

  // 所有的要素信息
  @Prop({ default: () => [] }) readonly features!: IFeature[]

  // 选中的的要素KEY集合
  @Prop({ default: () => [] }) readonly selectedKeys!: string[]

  // 标注点集合
  markers: IMarker[] = []

  // 选中的标注点集合
  selectedMarkers: IMarker[] = []

  // 选中的标注图标
  selectedIcon = ''

  // 标注默认的图标
  defaultIcon = ''

  // 颜色配置
  get highlightStyle() {
    return baseConfigInstance.config.colorConfig
  }

  // 二三维marker组件绑定的属性
  get bindProps() {
    const { vueKey, markers, selectedMarkers, highlightStyle } = this
    return {
      vueKey,
      markers,
      selectedMarkers,
      highlightStyle
    }
  }

  /**
   *  获取模型高度
   * @param {array} markers
   * @return {promise}
   */
  getModelHeight(markers: Array<IMarker>) {
    return new Promise((resolve, reject) => {
      const viewer = this.vueCesium.getViewer(this.vueKey)
      if (!viewer) {
        return reject('viewer未初始化')
      }
      const positions = markers.map(
        ({ coordinates }) =>
          new this.Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1])
      )
      const sampleElevationTool = new this.Cesium.SampleElevationTool(
        viewer,
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
    this.selectedMarkers = []
    this.markers = []
  }

  /**
   * 添加标注
   */
  async addMarkers() {
    this.removeMarkers()
    const tempMarkers = this.features.reduce<IMarker[]>(
      (result, { key, feature, feature: { properties } }) => {
        let coordinates = []
        if (!this.is2dLayer) {
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
            markerId: key,
            fid: properties.fid,
            img: this.defaultIcon
          })
        }
        return result
      },
      []
    )
    if (!this.is2dLayer && tempMarkers.length) {
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
   * 设置选中操作
   */
  setSelectedMarkers() {
    const { vueKey } = dep.getState()
    // 如果此时取消选中的屏不是上一次触发选中的屏则只清除取消的屏;
    // 否则需要清空存储并通知其他屏清除选中
    if (!this.selectedKeys.length && this.vueKey !== vueKey) {
      this.selectedMarkers = []
      return
    }
    // 存储选中要素并触发通知
    dep.setState({
      vueKey: this.vueKey,
      selectedMarkers: this.markers.filter(({ markerId }) =>
        this.selectedKeys.includes(markerId)
      )
    })
    dep.notify()
  }

  /**
   * 订阅更新: 标注和要素状态更新
   */
  update() {
    const { selectedMarkers } = dep.getState()
    // 设置高亮标注状态
    this.markers.forEach(marker => {
      this.$set(
        marker,
        'img',
        selectedMarkers.findIndex(
          ({ markerId }) => markerId === marker.markerId
        ) !== -1
          ? this.selectedIcon
          : this.defaultIcon
      )
    })
    // 设置高亮的要素
    this.selectedMarkers = selectedMarkers
  }

  /**
   * 订阅销毁: 标注销毁
   */
  destroy() {
    dep.setState({
      vueKey: this.vueKey,
      selectedMarkers: []
    })
    dep.notify()
  }

  @Watch('features')
  featuresChanged(nV) {
    this.addMarkers()
  }

  @Watch('selectedKeys')
  selectedKeysChanged() {
    this.setSelectedMarkers()
  }

  async created() {
    try {
      this.defaultIcon = await markerIconInstance.unSelectIcon()
      this.selectedIcon = await markerIconInstance.selectIcon()
      this.addMarkers()
    } catch (e) {
    } finally {
      dep.addSub(this)
    }
  }

  beforeDestroy() {
    dep.removeSub(this)
  }
}
</script>
<style lang="less" scoped></style>
