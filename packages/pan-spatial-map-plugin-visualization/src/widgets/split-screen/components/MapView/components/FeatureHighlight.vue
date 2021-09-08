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
  title?: string // 图层名称
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

  @Inject('CesiumZondy') CesiumZondy: unknown

  // 三维地图vueKey
  @Prop() readonly vueKey!: string

  // 是否二维图层, 根据图层是否属于Layer3D还是Layer判断的
  @Prop({ default: true }) readonly is2dLayer!: boolean

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
    this.selectedMarkers = []
    this.markers = []
  }

  /**
   * 添加标注
   */
  async addMarkers() {
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
   * 取消高亮
   */
  clearHightlight() {
    if (this.vueKey !== dep.getState().vueKey) {
      this.selectedMarkers = []
    }
  }

  /**
   * 高亮选择集对应的标注图标
   */
  hightlightMarkers() {
    const selectedMarkers = this.markers.filter(({ markerId }) =>
      this.selectedKeys.includes(markerId)
    )
    dep.setState({
      vueKey: this.vueKey,
      selectedKeys: this.selectedKeys,
      selectedMarkers
    })
    dep.notify()
  }

  /**
   * 订阅: 更新
   */
  update() {
    const { vueKey, selectedKeys, selectedMarkers } = dep.getState()
    // 清除非当前vueKey的结果树选中
    if (this.vueKey !== vueKey) {
      this.$root.$emit(`clear-${this.vueKey}-query`)
    }
    this.markers.forEach(marker => {
      this.$set(
        marker,
        'img',
        selectedKeys.includes(marker.markerId)
          ? this.selectedIcon
          : this.defaultIcon
      )
    })
    this.selectedMarkers = selectedMarkers
  }

  @Watch('features', { immediate: true })
  featuresChanged(nV) {
    this.removeMarkers()
    this.addMarkers()
  }

  @Watch('selectedKeys', { immediate: true })
  selectedKeysChanged(nV) {
    this.clearHightlight()
    this.hightlightMarkers()
  }

  async created() {
    this.defaultIcon = await markerIconInstance.unSelectIcon()
    this.selectedIcon = await markerIconInstance.selectIcon()
    dep.addSub(this)
  }

  beforeDestroy() {
    dep.removeSub(this)
  }
}
</script>
<style lang="less" scoped></style>
