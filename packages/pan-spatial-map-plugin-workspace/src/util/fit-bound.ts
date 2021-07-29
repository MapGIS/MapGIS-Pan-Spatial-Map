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

export const fitBoundByLayer = (layer: Layer, mapParams: MapParams) => {
  const { webGlobe, map, Cesium, CesiumZondy } = mapParams

  const sceneController = Objects.SceneController.getInstance(
    Cesium,
    CesiumZondy,
    webGlobe
  )

  const { type } = layer

  let id = ''
  let fullExtent: Bound | null = null

  // 1.获取图层全图范围 
  if (type !== LayerType.IGSScene)
  {
    // 1.1 非三维图层直接从图层上取范围

    fullExtent = layer.fullExtent

  }
  else{
    // 1.2 三维图层的范围需要单独计算范围
    // 1.2.1 三维模型缓存子图层中记录的是模型在局部坐标系下的范围,需要转换为经纬度下的范围。
    // 1.2.2 三维地形子图层直接采用子图层中记录的范围。
    let activeScene:Scene
      const {
        activeScene: { sublayers },
        fullExtent: { zmin, zmax }
      } = layer

      sublayers.forEach(item => {
        if (item.visible) {
          id = item.id
          if (item.renderType === IGSSceneSublayerRenderType.elevation) {
            range = item.range
          }
        }
      })
    
      let extent: Bound | null = null
    
      if (!range) {
        const { source } = sceneController.findSource(id)
        if (source && source.length > 0) {
          const tranform = source[0].root.transform
          const bound: Bound = sceneController.localExtentToGlobelExtent(
            { xmin, xmax, ymin, ymax, zmin, zmax },
            tranform
          )
    
          extent = {
            xmin: bound.xmin,
            ymin: bound.ymin,
            xmax: bound.xmax,
            ymax: bound.ymax
          }
        }
  }
  
  // 2.将全图范围统一转换为经纬度
  if (
    layer.spatialReference &&
    layer.spatialReference.wkid === CoordinateSystemType.webMercator
  ) {
    const xminYminConverted = CoordinateTransformation.mercatorToWGS84([
      xmin,
      ymin
    ])
    const xmaxYmaxConverted = CoordinateTransformation.mercatorToWGS84([
      xmax,
      ymax
    ])

    xmin = xminYminConverted[0]
    ymin = xminYminConverted[1]

    xmax = xmaxYmaxConverted[0]
    ymax = xmaxYmaxConverted[1]
  }

  // 3.根据图层类型的不同,进行不同的复位操作。
  // a.瓦片图层(IGSTile、ArcGISTile、OGCWMTS)将视图跳转到以图层全图范围为中心，以瓦片支持的最小级别为级别的视图下。
  // b.其它图层，将当前视图跳转到以图层全图范围为范围的视图下。

  if (type !== LayerType.IGSScene) {
    const extent: Bound = {
      xmin,
      ymin,
      xmax,
      ymax
    }
    fitBound2D(extent, mapParams)
    fitBound3D(extent, mapParams)
  } else {
    const {
      activeScene: { sublayers },
      fullExtent: { zmin, zmax }
    } = layer

    let id = ''
    let range: Bound | null = null

    sublayers.forEach(item => {
      if (item.visible) {
        id = item.id
        if (item.renderType === IGSSceneSublayerRenderType.elevation) {
          range = item.range
        }
      }
    })

    let extent: Bound | null = null

    if (!range) {
      const { source } = sceneController.findSource(id)
      if (source && source.length > 0) {
        const tranform = source[0].root.transform
        const bound: Bound = sceneController.localExtentToGlobelExtent(
          { xmin, xmax, ymin, ymax, zmin, zmax },
          tranform
        )

        extent = {
          xmin: bound.xmin,
          ymin: bound.ymin,
          xmax: bound.xmax,
          ymax: bound.ymax
        }
      }
    } else {
      extent = {
        xmin: range.xmin,
        ymin: range.ymin,
        xmax: range.xmax,
        ymax: range.ymax
      }
    }
    if (extent) {
      fitBound3D(extent, mapParams)
    }
  }
}

export const fitBound2D = (bound: Bound, mapParams: MapParams) => {
  const { xmin, ymin, xmax, ymax } = bound
  const { map } = mapParams
  map.fitBounds([xmin, ymin, xmax, ymax])
}

export const fitBound3D = (bound: Bound, mapParams: MapParams) => {
  const { xmin, ymin, xmax, ymax } = bound
  const { webGlobe, Cesium } = mapParams
  const rectangle = new Cesium.Rectangle.fromDegrees(xmin, ymin, xmax, ymax)
  webGlobe.viewer.camera.flyTo({
    destination: rectangle
  })
}
