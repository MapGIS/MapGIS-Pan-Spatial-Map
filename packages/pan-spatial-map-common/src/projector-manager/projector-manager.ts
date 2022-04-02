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
  projectorType: string
  imgUrl: string
  videoSource: VideoSource
  cameraPosition: CameraPosition
  orientation: Orientation
  hFOV: number
  vFOV: number
  hintLineVisible: boolean
}

export interface Projector {
  id: string
  name: string
  description: string
  isProjected: boolean
  params: Params
}

export interface ProjectorOverlayLayer {
  id: string
  name: string
  projectorList: Array<Projector>
}

class ProjectorOverlayLayerList {
  // 图层列表
  private _projectorOverlayLayerList: Array<ProjectorOverlayLayer> = []

  // 当前图层id
  private _currentLayerId = ''

  // 当前projector的id
  private _currentProjectorId = ''

  /**
   * 获取projectorOverlayLayerList
   * @returns
   */
  public getProjectorOverlayLayerList() {
    return this._projectorOverlayLayerList
  }

  /**
   * 设置projectorOverlayLayerList
   * @param projectorOverlayLayerList
   */
  public setProjectorOverlayLayerList(
    projectorOverlayLayerList: Array<ProjectorOverlayLayer>
  ) {
    this._projectorOverlayLayerList = [...projectorOverlayLayerList]
  }

  /**
   * 获取当前图层id
   * @returns
   */
  public getCurrentLayerId() {
    return this._currentLayerId
  }

  /**
   * 获取当前projector的id
   * @returns
   */
  public getCurrentProjectorId() {
    return this._currentProjectorId
  }

  /**
   * 根据图层的id获取图层
   * @param layerId 图层的id
   * @returns
   */
  public getProjectorLayerById(layerId: string) {
    const projectorOverlayLayer = this._projectorOverlayLayerList.find(
      (layer) => layer.id === layerId
    )
    if (projectorOverlayLayer) {
      return projectorOverlayLayer
    }
    return null
  }

  /**
   * 根据图层id和projector的id获取projector对象
   * @param projectorId projector的id
   * @param layerId 图层的id
   * @returns
   */
  public getProjectorById(projectorId: string, layerId: string) {
    const projectorOverlayLayer = this.getProjectorLayerById(layerId)
    let projector
    if (projectorOverlayLayer) {
      projector = projectorOverlayLayer.projectorList.find(
        (projector) => projector.id === projectorId
      )
      if (projector) {
        return projector
      }
    }
    return undefined
  }

  /**
   * 添加projector
   * @param layerId  图层的id
   * @param layerName 图层名
   * @param projectorId  projector的id
   * @param projectorName projector的name
   * @param projectorType 投放类型['video','image']
   * @param protocol 视频协议
   * @param videoUrl 视频url
   * @param imgUrl 图片地址
   * @param description 描述
   * @param isProjected 是否投放
   * @param cameraPosition 相机位置(观察点)
   * @param orientation 朝向
   * @param hFOV 水平视角
   * @param vFOV 垂直视角
   * @param hintLineVisible 是否显示锥体线
   * @param imgUrl 图片地址
   * @param isOverwrite 是否覆盖已存在的projector对象(如果传入的id已存在对应的projector对象，是否覆盖已有的projector对象，设置否，则不会应用传入的内容)
   */
  public addProjector(
    layerId: string,
    layerName: string,
    projectorId: string,
    projectorName: string,
    projectorType: string,
    protocol?: string,
    videoUrl?: string,
    imgUrl?: string,
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
    const projectorOverlayLayer = this.getProjectorLayerById(layerId)
    if (projectorOverlayLayer) {
      // 2.如果图层存在，再找是否存在对应的projector
      let projector = this.getProjectorById(projectorId, layerId)
      let newProjector
      if (projector) {
        if (isOverwrite) {
          // 已存在id对应的projector，覆盖已有内容
          newProjector = {
            id: projectorId,
            name: projectorName || projector.name,
            description: description || projector.description,
            isProjected: isProjected || projector.isProjected,
            params: {
              projectorType,
              imgUrl,
              videoSource: {
                protocol,
                videoUrl,
              },
              cameraPosition: cameraPosition || projector.params.cameraPosition,
              orientation: orientation || projector.params.orientation,
              hFOV: hFOV || projector.params.hFOV,
              vFOV: vFOV || projector.params.vFOV,
              hintLineVisible:
                hintLineVisible || projector.params.hintLineVisible,
            },
          }
          projector = { ...newProjector }
        }
      } else {
        newProjector = {
          id: projectorId,
          name: projectorName || 'newProjector',
          description: description || '',
          isProjected: isProjected || false,
          params: {
            projectorType,
            imgUrl,
            videoSource: {
              protocol,
              videoUrl,
            },
            cameraPosition: cameraPosition || {
              x: 0,
              y: 0,
              z: 0,
            },
            orientation: orientation || {
              heading: 0,
              pitch: 0,
              roll: 0,
            },
            hFOV: hFOV || 15,
            vFOV: vFOV || 15,
            hintLineVisible: hintLineVisible || true,
          },
        }
        projectorOverlayLayer.projectorList.push(newProjector)
      }
    } else {
      // 未找到overlayLayerName对应的图层，新建图层
      const newProjectorOverlayLayer: ProjectorOverlayLayer = {
        id: layerId,
        name: layerName,
        projectorList: [
          {
            id: projectorId,
            name: projectorName || 'newProjector',
            description: description || '',
            isProjected: isProjected || false,
            params: {
              projectorType,
              imgUrl: imgUrl || '',
              videoSource: {
                protocol: protocol || '',
                videoUrl: videoUrl || '',
              },
              cameraPosition: cameraPosition || {
                x: 0,
                y: 0,
                z: 0,
              },
              orientation: orientation || {
                heading: 0,
                pitch: 0,
                roll: 0,
              },
              hFOV: hFOV || 15,
              vFOV: vFOV || 15,
              hintLineVisible: hintLineVisible || true,
            },
          },
        ],
      }
      this._projectorOverlayLayerList.push(newProjectorOverlayLayer)
    }
    this._currentLayerId = layerId
    this._currentProjectorId = projectorId
  }

  /**
   * 获取projector投放状态
   * @param projectorId
   * @param layerId
   * @returns
   */
  public getProjectorStatus(projectorId: string, layerId: string) {
    const projector = this.getProjectorById(projectorId, layerId)
    if (projector) {
      return projector.isProjected
    }
    return false
  }

  /**
   * 设置projector投放状态
   * @param projectorId
   * @param layerId
   * @param isProjected
   */
  public setProjectorStatus(
    projectorId: string,
    layerId: string,
    isProjected: boolean
  ) {
    const projector = this.getProjectorById(projectorId, layerId)
    if (projector) {
      projector.isProjected = isProjected
    }
  }
}

export default new ProjectorOverlayLayerList()
