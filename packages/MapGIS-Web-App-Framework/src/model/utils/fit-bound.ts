import {
  Layer,
  LayerType,
  IGSSceneSublayerRenderType,
  Scene
} from '../document/layer'
import { CoordinateTransformation } from './coordinate-transformation'
import * as Objects from '../objects'
import { CoordinateSystemType } from '../document/spatial-reference'
import ComputeZoomOffset from '../../utils/map-resolution-util.js'

export interface MapParams {
  webGlobe: unknown
  map: unknown
  Cesium: unknown
  CesiumZondy?: unknown
}

interface LevelDetail {
  level: number
  height: number
  minHeight: number
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
  private detectZoomLevel(distance: number, viewer: unknown): number | null {
    const scene = viewer.scene
    const tileProvider = scene.globe._surface.tileProvider
    const quadtree = tileProvider._quadtree
    // 整个屏幕像素高
    const drawingBufferHeight = viewer.canvas.height
    // sseDenominator是相机fovy角度的tan值的2倍
    const sseDenominator = viewer.camera.frustum.sseDenominator

    for (let level = 0; level <= 24; level++) {
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
        return level
      }
    }

    return null
  }

  /**
   * 获取level与相机高度关系数组
   * @param startLevel 起始层级（层级小于2时，球会卡死）
   * @param viewer
   * @returns level与相机高度关系数组
   */
  public getLevelDetails(viewer: unknown): Array<LevelDetail> {
    // 如果_cesiumLevelToHeights高度与层级关系已经计算出来了，则直接返回，不用多次计算
    if (this._cesiumLevelToHeights.length <= 0) {
      /**
       * 这里由于高度达到亿级别，普通循环计算量非常大，这里吧高度分为三段分别采用二分法来计算，提高计算速度
       * @修改人 龚瑞强
       * @date 2021/8/27
       */
      const largeDistances = this.getLevelByStep({
        step: 100000,
        initZoomLevel: 0,
        initHeight: 100000000,
        viewer
      })

      const normalDistances = this.getLevelByStep({
        step: 100,
        initZoomLevel: largeDistances[largeDistances.length - 1].level,
        initHeight: largeDistances[largeDistances.length - 1].minHeight,
        viewer
      })

      const littleDistances = this.getLevelByStep({
        step: 1,
        initZoomLevel: normalDistances[normalDistances.length - 1].level,
        initHeight: normalDistances[normalDistances.length - 1].minHeight,
        viewer
      })
      const levelHeights = [
        ...largeDistances,
        ...normalDistances,
        ...littleDistances
      ]
      // 由于这里设置的高度是最小高度，需要给增加一些高度（这里增加的值是最大高度与最小高度的四分之一），才能保证此高度在该层级范围内
      const arr: Array<LevelDetail> = []
      for (let index = 0; index < levelHeights.length; index++) {
        const element = levelHeights[index]
        if (index > 0) {
          const nearHeight =
            element.height +
            (levelHeights[index - 1].height - element.height) / 4
          arr.push({
            ...element,
            height: nearHeight
          })
        } else {
          arr.push(element)
        }
      }
      this._cesiumLevelToHeights = arr
    }
    return this._cesiumLevelToHeights
  }

  /**
   * 计算层级与最低高度的数组
   * @param step 步进器
   * @param initZoomLevel 初始层级
   * @param initHeight 初始高度
   * @param viewer 三维对象
   * @returns 层级与最低高度的数组
   */
  private getLevelByStep({
    step,
    initZoomLevel,
    initHeight,
    viewer
  }): Array<LevelDetail> {
    const result: Array<LevelDetail> = []
    let currentZoomLevel = initZoomLevel
    for (let height = initHeight; height >= 0; height -= step) {
      let currentHeight = height
      let preHeight = height + step
      /**
       * @description 当此次算出来的层级与上次算出来的层级不同，则采用去上次高度与此次高度的中间值进行计算，
       * 直到上次高度与此次高度差值只有1的时候，则可以计算出来临界值。这样采用二分法计算速度比普通的循环速度快很多
       */
      let level = this.detectZoomLevel(currentHeight, viewer)
      let preLevel = this.detectZoomLevel(preHeight, viewer)
      if (
        level !== null &&
        level !== undefined &&
        level !== currentZoomLevel &&
        preLevel === currentZoomLevel
      ) {
        while (preHeight - currentHeight > 1) {
          level = this.detectZoomLevel(currentHeight, viewer)
          // 当此次算出来的层级与上次算出来的层级不同，则认为当前高度为该层级最小高度
          preLevel = this.detectZoomLevel(preHeight, viewer)
          if (
            level !== null &&
            level !== undefined &&
            level !== currentZoomLevel &&
            preLevel === currentZoomLevel
          ) {
            preHeight = currentHeight + (preHeight - currentHeight) / 2
          } else if (
            level !== null &&
            level !== undefined &&
            level !== currentZoomLevel &&
            preLevel !== currentZoomLevel
          ) {
            // 如果两次算得的层级一样，中间值偏大。需要把currentHeight设为此次的高度，然后继续使用二分法进行查找
            const num = preHeight - currentHeight
            currentHeight = preHeight
            preHeight = currentHeight + num
          }
        }
        result.push({
          level: currentZoomLevel,
          height: parseInt(preHeight),
          minHeight: parseInt(preHeight)
        })
        currentZoomLevel++
      }
    }
    return result
  }

  /**
   * 通过层级获取相机高度
   * @param startLevel 初始层级
   * @param viewer
   * @returns
   */
  private getCameraHeightByLevel(
    startLevel: number,
    viewer: unknown
  ): number | undefined {
    startLevel = startLevel <= 2 ? 2 : startLevel
    this.getLevelDetails(viewer)
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
    level?: number | undefined
  ) {
    const { xmin, ymin, xmax, ymax } = bound
    const { webGlobe, Cesium } = mapParams
    // 如果获取不到对应层级的高度则还是用范围缩放
    if (level !== undefined) {
      const cameraHeight = this.getCameraHeightByLevel(level, webGlobe.viewer)
      if (cameraHeight !== undefined) {
        const center = new Cesium.Cartesian3.fromDegrees(
          (xmin + xmax) / 2,
          (ymin + ymax) / 2,
          cameraHeight
        )
        webGlobe.viewer.camera.flyTo({
          destination: center
        })
      }
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
    let zoomOffset: number
    switch (type) {
      case LayerType.ArcGISTile:
      case LayerType.IGSTile:
        startLevel = layer.tileInfo.lods[0].levelValue
        // 由于三维ArcGISTile、IGSTile没有设置瓦片的偏移量，所以这里不需要计算
        if (is2DMap) {
          zoomOffset = ComputeZoomOffset.getZoomOffsetByTileInfo(
            layer.tileInfo,
            !is2DMap
          )
          // 修改说明：由于Tile设置了偏移量zoomOffset,为了保证刚好缩放到Tile的起始级别，需要将startLevel-zoomOffset
          startLevel -= zoomOffset
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
        zoomOffset = ComputeZoomOffset.getZoomOffsetByTileInfo(
          tileMatrixSet.tileInfo,
          !is2DMap
        )
        startLevel -= zoomOffset
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
