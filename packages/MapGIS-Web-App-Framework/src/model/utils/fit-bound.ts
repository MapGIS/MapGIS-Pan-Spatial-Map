import {
  Layer,
  LayerType,
  IGSSceneSublayerRenderType,
  Scene
} from '../document/layer'
import { CoordinateTransformation } from './coordinate-transformation'
import * as Objects from '../objects'
import { CoordinateSystemType } from '../document/spatial-reference'

export interface MapParams {
  webGlobe: unknown
  map: unknown
  Cesium: unknown
  CesiumZondy?: unknown
}

interface LevelDetail {
  level?: number
  height?: number
  resolution?: number
}

class FitBound {
  // 记录cesium相机高度与层级对应关系的数组
  private _cesiumLevelToHeights: Array<LevelDetail> = []

  public get cesiumLevelToHeights(): Array<LevelDetail> {
    return this._cesiumLevelToHeights
  }

  /**
   * 计算该相机距离距离对应的层级与分辨率
   * @param distance 相机距离该Tile的真实距离
   * @param viewer cesium对象
   * @returns
   */
  private detectZoomLevel(distance: number, viewer: unknown): LevelDetail {
    const scene = viewer.scene
    const tileProvider = scene.globe._surface.tileProvider
    const quadtree = tileProvider._quadtree
    // 整个屏幕像素高
    const drawingBufferHeight = viewer.canvas.height
    // sseDenominator是相机fovy角度的tan值的2倍
    const sseDenominator = viewer.camera.frustum.sseDenominator

    for (let level = 0; level <= 19; level++) {
      // maxGeometricError是地球赤道的周长/像素数，一个像素代表多少米(该层级下最大的几何误差)
      const maxGeometricError = tileProvider.getLevelMaximumGeometricError(
        level
      )

      /** =========以下是公式(maxGeometricError * drawingBufferHeight) / (distance * sseDenominator) 的分解=============== */

      // 根据三角函数的公式可以算得相机距离屏幕中心的像素距离
      const far = drawingBufferHeight / sseDenominator
      // 相机距离屏幕中心的米单位距离（垂直距离）
      const L = maxGeometricError * far
      //  sse 屏幕空间误差
      const error = L / distance
      // 如果屏幕空间误差小于maximumScreenSpaceError最大屏幕空间误差，则返回当前层级
      if (error < quadtree.maximumScreenSpaceError) {
        return { level, resolution: maxGeometricError }
      }
    }

    return {}
  }

  /**
   * 获取level与相机高度关系数组
   * @param startLevel 起始层级（层级小于2时，球会卡死）
   * @param viewer
   * @returns
   */
  private getZoomLevelHeights(
    startLevel: number,
    viewer: unknown
  ): number | undefined {
    startLevel = startLevel <= 2 ? 2 : startLevel

    if (this._cesiumLevelToHeights.length <= 0) {
      // 计算层级高度是最小误差
      const precision = 1

      // 递减的高度
      let step = 100000.0

      // 记录level的数组
      const result: Array<LevelDetail> = []

      let currentZoomLevel = 0

      for (let height = 100000000.0; height > step; height -= step) {
        const { level, resolution } = this.detectZoomLevel(height, viewer)
        if (level === undefined) {
          break
        }

        if (level !== currentZoomLevel) {
          let minHeight = height
          let maxHeight = height + step
          while (maxHeight - minHeight > precision) {
            height = minHeight + (maxHeight - minHeight) / 2
            if (this.detectZoomLevel(height, viewer).level === level) {
              minHeight = height
            } else {
              maxHeight = height
            }
          }

          result.push({
            level,
            height: Math.round(height),
            resolution
          })

          currentZoomLevel = level

          if (result.length >= 2) {
            step =
              ((result[result.length - 2].height as number) - height) / 1000.0
          }
        }
      }
      this._cesiumLevelToHeights = result
    }

    return this._cesiumLevelToHeights.find(x => x.level === startLevel)?.height
  }

  /**
   * @param bound 范围
   * @param mapParams 地图对象参数
   * @param level 是否带初始缩放级别
   */
  public fitBound2D(
    bound: Objects.Bound,
    mapParams: MapParams,
    level?: number
  ): void {
    const { xmin, ymin, xmax, ymax } = bound
    const { map } = mapParams
    if (level !== undefined) {
      map.flyTo({
        center: [(xmin + xmax) / 2, (ymin + ymax) / 2],
        zoom: level
      })
    } else {
      map.fitBounds([xmin, ymin, xmax, ymax])
    }
  }

  /**
   * @param bound 范围
   * @param mapParams 地图对象参数
   * @param level 是否带初始缩放级别
   */
  public fitBound3D(
    bound: Objects.Bound,
    mapParams: MapParams,
    level?: number
  ) {
    const { xmin, ymin, xmax, ymax } = bound
    const { webGlobe, Cesium } = mapParams
    // 如果获取不到对应层级的高度则还是用范围缩放
    if (
      level !== undefined &&
      this.getZoomLevelHeights(level, webGlobe.viewer) !== undefined
    ) {
      const center = new Cesium.Cartesian3.fromDegrees(
        (xmin + xmax) / 2,
        (ymin + ymax) / 2,
        this.getZoomLevelHeights(level, webGlobe.viewer)
      )
      webGlobe.viewer.camera.flyTo({
        destination: center
      })
    } else {
      const rectangle = new Cesium.Rectangle.fromDegrees(xmin, ymin, xmax, ymax)
      webGlobe.viewer.camera.flyTo({
        destination: rectangle
      })
    }
  }

  /**
   * 跳转
   * @param layer 图层对象
   * @param mapParams 地图对象
   * @param is2DMap 当前地图模式
   */
  public fitBoundByLayer(layer: Layer, mapParams: MapParams, is2DMap: boolean) {
    const { webGlobe, map, Cesium, CesiumZondy } = mapParams

    const sceneController = Objects.SceneController.getInstance(
      Cesium,
      CesiumZondy,
      webGlobe
    )

    const { type } = layer
    let fullExtent: Objects.Bound | null = null
    let fullExtentJWD: Objects.Bound = {
      xmin: 0.0,
      ymin: 0.0,
      xmax: 0.0,
      ymax: 0.0
    }

    // 1.获取图层全图范围

    if (type !== LayerType.IGSScene) {
      // 1.1 非三维图层直接从图层上取范围
      fullExtent = layer.fullExtent
    } else {
      // 1.2 三维图层的范围需要单独计算范围
      // 1.2.1 三维模型缓存子图层中记录的是模型在局部坐标系下的范围,需要转换为经纬度下的范围。
      // 1.2.2 三维地形子图层直接采用子图层中记录的范围。
      const activeScene: Scene = layer.activeScene
      let range: Objects.Bound = null

      activeScene.sublayers.forEach(item => {
        switch (item.renderType) {
          case IGSSceneSublayerRenderType.elevation:
            range = item.range
            break
          case IGSSceneSublayerRenderType.modelCache:
            range = sceneController.layerLocalExtentToGlobelExtent(item)
            break
          default:
            break
        }
      })

      fullExtent = range
    }

    // 2.将全图范围统一转换为经纬度
    if (
      layer.spatialReference &&
      layer.spatialReference.wkid === CoordinateSystemType.webMercator
    ) {
      const xminYminConverted = CoordinateTransformation.mercatorToWGS84([
        fullExtent.xmin,
        fullExtent.ymin
      ])
      const xmaxYmaxConverted = CoordinateTransformation.mercatorToWGS84([
        fullExtent.xmax,
        fullExtent.ymax
      ])

      fullExtentJWD.xmin = xminYminConverted[0]
      fullExtentJWD.ymin = xminYminConverted[1]

      fullExtentJWD.xmax = xmaxYmaxConverted[0]
      fullExtentJWD.ymax = xmaxYmaxConverted[1]
    } else {
      fullExtentJWD = fullExtent
    }

    // 3.根据图层类型的不同,进行不同的复位操作。
    // a.瓦片图层(IGSTile、ArcGISTile、OGCWMTS)将视图跳转到以图层全图范围为中心，以瓦片支持的最小级别为级别的视图下。
    // b.其它图层，将当前视图跳转到以图层全图范围为范围的视图下。
    let startLevel: number
    switch (type) {
      case LayerType.ArcGISTile:
      case LayerType.IGSTile:
        // case LayerType.ArcGISTile:
        // case LayerType.OGCWMTS:
        startLevel = layer.titleInfo.lods[0].level

        // 修改说明：对于经纬度的IGSTile图层,WebClient-vue的mapgis-igs-tile-layer组件在显示时,会默认将zoomOffset设为-1.
        // 故这里为了保证刚好缩放到IGSTile的起始级别，需要将startLevel+1.
        // 修改人：马原野 2021年7月29日
        // 修改说明：这里spatialReference克隆的有问题,不是一个真正的对象,故无法调用其上面的方法,需要优化。
        // 修改人：马原野 2021年7月29日
        if (layer.spatialReference.isWGS84()) {
          startLevel++
        }
        if (is2DMap) {
          this.fitBound2D(fullExtentJWD, mapParams, startLevel)
        } else {
          this.fitBound3D(fullExtentJWD, mapParams, startLevel)
        }
        break
      case LayerType.OGCWMTS:
        const tileMatrixSet = layer.activeLayer.tileMatrixSet
        startLevel = tileMatrixSet.tileInfo.lods[0].levelValue
        if (layer.spatialReference.isWGS84()) {
          startLevel++
        }
        if (is2DMap) {
          this.fitBound2D(fullExtentJWD, mapParams, startLevel)
        } else {
          this.fitBound3D(fullExtentJWD, mapParams, startLevel)
        }
        break
      default:
        if (is2DMap) {
          this.fitBound2D(fullExtentJWD, mapParams)
        } else {
          this.fitBound3D(fullExtentJWD, mapParams)
        }
        break
    }
  }
}

export default new FitBound()
