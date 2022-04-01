<template>
  <mapgis-3d-scene-roaming
    :speed="speed"
    :exHeight="exHeight"
    :heading="heading"
    :pitch="pitch"
    :range="range"
    :animationType="animationType"
    :interpolationAlgorithm="interpolationAlgorithm"
    :isLoop="isLoop"
    :showPath="showPath"
    :showInfo="showInfo"
    :models="models"
    :paths="paths"
    @load="load"
    @save-paths="onSaveConfig"
  />
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import { api } from '@mapgis/pan-spatial-map-common'

@Component({
  name: 'MpSceneRoaming'
})
export default class MpSceneRoaming extends Mixins(WidgetMixin) {
  private speed = 10

  private exHeight = 1

  private heading = 90

  private pitch = 0

  private range = 0

  private animationType = 1

  private interpolationAlgorithm = 'LagrangePolynomialApproximation'

  private isLoop = true

  private showPath = true

  private showInfo = true

  private models = [
    {
      label: '人',
      value: './CesiumModels/Cesium_Man.glb'
    },
    {
      label: '卡车',
      value: './CesiumModels/CesiumMilkTruck.glb'
    },
    {
      label: '飞机',
      value: './CesiumModels/Cesium_Air.gltf'
    },
    {
      label: '无',
      value: ''
    }
  ]

  get paths() {
    return this.widgetInfo.config
  }

  private sceneRoaming = null

  load(sceneRoaming) {
    this.sceneRoaming = sceneRoaming
  }

  onActive() {
    this.sceneRoaming.mount()
  }

  // 微件关闭时
  onClose() {
    this.sceneRoaming.unmount()
  }

  // 微件失活时
  onDeActive() {
    this.sceneRoaming.unmount()
  }

  private onSaveConfig(paths) {
    const this_ = this

    api
      .saveWidgetConfig({
        name: 'scene-roaming',
        config: JSON.stringify(paths)
      })
      .then(() => {
        this_.$message.success('保存成功')
      })
      .catch(() => {
        this_.$message.error('保存失败')
      })
  }
}
</script>
