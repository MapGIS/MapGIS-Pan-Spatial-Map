import {
  Layer,
  CoordinateTransformation,
  CoordinateSystemType,
  LayerType,
  IGSSceneSublayerRenderType,
  Objects
} from '@mapgis/web-app-framework'

export interface Bound {
  xmin: number
  ymin: number
  xmax: number
  ymax: number
}

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
  let {
    fullExtent: { xmin, xmax, ymin, ymax }
  } = layer
  const { type } = layer
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
