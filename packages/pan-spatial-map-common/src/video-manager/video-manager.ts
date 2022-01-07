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
  // 图层列表
  private _videoOverlayLayerList: Array<VideoOverlayLayer> = []

  // 当前图层id
  private _currentLayerId = ''

  // 当前video的id
  private _currentVideoId = ''

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
   * 获取当前图层id
   * @returns
   */
  public getCurrentLayerId() {
    return this._currentLayerId
  }

  /**
   * 获取当前video的id
   * @returns
   */
  public getCurrentVideoId() {
    return this._currentVideoId
  }

  /**
   * 根据图层的id获取图层
   * @param layerId 图层的id
   * @returns
   */
  public getVideoLayerById(layerId: string) {
    const videoOverlayLayer = this._videoOverlayLayerList.find(
      layer => layer.id === layerId
    )
    if (videoOverlayLayer) {
      return videoOverlayLayer
    }
    return null
  }

  /**
   * 根据图层id和video的id获取video对象
   * @param videoId video的id
   * @param layerId 图层的id
   * @returns
   */
  public getVideoById(videoId: string, layerId: string) {
    const videoOverlayLayer = this.getVideoLayerById(layerId)
    let video
    if (videoOverlayLayer) {
      video = videoOverlayLayer.videoList.find(video => video.id === videoId)
      if (video) {
        return video
      }
    }
    return undefined
  }

  /**
   * 添加video
   * @param layerId  图层的id
   * @param layerName 图层名
   * @param videoId  video的id
   * @param videoName video的name
   * @param protocol 视频协议
   * @param videoUrl 视频url
   * @param description 描述
   * @param isProjected 是否投放
   * @param cameraPosition 相机位置(观察点)
   * @param orientation 朝向
   * @param hFOV 水平视角
   * @param vFOV 垂直视角
   * @param hintLineVisible 是否显示锥体线
   * @param isOverwrite 是否覆盖已存在的video对象(如果传入的id已存在对应的video对象，是否覆盖已有的video对象，设置否，则不会应用传入的内容)
   */
  public addVideo(
    layerId: string,
    layerName: string,
    videoId: string,
    videoName: string,
    protocol: string,
    videoUrl: string,
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
    const videoOverlayLayer = this.getVideoLayerById(layerId)
    if (videoOverlayLayer) {
      // 2.如果图层存在，再找是否存在对应的video
      let video = this.getVideoById(videoId, layerId)
      let newVideo
      if (video) {
        if (isOverwrite) {
          // 已存在id对应的video，覆盖已有内容
          newVideo = {
            id: videoId,
            name: videoName || video.name,
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
          id: videoId,
          name: videoName || 'newVideo',
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
        id: layerId,
        name: layerName,
        videoList: [
          {
            id: videoId,
            name: videoName || 'newVideo',
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
    this._currentLayerId = layerId
    this._currentVideoId = videoId
  }

  /**
   * 获取video投放状态
   * @param videoId
   * @param layerId
   * @returns
   */
  public getVideoStatus(videoId: string, layerId: string) {
    const video = this.getVideoById(videoId, layerId)
    if (video) {
      return video.isProjected
    }
    return false
  }

  /**
   * 设置video投放状态
   * @param videoId
   * @param layerId
   * @param isProjected
   */
  public setVideoStatus(
    videoId: string,
    layerId: string,
    isProjected: boolean
  ) {
    const video = this.getVideoById(videoId, layerId)
    if (video) {
      video.isProjected = isProjected
    }
  }
}

export default new VideoOverlayLayerList()
