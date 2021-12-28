import { UUID } from '@mapgis/web-app-framework'

export interface Orientation {
  heading: number
  pitch: number
  roll: number
}

export interface VideoSource {
  protocol: string
  videoUrl: string
}

export interface CameraPosition {
  x: number
  y: number
  z: number
}

export interface Params {
  videoSource: VideoSource
  cameraPosition: CameraPosition
  orientation: Orientation
  hFOV: number
  vFOV: number
  hintLineVisible: boolean
}

export interface Video {
  id: string
  name: string
  description: string
  isProjected: boolean
  params: Params
}

export interface VideoOverlayLayer {
  id: string
  name: string
  videoList: Array<Video>
}

class VideoOverlayLayerList {
  public _videoOverlayLayerList: Array<VideoOverlayLayer> = []

  /**
   * 获取videoOverlayLayerList
   * @returns
   */
  public getVideoOverlayLayerList() {
    return this._videoOverlayLayerList
  }

  /**
   * 设置videoOverlayLayerList
   * @param videoOverlayLayerList
   */
  public setVideoOverlayLayerList(
    videoOverlayLayerList: Array<VideoOverlayLayer>
  ) {
    this._videoOverlayLayerList = [...videoOverlayLayerList]
  }

  /**
   * 根据video的id和图层名，查找video
   * @param id video的id
   * @param overlayLayerName 图层名
   * @returns video对象或者null
   */
  public getVideoByIdAndOverlayLayerName(
    id: string,
    overlayLayerName: string
  ): Video | null {
    // 1.先找是否存在对应的图层
    const videoOverlayLayer = this._videoOverlayLayerList.find(
      layer => layer.name === overlayLayerName
    )
    if (videoOverlayLayer) {
      // 2.如果图层存在，再找是否存在对应的video
      const video = videoOverlayLayer.videoList.find(video => video.id === id)
      if (video) {
        return video
      }
    }
    // 没有找到对应的图层和对应的video，则返回null
    return null
  }

  /**
   * 添加video
   * @param id  video的id
   * @param overlayLayerName 图层名
   * @param protocol 视频协议
   * @param videoUrl 视频url
   * @param name video的name
   * @param description 描述
   * @param isProjected 是否已投放
   * @param cameraPosition 相机位置(观察点)
   * @param orientation 朝向
   * @param hFOV 水平视角
   * @param vFOV 垂直视角
   * @param hintLineVisible 是否显示锥体线
   * @param isOverwrite 是否覆盖已存在的video对象(如果传入的id已存在对应的video对象，是否覆盖已有的video对象，设置否，则不会应用传入的内容)
   */
  public addVideo(
    id: string,
    overlayLayerName: string,
    protocol: string,
    videoUrl: string,
    name?: string,
    description?: string,
    isProjected?: boolean,
    cameraPosition?: CameraPosition,
    orientation?: Orientation,
    hFOV?: number,
    vFOV?: number,
    hintLineVisible?: boolean,
    isOverwrite?: boolean
  ) {
    // 1.先找是否存在对应的图层
    const videoOverlayLayer = this._videoOverlayLayerList.find(
      layer => layer.name === overlayLayerName
    )
    if (videoOverlayLayer) {
      // 2.如果图层存在，再找是否存在对应的video
      let video = videoOverlayLayer.videoList.find(video => video.id === id)
      let newVideo
      if (video) {
        if (isOverwrite) {
          // 已存在id对应的video，覆盖已有内容
          newVideo = {
            id,
            name: name || video.name,
            description: description || video.description,
            isProjected: isProjected || video.isProjected,
            params: {
              videoSource: {
                protocol,
                videoUrl
              },
              cameraPosition: cameraPosition || video.params.cameraPosition,
              orientation: orientation || video.params.orientation,
              hFOV: hFOV || video.params.hFOV,
              vFOV: vFOV || video.params.vFOV,
              hintLineVisible: hintLineVisible || video.params.hintLineVisible
            }
          }
          video = { ...newVideo }
        }
      } else {
        newVideo = {
          id,
          name: name || 'newVideo',
          description: description || '',
          isProjected: isProjected || false,
          params: {
            videoSource: {
              protocol,
              videoUrl
            },
            cameraPosition: cameraPosition || {
              x: 0,
              y: 0,
              z: 0
            },
            orientation: orientation || {
              heading: 0,
              pitch: 0,
              roll: 0
            },
            hFOV: hFOV || 15,
            vFOV: vFOV || 15,
            hintLineVisible: hintLineVisible || true
          }
        }
        videoOverlayLayer.videoList.push(newVideo)
      }
    } else {
      // 未找到overlayLayerName对应的图层，新建图层
      const newVideoOverlayLayer = {
        id: UUID.uuid(),
        name: overlayLayerName,
        videoList: [
          {
            id,
            name: name || 'newVideo',
            description: description || '',
            isProjected: isProjected || false,
            params: {
              videoSource: {
                protocol,
                videoUrl
              },
              cameraPosition: cameraPosition || {
                x: 0,
                y: 0,
                z: 0
              },
              orientation: orientation || {
                heading: 0,
                pitch: 0,
                roll: 0
              },
              hFOV: hFOV || 15,
              vFOV: vFOV || 15,
              hintLineVisible: hintLineVisible || true
            }
          }
        ]
      }
      this._videoOverlayLayerList.push(newVideoOverlayLayer)
    }
  }

  /**
   * 获取video投放状态
   * @param id
   * @param overlayLayerName
   * @returns
   */
  public getVideoStatus(id: string, overlayLayerName: string) {
    const video = this.getVideoByIdAndOverlayLayerName(id, overlayLayerName)
    if (video) {
      return video.isProjected
    }
    return null
  }

  /**
   * 设置video投放状态
   * @param id
   * @param overlayLayerName
   * @param isProjected
   */
  public setVideoStatus(
    id: string,
    overlayLayerName: string,
    isProjected: boolean
  ) {
    const video = this.getVideoByIdAndOverlayLayerName(id, overlayLayerName)
    if (video) {
      video.isProjected = isProjected
    }
  }
}

export default new VideoOverlayLayerList()
