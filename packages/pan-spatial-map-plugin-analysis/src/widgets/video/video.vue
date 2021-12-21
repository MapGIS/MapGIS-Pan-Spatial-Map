<template>
  <mapgis-3d-video-manager
    :videoOverlayLayerList="videoOverlayLayerList"
    @load="load"
    @update-config="updateConfig"
  >
  </mapgis-3d-video-manager>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import { api } from '@mapgis/pan-spatial-map-common'

@Component({
  name: 'MpVideo'
})
export default class MpVideo extends Mixins(WidgetMixin) {
  private videoLayerList = [
    {
      //  视频投放图层
      id: '123-345-567-789',
      name: 'test',
      videoList: [
        // 视频列表
        {
          id: '987-765-543-321', // 视频id
          name: 'testVideo1', // 视频名称
          description: '', // 描述
          isProjected: false, // 是否开启视频投放
          params: {
            videoSource: {
              protocol: 'mp4', // 视频传输协议
              videoUrl: 'http://localhost:8080/video/video1.mp4' // 视频服务地址
            },
            cameraPosition: { x: 0, y: 0, z: 0 }, // 相机位置
            orientation: {
              heading: 0, // 方向角
              pitch: 0, // 俯仰角
              roll: 0 // 滚动角
            },
            hFOV: 15, // 水平视场角
            vFOV: 15, // 垂直视场角
            hintLineVisible: true // 是否显示投放区域线
          }
        },
        {
          id: '987-765-543-123', // 视频id
          name: 'testVideo2', // 视频名称
          description: '', // 描述
          isProjected: false, // 是否开启视频投放
          params: {
            videoSource: {
              protocol: 'mp4', // 视频传输协议
              videoUrl: 'http://localhost:8080/video/video2.mp4' // 视频服务地址
            },
            cameraPosition: { x: 0, y: 0, z: 0 }, // 相机位置
            orientation: {
              heading: 0, // 方向角
              pitch: 0, // 俯仰角
              roll: 0 // 滚动角
            },
            hFOV: 15, // 水平视场角
            vFOV: 15, // 垂直视场角
            hintLineVisible: true // 是否显示投放区域线
          }
        }
      ]
    },
    {
      //  视频投放图层
      id: '567-789-123-345',
      name: 'layer2',
      videoList: [
        // 视频列表
        {
          id: '543-321-987-765', // 视频id
          name: 'layer2Video1', // 视频名称
          description: '', // 描述
          isProjected: false, // 是否开启视频投放
          params: {
            videoSource: {
              protocol: 'mp4', // 视频传输协议
              videoUrl: 'http://localhost:8080/video/video1.mp4' // 视频服务地址
            },
            cameraPosition: { x: 0, y: 0, z: 0 }, // 相机位置
            orientation: {
              heading: 0, // 方向角
              pitch: 0, // 俯仰角
              roll: 0 // 滚动角
            },
            hFOV: 15, // 水平视场角
            vFOV: 15, // 垂直视场角
            hintLineVisible: true // 是否显示投放区域线
          }
        }
      ]
    }
  ]

  private config

  get videoOverlayLayerList() {
    return (
      (this.widgetInfo.config &&
        this.widgetInfo.config.videoOverlayLayerList) ||
      this.videoLayerList
    )
  }

  private videoComponent = null

  load(videoComponent) {
    this.videoComponent = videoComponent
  }

  onActive() {
    this.videoComponent.mount()
  }

  // 微件失活时
  onDeActive() {
    this.videoComponent.unmount()
  }

  updateConfig(layerList) {
    console.log(layerList)
    const config = { videoOverlayLayerList: [...layerList] }
    api
      .saveWidgetConfig({
        name: 'video',
        config: JSON.stringify(config)
      })
      .then(() => {
        console.log('更新video配置成功')
      })
      .catch(() => {
        console.log('更新video配置失败')
      })
  }
}
</script>
<style lang="less"></style>
