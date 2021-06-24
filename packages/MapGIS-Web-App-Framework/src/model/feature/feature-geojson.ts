import * as Zondy from '@mapgis/webclient-es6-service'
import { GeometryExp } from '../objects/geometry'
/**
 * GeoJSON的SpatialAttr结构
 */
export interface GMetaInfoGeoSpatialAttr {
  xmin?: number
  ymin?: number
  xmax?: number
  ymax?: number
  srefID?: number
}

/**
 * GeoJSON的MetaInfo Geometry结构
 */
export interface GMetaInfoGeometry {
  fields?: Array<Record<string, unknown>>
  spatialAttr?: GMetaInfoGeoSpatialAttr
}

/**
 * GeoJSON的MetaInfo结构
 */
export interface GMetaInfo {
  name?: string
  geometry?: GMetaInfoGeometry
}

/**
 * GeoJSON的CRS结构
 */
export interface GeoCRS {
  type?: string
  properties?: Record<string, unknown>
}

/**
 * GeoJSON的Geometry结构
 */
export interface GGeometry {
  type: string
  coordinates: Array<any>
  crs?: GeoCRS
}

/**
 * GeoJSON的Feature结构
 */
export interface GFeature {
  type: string
  properties: Record<string, unknown>
  geometry: GGeometry
  bound?: Record<string, unknown>
}

/**
 * GeoJSON结构
 */
export interface FeatureGeoJSON {
  type: string
  features: GFeature[]
  errorCode?: number
  dataCount?: number
  metaInfo?: GMetaInfo
}

/**
 *
 * @param feature 获取GeoJSON要素的中心点坐标
 */
export function getGeoJSONFeatureCenter(feature: GFeature) {
  const { geometry } = feature
  let center: number[] = []
  switch (geometry.type) {
    case 'Point':
      center = geometry.coordinates
      break
    case 'LineString':
      const a = Math.floor(geometry.coordinates.length / 2)
      center = geometry.coordinates[a]
      break
    case 'Polygon':
      center = GeometryExp.getCenterOfGravityPoint(geometry.coordinates[0])
      break
    case 'MultiPolygon':
      const coordinates = geometry.coordinates
      const centers: number[][] = []
      for (let i = 0; i < coordinates.length; i += 1) {
        const tempCenter = GeometryExp.getCenterOfGravityPoint(
          coordinates[i][0]
        )
        if (tempCenter) {
          centers.push(tempCenter)
        }
      }
      centers.push(centers[0])
      center = centers[0]
      if (centers.length === 3) {
        center = [
          (centers[0][0] + centers[1][0]) / 2,
          (centers[0][1] + centers[1][1]) / 2
        ]
      } else if (centers.length > 3) {
        center = GeometryExp.getCenterOfGravityPoint(centers)
      }
      break
    default:
      break
  }
  return center
}

/**
 * 获取一组要素的中心
 * @param features
 */
export function getGeoJSONFeaturesCenter(features: GFeature[]) {
  const centers: number[][] = []
  for (let i = 0; i < features.length; i += 1) {
    const feature = features[i]
    const featureCenter = getGeoJSONFeatureCenter(feature)
    if (featureCenter.length > 0) {
      centers.push(featureCenter)
    }
  }
  centers.push(centers[0])
  let center = centers[0]
  if (centers.length === 3) {
    center = [
      (centers[0][0] + centers[1][0]) / 2,
      (centers[0][1] + centers[1][1]) / 2
    ]
  } else if (centers.length > 3) {
    center = GeometryExp.getCenterOfGravityPoint(centers)
  }
  return center
}

/**
 * 获取GeoJSON的外包矩形
 * @param feature GeoJSON的Feature
 */
export function getGeoJSONFeatureBound(feature: GFeature) {
  // 获取所有坐标值（0：x，1：y)
  const getNumbers = (coordinates: unknown[], index: number): number[] => {
    const obj = coordinates[index]
    if (typeof obj === 'number') {
      return [obj]
    }

    if (Array.isArray(coordinates[0])) {
      const arr = coordinates.map(item => getNumbers(item as unknown[], index))
      return arr.reduce((a: number[], b: number[]) => [...a, ...b])
    }

    return []
  }

  const {
    geometry: { coordinates }
  } = feature
  const x = getNumbers(coordinates, 0)
  const y = getNumbers(coordinates, 1)
  return {
    xmin: Math.min(...x),
    ymin: Math.min(...y),
    xmax: Math.max(...x),
    ymax: Math.max(...y)
  }
}
