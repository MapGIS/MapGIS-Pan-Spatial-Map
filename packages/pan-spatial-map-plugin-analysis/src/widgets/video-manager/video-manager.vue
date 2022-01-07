<template>
  <mapgis-3d-video-manager
    class="video-manager"
    :videoOverlayLayerList="videoOverlayLayerList"
    :modelUrl="modelUrl"
    :modelOffset="modelOffset"
    :currentLayerId="currentLayerId"
    :currentVideoId="currentVideoId"
    :maxProjected="maxProjected"
    @load="load"
    @update-videoOverlayLayerList="updateVideoOverlayLayerList"
  >
  </mapgis-3d-video-manager>
</template>
<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import { api, VideoManager } from '@mapgis/pan-spatial-map-common'

@Component({
  name: 'MpVideoManager'
})
export default class MpVideoManager extends Mixins(WidgetMixin) {
  private modelUrl = './CesiumModels/Cesium_Camera.glb'

  private modelOffset = { headingOffset: -90, pitchOffset: 0, rollOffset: 0 }

  private videoLayerList = [
    {
      id: '123-345-567-789',
      name: 'test',
      videoList: [
        {
          id: '987-765-543-321',
          name: 'testVideo1',
          description: '',
          isProjected: false,
          params: {
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

  private VideoManagerInstance = VideoManager

  private maxProjected = 10

  private get videoOverlayLayerList() {
    const videoOverlayLayerList = this.VideoManagerInstance.getVideoOverlayLayerList()
    return videoOverlayLayerList
  }

  private set videoOverlayLayerList(videoOverlayLayerList) {
    this.VideoManagerInstance.setVideoOverlayLayerList(videoOverlayLayerList)
  }

  private get currentLayerId() {
    const layerId = this.VideoManagerInstance.getCurrentLayerId()
    return layerId
  }

  private get currentVideoId() {
    const videoId = this.VideoManagerInstance.getCurrentVideoId()
    return videoId
  }

  @Watch('currentLayerId', {
    deep: true,
    immediate: true
  })
  changeCurrentLayerId() {
    console.log(this.currentLayerId)
  }

  @Watch('currentVideoId', {
    deep: true,
    immediate: true
  })
  changeCurrentVideoId() {
    console.log(this.currentVideoId)
  }

  @Watch('videoOverlayLayerList', {
    deep: true,
    immediate: true
  })
  changeVideoOverlayLayerList() {
    console.log(this.videoOverlayLayerList)
  }

  private config

  private videoComponent = null

  mounted() {
    this.videoOverlayLayerList =
      (this.widgetInfo.config &&
        this.widgetInfo.config.videoOverlayLayerList) ||
      this.videoLayerList
    this.maxProjected =
      (this.widgetInfo.config && this.widgetInfo.config.maxProjected) || 10
  }

  load(videoComponent) {
    this.videoComponent = videoComponent
  }

  onActive() {
    this.videoComponent.mount()
  }

  // 微件失活时
  onDeActive() {
    // 微件失活时自动保存配置到后台
    this.saveConfig()
    this.videoComponent.unmount()
  }

  updateVideoOverlayLayerList(layerList) {
    this.videoOverlayLayerList = [...layerList]
  }

  saveConfig() {
    console.log(this.videoOverlayLayerList)
    const config = { videoOverlayLayerList: [...this.videoOverlayLayerList] }
    api
      .saveWidgetConfig({
        name: 'video',
        config: JSON.stringify(config)
      })
      .then(() => {
        // this.$message.success('更新video配置成功')
        console.log('更新video配置成功')
      })
      .catch(() => {
        // this.$message.error('更新video配置失败')
        console.log('更新video配置失败')
      })
  }
}
</script>
<style lang="less">
.video-manager {
  width: 310px;
  max-width: 100%;
}
</style>
