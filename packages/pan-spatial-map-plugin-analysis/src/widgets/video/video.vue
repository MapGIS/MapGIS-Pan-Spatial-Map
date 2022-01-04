<template>
  <mapgis-3d-video-manager
    class="video-manager"
    :videoOverlayLayerList="videoOverlayLayerList"
    @load="load"
    @update-videoOverlayLayerList="updateVideoOverlayLayerList"
    :modelUrl="modelUrl"
    :modelOffset="modelOffset"
  >
  </mapgis-3d-video-manager>
</template>
<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import { api, VideoOverlayLayerList } from '@mapgis/pan-spatial-map-common'

@Component({
  name: 'MpVideo'
})
export default class MpVideo extends Mixins(WidgetMixin) {
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
        },
        {
          id: '987-765-543-123',
          name: 'testVideo2',
          description: '',
          isProjected: false,
          params: {
            videoSource: {
              protocol: 'm3u8',
              videoUrl:
                'http://192.168.91.123:10008/record/video2/20211221/out.m3u8'
            },
            cameraPosition: {
              x: 114.40088870656619,
              y: 30.467421563975016,
              z: 84.91172691510191
            },
            orientation: {
              heading: 359.89407747239846,
              pitch: -74.2,
              roll: 0
            },
            hFOV: 33.1,
            vFOV: 19.2,
            hintLineVisible: true
          }
        },
        {
          id: '987-765-543-124',
          name: 'testVideo3',
          description: '',
          isProjected: false,
          params: {
            videoSource: {
              protocol: 'm3u8',
              videoUrl:
                'http://192.168.91.123:10008/record/video3/20211221/out.m3u8'
            },
            cameraPosition: {
              x: 114.4006886798949,
              y: 30.467287432107295,
              z: 85.46751512564336
            },
            orientation: {
              heading: 271.628505216584,
              pitch: -78.4,
              roll: 359.3
            },
            hFOV: 32.5,
            vFOV: 19,
            hintLineVisible: true
          }
        }
      ]
    },
    {
      id: '567-789-123-345',
      name: 'layer2',
      videoList: [
        {
          id: '765-987-543-321',
          name: 'layer2Video1',
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
        },
        {
          id: '765-987-543-123',
          name: 'layer2Video2',
          description: '',
          isProjected: false,
          params: {
            videoSource: {
              protocol: 'm3u8',
              videoUrl:
                'http://192.168.91.123:10008/record/video2/20211221/out.m3u8'
            },
            cameraPosition: {
              x: 114.40088870656619,
              y: 30.467421563975016,
              z: 84.91172691510191
            },
            orientation: {
              heading: 359.89407747239846,
              pitch: -74.2,
              roll: 0
            },
            hFOV: 33.1,
            vFOV: 19.2,
            hintLineVisible: true
          }
        }
      ]
    }
  ]

  private VideoOverlayLayerListInstance = VideoOverlayLayerList

  private get videoOverlayLayerList() {
    const videoOverlayLayerList = this.VideoOverlayLayerListInstance.getVideoOverlayLayerList()
    return videoOverlayLayerList
  }

  private set videoOverlayLayerList(videoOverlayLayerList) {
    this.VideoOverlayLayerListInstance.setVideoOverlayLayerList(
      videoOverlayLayerList
    )
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

  load(videoComponent) {
    this.videoComponent = videoComponent
    this.videoOverlayLayerList =
      (this.widgetInfo.config &&
        this.widgetInfo.config.videoOverlayLayerList) ||
      this.videoLayerList
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
