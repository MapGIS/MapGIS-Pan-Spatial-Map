<template>
  <mapgis-3d-projector-manager
    class="projector-manager"
    :projectorOverlayLayerList="projectorOverlayLayerList"
    :modelUrl="modelUrl"
    :modelOffset="modelOffset"
    :currentLayerId="currentLayerId"
    :currentProjectorId="currentProjectorId"
    :maxProjected="maxProjected"
    :hideVPInvisible="hideVPInvisible"
    @load="load"
    @update-projectorOverlayLayerList="updateProjectorOverlayLayerList"
  >
    <template slot="imgUpload" slot-scope="{ click }">
      <mp-upload-image
        :uploadUrl="`${baseUrl}/api/local-storage/pictures`"
        :showUploadList="false"
        :click="click"
      ></mp-upload-image>
    </template>
  </mapgis-3d-projector-manager>
</template>
<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import { api, ProjectorManager } from '@mapgis/pan-spatial-map-common'

@Component({
  name: 'MpProjectorManager'
})
export default class MpProjectorManager extends Mixins(WidgetMixin) {
  private modelUrl = `${process.env.BASE_URL}CesiumModels/Cesium_Camera.glb`

  private modelOffset = { headingOffset: -90, pitchOffset: 0, rollOffset: 0 }

  private projectorLayerList = [
    {
      id: '123-345-567-789',
      name: 'test',
      projectorList: [
        {
          id: '987-765-543-321',
          name: 'testProjector1',
          description: '',
          isProjected: false,
          params: {
            projectorType: 'video',
            imgUrl: '',
            videoSource: {
              protocol: 'm3u8',
              videoUrl:
                'http://192.168.91.123:10008/record/video1/20211221/out.m3u8'
            },
            cameraPosition: {
              x: 114.401228136856,
              y: 30.467421377675457,
              z: 84.94989410478892
            },
            orientation: {
              heading: 6.053866507322313,
              pitch: -73.6,
              roll: 354.1
            },
            hFOV: 34.6,
            vFOV: 18.9,
            hintLineVisible: true
          }
        }
      ]
    }
  ]

  private ProjectorManagerInstance = ProjectorManager

  private maxProjected = 10

  private hideVPInvisible = false

  private get projectorOverlayLayerList() {
    const projectorOverlayLayerList = this.ProjectorManagerInstance.getProjectorOverlayLayerList()
    return projectorOverlayLayerList
  }

  private set projectorOverlayLayerList(projectorOverlayLayerList) {
    this.ProjectorManagerInstance.setProjectorOverlayLayerList(
      projectorOverlayLayerList
    )
  }

  private get currentLayerId() {
    const layerId = this.ProjectorManagerInstance.getCurrentLayerId()
    return layerId
  }

  private get currentProjectorId() {
    const projectorId = this.ProjectorManagerInstance.getCurrentProjectorId()
    return projectorId
  }

  @Watch('currentLayerId', {
    deep: true,
    immediate: true
  })
  changeCurrentLayerId() {
    console.log(this.currentLayerId)
  }

  @Watch('currentProjectorId', {
    deep: true,
    immediate: true
  })
  changeCurrentProjectorId() {
    console.log(this.currentProjectorId)
  }

  @Watch('projectorOverlayLayerList', {
    deep: true,
    immediate: true
  })
  changeProjectorOverlayLayerList() {
    console.log(this.projectorOverlayLayerList)
  }

  private config

  private projectorComponent = null

  mounted() {
    this.projectorOverlayLayerList =
      (this.widgetInfo.config &&
        this.widgetInfo.config.projectorOverlayLayerList) ||
      this.projectorLayerList
    this.maxProjected =
      (this.widgetInfo.config && this.widgetInfo.config.maxProjected) || 10
    this.hideVPInvisible =
      (this.widgetInfo.config && this.widgetInfo.config.hideVPInvisible) ||
      false
  }

  load(projectorComponent) {
    this.projectorComponent = projectorComponent
  }

  onActive() {
    this.projectorComponent.mount()
  }

  // 微件失活时
  onDeActive() {
    // 微件失活时自动保存配置到后台
    this.saveConfig()
    this.projectorComponent.unmount()
  }

  // 微件关闭时
  onClose() {
    // 微件失活时自动保存配置到后台
    this.saveConfig()
    this.projectorComponent.unmount()
  }

  imgUpload(e) {
    console.log(e)
  }

  updateProjectorOverlayLayerList(layerList) {
    this.projectorOverlayLayerList = [...layerList]
  }

  saveConfig() {
    console.log(this.projectorOverlayLayerList)
    const config = {
      projectorOverlayLayerList: [...this.projectorOverlayLayerList]
    }
    api
      .saveWidgetConfig({
        name: 'projector-manager',
        config: JSON.stringify(config)
      })
      .then(() => {
        // this.$message.success('更新projector配置成功')
        console.log('更新projector配置成功')
      })
      .catch(() => {
        // this.$message.error('更新projector配置失败')
        console.log('更新projector配置失败')
      })
  }
}
</script>
<style lang="less">
.projector-manager {
  width: 310px;
  max-width: 100%;
}
</style>
