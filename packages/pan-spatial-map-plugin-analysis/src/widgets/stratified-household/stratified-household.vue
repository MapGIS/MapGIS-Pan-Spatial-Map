<template>
  <mapgis-3d-stratified-household
    v-if="show"
    @loaded="load"
    @project-screen="handleProjectScreen"
    @change-layer="handleChangeLayer"
    :outStyle="outStyle"
    :layers="layers"
    :enablePopup="true"
    :enableCollapse="false"
    :enableStratifiedHouse="true"
    :getVideoStatus="getVideoStatus"
    :layerHighlightColorProp="layerHighlightColor"
    :featureHighlightColorProp="featureHighlightColor"
  ></mapgis-3d-stratified-household>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin, LayerType, LoadStatus } from '@mapgis/web-app-framework'
import {
  VideoManager,
  baseConfigInstance
} from '@mapgis/pan-spatial-map-common'

@Component({
  name: 'MpStratifiedHousehold'
})
export default class MpStratifiedHousehold extends Mixins(WidgetMixin) {
  outStyle = {
    position: 'absolute',
    // position: 'relative',
    zIndex: 1000,
    padding: '0px',
    margin: '0px',
    height: '460px',
    width: '270px',
    top: '0px',
    left: '0px'
  }

  layers = []

  show = true

  layerId = ''

  layerTitle = ''

  // 颜色配置
  get featureHighlightColor() {
    return baseConfigInstance.config.colorConfig.feature.reg.color
  }

  get layerHighlightColor() {
    let color = 'rgba(255,0,0,0.5)'
    if (this.widgetInfo.config && this.widgetInfo.config.layerHighlightcolor) {
      color = this.widgetInfo.config.layerHighlightcolor
    }
    return color
  }

  /**
   * 动态获取基础目录树上已勾选的三维模型数据
   */
  @Watch('document', { immediate: true, deep: true })
  getScenes() {
    if (!this.document) return
    const layers = []
    this.document.defaultMap
      .clone()
      .getFlatLayers()
      .forEach((layer, index) => {
        const { id, type, title } = layer
        // if (layer.loadStatus === LoadStatus.loaded) {
        if (type === LayerType.IGSScene) {
          // if (layer.activeScene) {
          let isHousehold
          if (layer.title.indexOf('G3D') >= 0) {
            isHousehold = true
          } else {
            isHousehold = false
          }
          // 剖切分析暂时只支持模型
          layers.push({
            title: title,
            vueIndex: id,
            isHousehold
          })
          // }
        }
        // }
      })
    this.layers = layers
  }

  /**
   * 微件打开时
   */
  onOpen() {
    this.show = true
  }

  /**
   * 微件关闭时
   */
  onClose() {
    this.show = false
  }

  load(payload) {
    const { component } = payload
    this.component = component
  }

  handleChangeLayer(layer) {
    const { title, vueIndex } = layer
    this.layerId = vueIndex
    this.layerTitle = title
  }

  handleProjectScreen(file) {
    if (!this.getVideoStatus(file.name)) {
      const { layerId, layerTitle } = this
      const {
        vFOV,
        orientationHeading,
        orientationRoll,
        positionX,
        positionY,
        positionZ,
        hFOV,
        orientationPitch
      } = file
      const cameraPosition = {
        x: positionX,
        y: positionY,
        z: positionZ
      }
      const Orientation = {
        heading: orientationHeading,
        pitch: orientationPitch,
        roll: orientationRoll
      }

      VideoManager.addVideo(
        layerId, // this.exhibition.id,
        layerTitle, // this.exhibition.name,
        file.name,
        file.url,
        file.type,
        file.url,
        '',
        true,
        cameraPosition,
        Orientation,
        hFOV,
        vFOV
      )
      this.setVideoStatus(file.name, true)
    } else {
      this.setVideoStatus(file.name)
    }
  }

  getVideoStatus(videoId) {
    const { layerId, layerTitle } = this
    return VideoManager.getVideoStatus(videoId, layerId)
  }

  setVideoStatus(videoId, isProjected = false) {
    const { layerId, layerTitle } = this
    return VideoManager.setVideoStatus(videoId, layerId, isProjected)
  }
}
</script>

<style lang="less" scoped>
.mapgis-3d-stratified-household-wrapper {
  height: 450px;
  width: 260px;
}
</style>
