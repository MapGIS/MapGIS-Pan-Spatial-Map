import {
  Layer,
  LayerType,
  IGSSceneSublayerRenderType,
  Scene,
  CoordinateTransformation,
  CoordinateSystemType,
  Objects,
  Bound
} from '@mapgis/web-app-framework'

export interface MapParams {
  webGlobe: unknown
  map: unknown
  Cesium: unknown
  CesiumZondy?: unknown
}

// 将zoom转换为相机高度（该处算法是近似计算）
function zoomToHeight(zoom: number) {
  // 最小层级从2开始
  const level = zoom <= 0 ? 2 : zoom + 2
  const A = 40487.57
  const B = 0.00007096758
  const C = 91610.74
  const D = -40467.74
  const x = (A - D) / (level - D) - 1
  // eslint-disable-next-line no-restricted-properties
  const height = Math.round(Math.pow(x, 1 / B) * C)
  return height
}

export const fitBoundByLayer = (layer: Layer, mapParams: MapParams) => {
  const { webGlobe, map, Cesium, CesiumZondy } = mapParams

  const sceneController = Objects.SceneController.getInstance(
    Cesium,
    CesiumZondy,
    webGlobe
  )

  const { type } = layer
  let fullExtent: Bound | null = null
  let fullExtentJWD: Bound = { xmin: 0.0, ymin: 0.0, xmax: 0.0, ymax: 0.0 }

  // 1.获取图层全图范围

  if (type !== LayerType.IGSScene) {
    // 1.1 非三维图层直接从图层上取范围
    fullExtent = layer.fullExtent
  } else {
    // 1.2 三维图层的范围需要单独计算范围
    // 1.2.1 三维模型缓存子图层中记录的是模型在局部坐标系下的范围,需要转换为经纬度下的范围。
    // 1.2.2 三维地形子图层直接采用子图层中记录的范围。
    const activeScene: Scene = layer.activeScene
    let range: Bound = null

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

      fitBound2D(fullExtentJWD, mapParams, startLevel)
      fitBound3D(fullExtentJWD, mapParams, startLevel)

      break
    case LayerType.OGCWMTS:
      const tileMatrixSet = layer.activeLayer.tileMatrixSet
      startLevel = tileMatrixSet.tileInfo.lods[0].levelValue
      if (layer.spatialReference.isWGS84()) {
        startLevel++
      }

      fitBound2D(fullExtentJWD, mapParams, startLevel)
      fitBound3D(fullExtentJWD, mapParams, startLevel)
      break
    default:
      fitBound2D(fullExtentJWD, mapParams)
      fitBound3D(fullExtentJWD, mapParams)
      break
  }
}

/**
 * @param bound 范围
 * @param mapParams 地图对象参数
 * @param level 是否带初始缩放级别
 */
export const fitBound2D = (
  bound: Bound,
  mapParams: MapParams,
  level?: number
) => {
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
export const fitBound3D = (
  bound: Bound,
  mapParams: MapParams,
  level?: number
) => {
  const { xmin, ymin, xmax, ymax } = bound
  const { webGlobe, Cesium } = mapParams
  if (level !== undefined) {
    const center = new Cesium.Cartesian3.fromDegrees(
      (xmin + xmax) / 2,
      (ymin + ymax) / 2,
      zoomToHeight(level)
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
